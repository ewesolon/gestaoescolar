const db = require('../database');
const reservaSaldoService = require('../services/reservaSaldoService');
const validacaoLimites = require('../middleware/validacaoLimitesContratuais');

/**
 * Controller para gerenciar movimentações de consumo de contratos
 * Fornece endpoints para registrar, consultar e gerenciar o consumo de contratos
 */
class MovimentacaoConsumoContratoController {
  
  /**
   * Lista movimentações de consumo com filtros
   * GET /api/movimentacoes-consumo
   */
  async listarMovimentacoes(req, res) {
    try {
      const {
        contrato_id,
        contrato_produto_id,
        tipo,
        data_inicio,
        data_fim,
        usuario_id,
        documento_referencia,
        page = 1,
        limit = 50
      } = req.query;
      
      let query = `
        SELECT 
          mcc.id,
          mcc.contrato_produto_id,
          mcc.tipo,
          mcc.quantidade_utilizada,
          mcc.valor_utilizado,
          mcc.justificativa,
          mcc.data_movimentacao,
          mcc.usuario_id,
          mcc.observacoes,
          mcc.documento_referencia,
          mcc.created_at,
          vsci.produto_nome,
          vsci.produto_unidade,
          vsci.contrato_numero,
          u.nome as usuario_nome
        FROM movimentacoes_consumo_contratos mcc
        JOIN view_saldo_contratos_itens vsci ON mcc.contrato_produto_id = vsci.contrato_produto_id
        LEFT JOIN usuarios u ON mcc.usuario_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      if (contrato_id) {
        query += ` AND vsci.contrato_id = $${paramIndex}`;
        params.push(contrato_id);
        paramIndex++;
      }
      
      if (contrato_produto_id) {
        query += ` AND mcc.contrato_produto_id = $${paramIndex}`;
        params.push(contrato_produto_id);
        paramIndex++;
      }
      
      if (tipo) {
        query += ` AND mcc.tipo = $${paramIndex}`;
        params.push(tipo);
        paramIndex++;
      }
      
      if (data_inicio) {
        query += ` AND mcc.data_movimentacao >= $${paramIndex}`;
        params.push(data_inicio);
        paramIndex++;
      }
      
      if (data_fim) {
        query += ` AND mcc.data_movimentacao <= $${paramIndex}`;
        params.push(data_fim);
        paramIndex++;
      }
      
      if (usuario_id) {
        query += ` AND mcc.usuario_id = $${paramIndex}`;
        params.push(usuario_id);
        paramIndex++;
      }
      
      if (documento_referencia) {
        query += ` AND mcc.documento_referencia ILIKE $${paramIndex}`;
        params.push(`%${documento_referencia}%`);
        paramIndex++;
      }
      
      // Contar total de registros
      const countQuery = query.replace(
        /SELECT[\s\S]*?FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      
      const countResult = await db.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);
      
      // Adicionar ordenação e paginação
      query += ` ORDER BY mcc.data_movimentacao DESC, mcc.created_at DESC`;
      
      const offset = (page - 1) * limit;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await db.query(query, params);
      
      res.json({
        movimentacoes: result.rows,
        paginacao: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Erro ao listar movimentações:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_LISTAR_MOVIMENTACOES'
      });
    }
  }
  
  /**
   * Registra uma nova movimentação de consumo
   * POST /api/movimentacoes-consumo
   */
  async registrarMovimentacao(req, res) {
    try {
      const {
        contrato_produto_id,
        tipo,
        quantidade_utilizada,
        valor_utilizado,
        justificativa,
        observacoes,
        documento_referencia
      } = req.body;
      
      const usuario_id = req.user?.id || req.body.usuario_id;
      
      // Validações básicas
      if (!contrato_produto_id || !tipo || !quantidade_utilizada || !justificativa) {
        return res.status(400).json({
          erro: 'Campos obrigatórios: contrato_produto_id, tipo, quantidade_utilizada, justificativa',
          codigo: 'CAMPOS_OBRIGATORIOS'
        });
      }
      
      const tiposValidos = ['CONSUMO', 'ESTORNO', 'AJUSTE', 'RESERVA', 'LIBERACAO_RESERVA'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          erro: `Tipo deve ser um dos: ${tiposValidos.join(', ')}`,
          codigo: 'TIPO_INVALIDO'
        });
      }
      
      // Verificar se o item de contrato existe
      const itemResult = await db.query(`
        SELECT 
          vsci.*
        FROM view_saldo_contratos_itens vsci
        WHERE vsci.contrato_produto_id = $1
      `, [contrato_produto_id]);
      
      if (itemResult.rows.length === 0) {
        return res.status(404).json({
          erro: 'Item de contrato não encontrado',
          codigo: 'ITEM_NAO_ENCONTRADO'
        });
      }
      
      const item = itemResult.rows[0];
      
      // Validações específicas por tipo
      if (tipo === 'CONSUMO' || tipo === 'RESERVA') {
        // Verificar se há saldo suficiente
        const saldoDisponivel = tipo === 'CONSUMO' ? 
          item.quantidade_disponivel : item.quantidade_disponivel_real;
          
        if (saldoDisponivel < quantidade_utilizada) {
          return res.status(400).json({
            erro: 'Saldo insuficiente para a operação',
            codigo: 'SALDO_INSUFICIENTE',
            saldo_disponivel: saldoDisponivel,
            quantidade_solicitada: quantidade_utilizada
          });
        }
      }
      
      if (tipo === 'ESTORNO' || tipo === 'LIBERACAO_RESERVA') {
        // Verificar se há consumo/reserva suficiente para estornar
        const tipoOriginal = tipo === 'ESTORNO' ? 'CONSUMO' : 'RESERVA';
        
        const consumoResult = await db.query(`
          SELECT 
            COALESCE(SUM(CASE 
              WHEN tipo = $2 THEN quantidade_utilizada 
              WHEN tipo = $3 THEN -quantidade_utilizada
              ELSE 0
            END), 0) as saldo_tipo
          FROM movimentacoes_consumo_contratos
          WHERE contrato_produto_id = $1
            AND tipo IN ($2, $3)
        `, [contrato_produto_id, tipoOriginal, tipo]);
        
        const saldoTipo = parseFloat(consumoResult.rows[0].saldo_tipo || 0);
        
        if (saldoTipo < quantidade_utilizada) {
          return res.status(400).json({
            erro: `Não há ${tipoOriginal.toLowerCase()} suficiente para estornar`,
            codigo: 'ESTORNO_INSUFICIENTE',
            saldo_disponivel: saldoTipo,
            quantidade_solicitada: quantidade_utilizada
          });
        }
      }
      
      // Registrar a movimentação
      const result = await db.query(`
        INSERT INTO movimentacoes_consumo_contratos (
          contrato_produto_id,
          tipo,
          quantidade_utilizada,
          valor_utilizado,
          justificativa,
          data_movimentacao,
          usuario_id,
          observacoes,
          documento_referencia
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8)
        RETURNING *
      `, [
        contrato_produto_id,
        tipo,
        quantidade_utilizada,
        valor_utilizado,
        justificativa,
        usuario_id,
        observacoes,
        documento_referencia
      ]);
      
      const movimentacao = result.rows[0];
      
      // Buscar dados completos da movimentação criada
      const movimentacaoCompleta = await db.query(`
        SELECT 
          mcc.*,
          vsci.produto_nome,
          vsci.produto_unidade,
          vsci.contrato_numero,
          u.nome as usuario_nome
        FROM movimentacoes_consumo_contratos mcc
        JOIN view_saldo_contratos_itens vsci ON mcc.contrato_produto_id = vsci.contrato_produto_id
        LEFT JOIN usuarios u ON mcc.usuario_id = u.id
        WHERE mcc.id = $1
      `, [movimentacao.id]);
      
      res.status(201).json({
        movimentacao: movimentacaoCompleta.rows[0],
        mensagem: 'Movimentação registrada com sucesso'
      });
      
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_REGISTRAR_MOVIMENTACAO'
      });
    }
  }
  
  /**
   * Consulta saldos de contratos por fornecedor
   * GET /api/saldos-contratos/:fornecedor_id
   */
  async consultarSaldosPorFornecedor(req, res) {
    try {
      const { fornecedor_id } = req.params;
      const { incluir_esgotados = false } = req.query;
      
      let query = `
        SELECT 
          vsci.*
        FROM view_saldo_contratos_itens vsci
        JOIN contratos c ON vsci.contrato_id = c.id
        WHERE c.fornecedor_id = $1
      `;
      
      const params = [fornecedor_id];
      
      if (!incluir_esgotados) {
        query += ` AND vsci.status != 'ESGOTADO'`;
      }
      
      query += ` ORDER BY vsci.contrato_numero, vsci.produto_nome`;
      
      const result = await db.query(query, params);
      
      // Agrupar por contrato
      const contratos = {};
      
      result.rows.forEach(item => {
        if (!contratos[item.contrato_id]) {
          contratos[item.contrato_id] = {
            contrato_id: item.contrato_id,
            contrato_numero: item.contrato_numero,
            data_inicio: item.data_inicio,
            data_fim: item.data_fim,
            itens: []
          };
        }
        
        contratos[item.contrato_id].itens.push(item);
      });
      
      res.json({
        fornecedor_id: parseInt(fornecedor_id),
        contratos: Object.values(contratos)
      });
      
    } catch (error) {
      console.error('Erro ao consultar saldos por fornecedor:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_CONSULTAR_SALDOS'
      });
    }
  }
  
  /**
   * Consulta histórico de movimentações de um item específico
   * GET /api/movimentacoes-consumo/item/:contrato_produto_id
   */
  async consultarHistoricoItem(req, res) {
    try {
      const { contrato_produto_id } = req.params;
      const { limit = 100 } = req.query;
      
      const result = await db.query(`
        SELECT 
          mcc.*,
          u.nome as usuario_nome
        FROM movimentacoes_consumo_contratos mcc
        LEFT JOIN usuarios u ON mcc.usuario_id = u.id
        WHERE mcc.contrato_produto_id = $1
        ORDER BY mcc.data_movimentacao DESC, mcc.created_at DESC
        LIMIT $2
      `, [contrato_produto_id, limit]);
      
      // Buscar informações do item
      const itemResult = await db.query(`
        SELECT * FROM view_saldo_contratos_itens
        WHERE contrato_produto_id = $1
      `, [contrato_produto_id]);
      
      if (itemResult.rows.length === 0) {
        return res.status(404).json({
          erro: 'Item de contrato não encontrado',
          codigo: 'ITEM_NAO_ENCONTRADO'
        });
      }
      
      res.json({
        item: itemResult.rows[0],
        historico: result.rows
      });
      
    } catch (error) {
      console.error('Erro ao consultar histórico do item:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_CONSULTAR_HISTORICO'
      });
    }
  }
  
  /**
   * Gera relatório de consumo por período
   * GET /api/relatorios/consumo-contratos
   */
  async gerarRelatorioConsumo(req, res) {
    try {
      const {
        data_inicio,
        data_fim,
        contrato_id,
        fornecedor_id,
        tipo = 'CONSUMO'
      } = req.query;
      
      if (!data_inicio || !data_fim) {
        return res.status(400).json({
          erro: 'Parâmetros data_inicio e data_fim são obrigatórios',
          codigo: 'PARAMETROS_OBRIGATORIOS'
        });
      }
      
      let query = `
        SELECT 
          vsci.contrato_id,
          vsci.contrato_numero,
          vsci.produto_id,
          vsci.produto_nome,
          vsci.produto_unidade,
          c.fornecedor_id,
          f.nome as fornecedor_nome,
          SUM(mcc.quantidade_utilizada) as quantidade_total,
          SUM(mcc.valor_utilizado) as valor_total,
          COUNT(mcc.id) as total_movimentacoes,
          MIN(mcc.data_movimentacao) as primeira_movimentacao,
          MAX(mcc.data_movimentacao) as ultima_movimentacao
        FROM movimentacoes_consumo_contratos mcc
        JOIN view_saldo_contratos_itens vsci ON mcc.contrato_produto_id = vsci.contrato_produto_id
        JOIN contratos c ON vsci.contrato_id = c.id
        LEFT JOIN fornecedores f ON c.fornecedor_id = f.id
        WHERE mcc.data_movimentacao BETWEEN $1 AND $2
          AND mcc.tipo = $3
      `;
      
      const params = [data_inicio, data_fim, tipo];
      let paramIndex = 4;
      
      if (contrato_id) {
        query += ` AND vsci.contrato_id = $${paramIndex}`;
        params.push(contrato_id);
        paramIndex++;
      }
      
      if (fornecedor_id) {
        query += ` AND c.fornecedor_id = $${paramIndex}`;
        params.push(fornecedor_id);
        paramIndex++;
      }
      
      query += `
        GROUP BY 
          vsci.contrato_id, vsci.contrato_numero, vsci.produto_id, 
          vsci.produto_nome, vsci.produto_unidade, c.fornecedor_id, f.nome
        ORDER BY quantidade_total DESC
      `;
      
      const result = await db.query(query, params);
      
      // Calcular totais gerais
      const totais = result.rows.reduce((acc, row) => {
        acc.quantidade_total += parseFloat(row.quantidade_total || 0);
        acc.valor_total += parseFloat(row.valor_total || 0);
        acc.total_movimentacoes += parseInt(row.total_movimentacoes || 0);
        return acc;
      }, { quantidade_total: 0, valor_total: 0, total_movimentacoes: 0 });
      
      res.json({
        parametros: {
          data_inicio,
          data_fim,
          tipo,
          contrato_id,
          fornecedor_id
        },
        totais,
        detalhes: result.rows
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório de consumo:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_GERAR_RELATORIO'
      });
    }
  }
  
  /**
   * Valida limites contratuais para itens
   * POST /api/validar-limites-contratuais
   */
  async validarLimitesContratuais(req, res) {
    try {
      const { itens } = req.body;
      
      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          erro: 'Array de itens é obrigatório',
          codigo: 'ITENS_OBRIGATORIOS'
        });
      }
      
      const resultado = await validacaoLimites.validarLimitesItens(itens);
      
      res.json(resultado);
      
    } catch (error) {
      console.error('Erro ao validar limites contratuais:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_VALIDAR_LIMITES'
      });
    }
  }
  
  /**
   * Consulta reservas ativas por documento
   * GET /api/reservas-ativas/:documento_referencia
   */
  async consultarReservasAtivas(req, res) {
    try {
      const { documento_referencia } = req.params;
      
      const reservas = await reservaSaldoService.consultarReservasAtivas(documento_referencia);
      
      res.json({
        documento_referencia,
        reservas
      });
      
    } catch (error) {
      console.error('Erro ao consultar reservas ativas:', error);
      res.status(500).json({
        erro: 'Erro interno do servidor',
        codigo: 'ERRO_CONSULTAR_RESERVAS'
      });
    }
  }
}

module.exports = new MovimentacaoConsumoContratoController();