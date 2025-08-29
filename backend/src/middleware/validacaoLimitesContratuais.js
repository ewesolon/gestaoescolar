const db = require('../database');

/**
 * Middleware para validação de limites contratuais
 * Verifica se os itens do pedido não excedem os limites dos contratos
 * antes de permitir a criação do pedido
 */
class ValidacaoLimitesContratuais {
  
  /**
   * Valida se os itens do carrinho/pedido respeitam os limites contratuais
   * @param {Array} itens - Array de itens [{contrato_produto_id, quantidade, preco_unitario}]
   * @returns {Promise<Object>} Resultado da validação
   */
  async validarLimitesItens(itens) {
    try {
      const errosValidacao = [];
      const itensValidados = [];
      
      for (const item of itens) {
        const { contrato_produto_id, quantidade, preco_unitario } = item;
        
        // Buscar informações do saldo do contrato
        const saldoResult = await db.query(`
          SELECT 
            contrato_produto_id,
            produto_nome,
            produto_unidade,
            contrato_numero,
            data_inicio,
            data_fim,
            quantidade_total,
            quantidade_utilizada,
            quantidade_disponivel,
            quantidade_reservada,
            quantidade_disponivel_real,
            valor_unitario,
            status,
            percentual_utilizado
          FROM view_saldo_contratos_itens 
          WHERE contrato_produto_id = $1
        `, [contrato_produto_id]);
        
        if (saldoResult.rows.length === 0) {
          errosValidacao.push({
            contrato_produto_id,
            tipo_erro: 'CONTRATO_NAO_ENCONTRADO',
            mensagem: 'Item de contrato não encontrado',
            quantidade_solicitada: quantidade
          });
          continue;
        }
        
        const saldo = saldoResult.rows[0];
        
        // Verificar se o contrato está vigente
        const dataAtual = new Date();
        const dataInicio = new Date(saldo.data_inicio);
        const dataFim = new Date(saldo.data_fim);
        
        if (dataAtual < dataInicio || dataAtual > dataFim) {
          errosValidacao.push({
            contrato_produto_id,
            produto: saldo.produto_nome,
            contrato: saldo.contrato_numero,
            tipo_erro: 'CONTRATO_FORA_VIGENCIA',
            mensagem: `Contrato fora do período de vigência (${saldo.data_inicio} a ${saldo.data_fim})`,
            quantidade_solicitada: quantidade,
            data_inicio: saldo.data_inicio,
            data_fim: saldo.data_fim
          });
          continue;
        }
        
        // Verificar se o contrato não está esgotado
        if (saldo.status === 'ESGOTADO') {
          errosValidacao.push({
            contrato_produto_id,
            produto: saldo.produto_nome,
            contrato: saldo.contrato_numero,
            tipo_erro: 'CONTRATO_ESGOTADO',
            mensagem: 'Contrato esgotado - sem saldo disponível',
            quantidade_solicitada: quantidade,
            quantidade_disponivel: saldo.quantidade_disponivel_real
          });
          continue;
        }
        
        // Verificar se há saldo suficiente (considerando reservas)
        if (saldo.quantidade_disponivel_real < quantidade) {
          errosValidacao.push({
            contrato_produto_id,
            produto: saldo.produto_nome,
            contrato: saldo.contrato_numero,
            tipo_erro: 'SALDO_INSUFICIENTE',
            mensagem: 'Saldo insuficiente no contrato',
            quantidade_solicitada: quantidade,
            quantidade_disponivel: saldo.quantidade_disponivel_real,
            quantidade_total: saldo.quantidade_total,
            quantidade_utilizada: saldo.quantidade_utilizada,
            quantidade_reservada: saldo.quantidade_reservada
          });
          continue;
        }
        
        // Verificar se o preço está dentro da faixa aceitável (tolerância de 10%)
        const precoContrato = parseFloat(saldo.valor_unitario);
        const precoSolicitado = parseFloat(preco_unitario || 0);
        const toleranciaPreco = 0.10; // 10%
        
        if (precoSolicitado > 0 && precoContrato > 0) {
          const diferencaPercentual = Math.abs(precoSolicitado - precoContrato) / precoContrato;
          
          if (diferencaPercentual > toleranciaPreco) {
            errosValidacao.push({
              contrato_produto_id,
              produto: saldo.produto_nome,
              contrato: saldo.contrato_numero,
              tipo_erro: 'PRECO_FORA_TOLERANCIA',
              mensagem: `Preço fora da tolerância permitida (${(toleranciaPreco * 100)}%)`,
              quantidade_solicitada: quantidade,
              preco_contrato: precoContrato,
              preco_solicitado: precoSolicitado,
              diferenca_percentual: (diferencaPercentual * 100).toFixed(2)
            });
            continue;
          }
        }
        
        // Alertar se o consumo levará o contrato para baixo estoque
        const novoPercentualUtilizado = ((saldo.quantidade_utilizada + quantidade) / saldo.quantidade_total) * 100;
        const alertaBaixoEstoque = novoPercentualUtilizado >= 90;
        
        // Item validado com sucesso
        itensValidados.push({
          contrato_produto_id,
          produto: saldo.produto_nome,
          contrato: saldo.contrato_numero,
          quantidade_solicitada: quantidade,
          quantidade_disponivel: saldo.quantidade_disponivel_real,
          preco_unitario: preco_unitario || precoContrato,
          valor_total: quantidade * (preco_unitario || precoContrato),
          percentual_utilizado_atual: saldo.percentual_utilizado,
          percentual_utilizado_pos_pedido: novoPercentualUtilizado,
          alerta_baixo_estoque: alertaBaixoEstoque,
          status_atual: saldo.status
        });
      }
      
      return {
        valido: errosValidacao.length === 0,
        erros: errosValidacao,
        itens_validados: itensValidados,
        total_itens: itens.length,
        itens_com_erro: errosValidacao.length,
        itens_validos: itensValidados.length
      };
      
    } catch (error) {
      console.error('Erro na validação de limites contratuais:', error);
      throw error;
    }
  }
  
  /**
   * Middleware Express para validação automática
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async middleware(req, res, next) {
    try {
      // Extrair itens do body da requisição
      const itens = req.body.itens || req.body.items || [];
      
      if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({
          erro: 'Nenhum item fornecido para validação',
          codigo: 'ITENS_OBRIGATORIOS'
        });
      }
      
      // Validar itens
      const resultadoValidacao = await this.validarLimitesItens(itens);
      
      // Adicionar resultado da validação ao request para uso posterior
      req.validacaoLimites = resultadoValidacao;
      
      // Se houver erros, retornar erro 400
      if (!resultadoValidacao.valido) {
        return res.status(400).json({
          erro: 'Itens não passaram na validação de limites contratuais',
          codigo: 'VALIDACAO_LIMITES_FALHOU',
          detalhes: resultadoValidacao
        });
      }
      
      // Se tudo estiver válido, continuar para o próximo middleware
      next();
      
    } catch (error) {
      console.error('Erro no middleware de validação de limites:', error);
      res.status(500).json({
        erro: 'Erro interno na validação de limites contratuais',
        codigo: 'ERRO_INTERNO_VALIDACAO'
      });
    }
  }
  
  /**
   * Valida um único item de contrato
   * @param {number} contratoProtudoId - ID do item de contrato
   * @param {number} quantidade - Quantidade solicitada
   * @param {number} precoUnitario - Preço unitário (opcional)
   * @returns {Promise<Object>} Resultado da validação
   */
  async validarItemUnico(contratoProtudoId, quantidade, precoUnitario = null) {
    const resultado = await this.validarLimitesItens([{
      contrato_produto_id: contratoProtudoId,
      quantidade,
      preco_unitario: precoUnitario
    }]);
    
    return {
      valido: resultado.valido,
      erro: resultado.erros[0] || null,
      item_validado: resultado.itens_validados[0] || null
    };
  }
  
  /**
   * Gera relatório de status dos contratos
   * @param {Array} contratoIds - IDs dos contratos para verificar (opcional)
   * @returns {Promise<Array>} Relatório de status
   */
  async gerarRelatorioStatusContratos(contratoIds = null) {
    try {
      let query = `
        SELECT 
          contrato_id,
          contrato_numero,
          COUNT(*) as total_itens,
          SUM(CASE WHEN status = 'DISPONIVEL' THEN 1 ELSE 0 END) as itens_disponiveis,
          SUM(CASE WHEN status = 'BAIXO_ESTOQUE' THEN 1 ELSE 0 END) as itens_baixo_estoque,
          SUM(CASE WHEN status = 'ESGOTADO' THEN 1 ELSE 0 END) as itens_esgotados,
          AVG(percentual_utilizado) as percentual_medio_utilizado,
          MIN(data_fim) as data_fim_mais_proxima
        FROM view_saldo_contratos_itens
      `;
      
      const params = [];
      
      if (contratoIds && contratoIds.length > 0) {
        query += ` WHERE contrato_id = ANY($1)`;
        params.push(contratoIds);
      }
      
      query += `
        GROUP BY contrato_id, contrato_numero
        ORDER BY percentual_medio_utilizado DESC
      `;
      
      const result = await db.query(query, params);
      
      return result.rows.map(row => ({
        ...row,
        status_geral: this.determinarStatusGeralContrato(row),
        percentual_medio_utilizado: parseFloat(row.percentual_medio_utilizado || 0).toFixed(2)
      }));
      
    } catch (error) {
      console.error('Erro ao gerar relatório de status dos contratos:', error);
      throw error;
    }
  }
  
  /**
   * Determina o status geral de um contrato baseado nos itens
   * @param {Object} dadosContrato - Dados agregados do contrato
   * @returns {string} Status geral
   */
  determinarStatusGeralContrato(dadosContrato) {
    const { itens_esgotados, itens_baixo_estoque, total_itens, percentual_medio_utilizado } = dadosContrato;
    
    if (itens_esgotados > 0) {
      return itens_esgotados === total_itens ? 'TOTALMENTE_ESGOTADO' : 'PARCIALMENTE_ESGOTADO';
    }
    
    if (itens_baixo_estoque > 0) {
      return 'BAIXO_ESTOQUE';
    }
    
    if (percentual_medio_utilizado >= 70) {
      return 'ATENCAO';
    }
    
    return 'DISPONIVEL';
  }
}

module.exports = new ValidacaoLimitesContratuais();