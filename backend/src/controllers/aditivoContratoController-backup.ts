import { Request, Response } from "express";
const { db } = require("../database");
import { aplicarAditivoQuantidadeGlobal, aplicarAditivoQuantidadeEspecifica, deleteAditivoContrato, reaplicarAditivo, validarLimitesAditivo } from "../models/AditivoContrato";

export async function listarAditivosContrato(req: Request, res: Response) {
  try {
    const { contrato_id } = req.params;
    const { tipo, aprovado, page = 1, limit = 50 } = req.query;
    
    let whereClause = 'a.contrato_id = $1 AND a.ativo = true';
    const params: any[] = [contrato_id];
    let paramCount = 1;
    
    // Filtro por tipo
    if (tipo) {
      paramCount++;
      whereClause += ` AND a.tipo = $${paramCount}`;
      params.push(tipo);
    }
    
    // Filtro por aprovação
    if (aprovado !== undefined) {
      paramCount++;
      if (aprovado === 'true') {
        whereClause += ` AND a.aprovado_por IS NOT NULL`;
      } else {
        whereClause += ` AND a.aprovado_por IS NULL`;
      }
    }
    
    // Paginação
    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;
    params.push(Number(limit), offset);
    
    const aditivosResult = await db.query(`
      SELECT 
        a.id,
        a.contrato_id,
        a.numero_aditivo,
        a.tipo,
        a.data_assinatura,
        a.data_inicio_vigencia,
        a.data_fim_vigencia,
        a.prazo_adicional_dias,
        a.nova_data_fim,
        a.percentual_acrescimo,
        a.valor_original,
        a.valor_aditivo,
        a.valor_total_atualizado,
        a.justificativa,
        a.fundamentacao_legal,
        a.numero_processo,
        a.ativo,
        a.criado_por,
        a.aprovado_por,
        a.data_aprovacao,
        a.observacoes,
        a.created_at,
        c.numero as contrato_numero,
        f.nome as fornecedor_nome,
        u1.nome as criado_por_nome,
        u2.nome as aprovado_por_nome
      FROM aditivos_contratos a
      LEFT JOIN contratos c ON a.contrato_id = c.id
      LEFT JOIN fornecedores f ON c.fornecedor_id = f.id
      LEFT JOIN usuarios u1 ON a.criado_por = u1.id
      LEFT JOIN usuarios u2 ON a.aprovado_por = u2.id
      WHERE ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `, params);

    const aditivos = aditivosResult.rows;

    // Contar total para paginação
    const totalResult = await db.query(`
      SELECT COUNT(*) as total 
      FROM aditivos_contratos a
      WHERE ${whereClause}
    `, params.slice(0, -2)); // Remove limit e offset

    res.json({
      success: true,
      data: aditivos,
      total: Number(totalResult.rows[0].total),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(totalResult.rows[0].total) / Number(limit))
    });
  } catch (error) {
    console.error('❌ Erro ao listar aditivos:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao listar aditivos do contrato.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function buscarAditivo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const aditivoResult = await db.query(`
      SELECT 
        a.*,
        c.numero as contrato_numero
      FROM aditivos_contratos a
      LEFT JOIN contratos c ON a.contrato_id = c.id
      WHERE a.id = $1
    `, [id]);

    const aditivo = aditivoResult.rows[0];

    if (!aditivo) {
      return res.status(404).json({
        success: false,
        message: "Aditivo não encontrado."
      });
    }

    res.json({
      success: true,
      data: aditivo
    });
  } catch (error) {
    console.error('❌ Erro ao buscar aditivo:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar aditivo.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function criarAditivo(req: Request, res: Response) {
  try {
    const {
      contrato_id,
      numero_aditivo,
      tipo,
      data_assinatura,
      data_inicio_vigencia,
      data_fim_vigencia,
      prazo_adicional_dias,
      nova_data_fim,
      percentual_acrescimo,
      valor_original,
      valor_aditivo,
      valor_total_atualizado,
      justificativa,
      fundamentacao_legal,
      numero_processo,
      observacoes,
      itens_especificos
    } = req.body;

    // Validações básicas
    if (!contrato_id || !numero_aditivo || !tipo || !data_assinatura || !data_inicio_vigencia || !justificativa || !fundamentacao_legal) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: contrato_id, numero_aditivo, tipo, data_assinatura, data_inicio_vigencia, justificativa, fundamentacao_legal"
      });
    }

    // Validações específicas para aditivos de quantidade
    if ((tipo === 'QUANTIDADE' || tipo === 'MISTO') && !percentual_acrescimo) {
      return res.status(400).json({
        success: false,
        message: "Percentual de acréscimo é obrigatório para aditivos de quantidade"
      });
    }

    // Validar limites legais para aditivos de quantidade
    if ((tipo === 'QUANTIDADE' || tipo === 'MISTO') && percentual_acrescimo) {
      const validacao = await validarLimitesAditivo(contrato_id, tipo, percentual_acrescimo);
      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          message: validacao.erro,
          percentualAcumulado: validacao.percentualAcumulado,
          percentualDisponivel: validacao.percentualDisponivel
        });
      }
    }

    const result = await db.query(`
      INSERT INTO aditivos_contratos (
        contrato_id, numero_aditivo, tipo, data_assinatura, data_inicio_vigencia,
        data_fim_vigencia, prazo_adicional_dias, nova_data_fim, percentual_acrescimo,
        valor_original, valor_aditivo, valor_total_atualizado, justificativa,
        fundamentacao_legal, numero_processo, observacoes, ativo, criado_por, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      contrato_id, numero_aditivo, tipo, data_assinatura, data_inicio_vigencia,
      data_fim_vigencia, prazo_adicional_dias, nova_data_fim, percentual_acrescimo,
      valor_original, valor_aditivo, valor_total_atualizado, justificativa,
      fundamentacao_legal, numero_processo, observacoes, true, 1
    ]);

    const aditivoCriado = result.rows[0];

    // Aplicar aditivo automaticamente se for de quantidade
    if (tipo === 'QUANTIDADE' || tipo === 'MISTO') {
      try {
        if (itens_especificos && itens_especificos.length > 0) {
          // Aplicar aditivo específico
          console.log(`🔄 Aplicando aditivo específico ID: ${aditivoCriado.id}`);
          await aplicarAditivoQuantidadeEspecifica(aditivoCriado.id, itens_especificos);
          console.log(`✅ Aditivo específico aplicado com sucesso`);
        } else {
          // Aplicar aditivo global
          console.log(`🔄 Aplicando aditivo global ID: ${aditivoCriado.id}`);
          await aplicarAditivoQuantidadeGlobal(aditivoCriado.id, percentual_acrescimo);
          console.log(`✅ Aditivo global aplicado com sucesso`);
        }
      } catch (aplicacaoError: any) {
        console.error('❌ Erro ao aplicar aditivo:', aplicacaoError);
        // Não falhar a criação do aditivo, apenas logar o erro
        // O aditivo pode ser aplicado manualmente depois
      }
    }

    res.status(201).json({
      success: true,
      message: "Aditivo criado com sucesso",
      data: aditivoCriado
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar aditivo:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao criar aditivo.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function editarAditivo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      numero_aditivo,
      tipo,
      data_assinatura,
      data_inicio_vigencia,
      data_fim_vigencia,
      prazo_adicional_dias,
      nova_data_fim,
      percentual_acrescimo,
      valor_original,
      valor_aditivo,
      valor_total_atualizado,
      justificativa,
      fundamentacao_legal,
      numero_processo,
      observacoes,
    } = req.body;

    // Buscar o aditivo atual para obter o contrato_id e validar limites
    const aditivoAtual = await db.query('SELECT contrato_id FROM aditivos_contratos WHERE id = $1', [id]);
    if (aditivoAtual.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aditivo não encontrado"
      });
    }

    const contrato_id = aditivoAtual.rows[0].contrato_id;

    // Validar limites legais para aditivos de quantidade (excluindo o aditivo atual)
    if ((tipo === 'QUANTIDADE' || tipo === 'MISTO') && percentual_acrescimo) {
      const validacao = await validarLimitesAditivo(contrato_id, tipo, percentual_acrescimo, parseInt(id as string));
      
      if (!validacao.valido) {
        return res.status(400).json({
          success: false,
          message: validacao.erro,
          percentualAcumulado: validacao.percentualAcumulado,
          percentualDisponivel: validacao.percentualDisponivel
        });
      }
    }

    const result = await db.query(`
      UPDATE aditivos_contratos SET
        numero_aditivo = $1,
        tipo = $2,
        data_assinatura = $3,
        data_inicio_vigencia = $4,
        data_fim_vigencia = $5,
        prazo_adicional_dias = $6,
        nova_data_fim = $7,
        percentual_acrescimo = $8,
        valor_original = $9,
        valor_aditivo = $10,
        valor_total_atualizado = $11,
        justificativa = $12,
        fundamentacao_legal = $13,
        numero_processo = $14,
        observacoes = $15
      WHERE id = $16
      RETURNING *
    `, [
      numero_aditivo, tipo, data_assinatura, data_inicio_vigencia, data_fim_vigencia,
      prazo_adicional_dias, nova_data_fim, percentual_acrescimo, valor_original,
      valor_aditivo, valor_total_atualizado, justificativa, fundamentacao_legal,
      numero_processo, observacoes, id
    ]);

    // Reaplicar o aditivo se ele já foi aprovado e é de quantidade
    try {
      await reaplicarAditivo(parseInt(id));
    } catch (reaplicarError: any) {
      console.warn('⚠️ Aviso ao reaplicar aditivo:', reaplicarError.message);
      // Não falha a operação de edição se a reaplicação falhar
    }

    res.json({
      success: true,
      message: "Aditivo atualizado com sucesso",
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('❌ Erro ao editar aditivo:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao editar aditivo.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function removerAditivo(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar se o aditivo existe antes de tentar remover
    const aditivoExistente = await db.get(`
      SELECT * FROM aditivos_contratos WHERE id = $1
    `, [id]);

    if (!aditivoExistente) {
      return res.status(404).json({
        success: false,
        message: "Aditivo não encontrado"
      });
    }

    // Usar a função do modelo que reverte automaticamente as quantidades
    await deleteAditivoContrato(Number(id));

    res.json({
      success: true,
      message: "Aditivo removido com sucesso e quantidades revertidas"
    });
  } catch (error) {
    console.error('❌ Erro ao remover aditivo:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao remover aditivo.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function aprovarAditivo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    // Buscar o aditivo antes de aprovar
    const aditivoExistente = await db.get(`
      SELECT * FROM aditivos_contratos WHERE id = $1
    `, [id]);

    if (!aditivoExistente) {
      return res.status(404).json({
        success: false,
        message: "Aditivo não encontrado"
      });
    }

    const result = await db.query(`
      UPDATE aditivos_contratos SET
        aprovado_por = $1,
        data_aprovacao = CURRENT_TIMESTAMP,
        observacoes = $2
      WHERE id = $3
      RETURNING *
    `, [1, observacoes, id]);

    const aditivoAprovado = result.rows[0];

    // Aplicar aditivo automaticamente se for de quantidade e ainda não foi aplicado
    if ((aditivoAprovado.tipo === 'QUANTIDADE' || aditivoAprovado.tipo === 'MISTO') && aditivoAprovado.percentual_acrescimo) {
      try {
        // Verificar se já existem itens aplicados para este aditivo
        const itensExistentes = await db.all(`
          SELECT * FROM aditivos_contratos_itens WHERE aditivo_id = $1
        `, [id]);

        if (itensExistentes.length === 0) {
          // Buscar itens específicos se existirem
          const itensEspecificos = req.body.itens_especificos;
          
          if (itensEspecificos && itensEspecificos.length > 0) {
            // Aplicar aditivo específico
            console.log(`🔄 Aplicando aditivo específico na aprovação ID: ${id}`);
            await aplicarAditivoQuantidadeEspecifica(parseInt(id), itensEspecificos);
            console.log(`✅ Aditivo específico aplicado na aprovação`);
          } else {
            // Aplicar aditivo global
            console.log(`🔄 Aplicando aditivo global na aprovação ID: ${id}`);
            await aplicarAditivoQuantidadeGlobal(parseInt(id), aditivoAprovado.percentual_acrescimo);
            console.log(`✅ Aditivo global aplicado na aprovação`);
          }
        } else {
          console.log(`ℹ️ Aditivo ID: ${id} já foi aplicado anteriormente`);
        }
      } catch (aplicacaoError: any) {
        console.error('❌ Erro ao aplicar aditivo na aprovação:', aplicacaoError);
        // Não falhar a aprovação, apenas logar o erro
      }
    }

    res.json({
      success: true,
      message: "Aditivo aprovado com sucesso",
      data: aditivoAprovado
    });
  } catch (error: any) {
    console.error('❌ Erro ao aprovar aditivo:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao aprovar aditivo.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function validarLimites(req: Request, res: Response) {
  try {
    const { contrato_id } = req.params;
    const { tipo, percentual_acrescimo, aditivo_id_excluir } = req.query;

    // Validar parâmetros obrigatórios
    if (!contrato_id || !tipo) {
      return res.status(400).json({
        success: false,
        message: "Parâmetros obrigatórios: contrato_id e tipo"
      });
    }

    // Converter percentual para número se fornecido
    const percentualNum = percentual_acrescimo ? parseFloat(percentual_acrescimo as string) : undefined;
    const aditivoIdExcluir = aditivo_id_excluir ? parseInt(aditivo_id_excluir as string) : undefined;

    // Chamar a função de validação do modelo
    const validacao = await validarLimitesAditivo(
      parseInt(contrato_id as string),
      tipo as string,
      percentualNum,
      aditivoIdExcluir
    );

    res.json({
      success: true,
      ...validacao
    });
  } catch (error: any) {
    console.error('❌ Erro ao validar limites:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao validar limites.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function obterQuantidadesComAditivos(req: Request, res: Response) {
  try {
    const { contrato_id } = req.params;
    
    // Simplified response - return basic contract products
    const produtos = await db.all(`
      SELECT 
        cp.id,
        cp.produto_id,
        cp.limite as quantidade_original,
        cp.preco,
        p.nome as produto_nome
      FROM contrato_produtos cp
      LEFT JOIN produtos p ON cp.produto_id = p.id
      WHERE cp.contrato_id = $1
    `, [contrato_id]);
    
    res.json({
      success: true,
      contrato_id: Number(contrato_id),
      produtos: produtos
    });
  } catch (error: any) {
    console.error('❌ Erro ao calcular quantidades com aditivos:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao calcular quantidades com aditivos.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function obterProdutosContrato(req: Request, res: Response) {
  try {
    const { contrato_id } = req.params;
    
    const produtos = await db.all(`
      SELECT 
        cp.id as contrato_produto_id,
        cp.produto_id,
        cp.limite as quantidade_atual,
        cp.preco,
        p.nome as produto_nome,
        p.unidade_medida as produto_unidade,
        (cp.limite * cp.preco) as valor_total
      FROM contrato_produtos cp
      LEFT JOIN produtos p ON cp.produto_id = p.id
      WHERE cp.contrato_id = $1
    `, [contrato_id]);
    
    res.json({
      success: true,
      data: produtos
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar produtos do contrato:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar produtos do contrato.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function obterEstatisticasAditivos(req: Request, res: Response) {
  try {
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_aditivos,
        COUNT(CASE WHEN tipo = 'PRAZO' THEN 1 END) as aditivos_prazo,
        COUNT(CASE WHEN tipo = 'QUANTIDADE' THEN 1 END) as aditivos_quantidade,
        COUNT(CASE WHEN tipo = 'VALOR' THEN 1 END) as aditivos_valor,
        COUNT(CASE WHEN tipo = 'MISTO' THEN 1 END) as aditivos_misto,
        COUNT(CASE WHEN aprovado_por IS NOT NULL THEN 1 END) as aditivos_aprovados,
        COUNT(CASE WHEN aprovado_por IS NULL THEN 1 END) as aditivos_pendentes,
        COALESCE(AVG(percentual_acrescimo), 0) as percentual_medio,
        COALESCE(SUM(valor_aditivo), 0) as valor_total_aditivos
      FROM aditivos_contratos
      WHERE ativo = true
    `);

    const stats = statsResult.rows[0];

    const aditivosPorContratoResult = await db.query(`
      SELECT 
        c.numero as contrato_numero,
        f.nome as fornecedor_nome,
        COUNT(a.id) as total_aditivos,
        COALESCE(SUM(a.valor_aditivo), 0) as valor_total_aditivos
      FROM contratos c
      LEFT JOIN fornecedores f ON c.fornecedor_id = f.id
      LEFT JOIN aditivos_contratos a ON c.id = a.contrato_id AND a.ativo = true
      GROUP BY c.id, c.numero, f.nome
      HAVING COUNT(a.id) > 0
      ORDER BY COUNT(a.id) DESC
      LIMIT 10
    `);

    const aditivosPorContrato = aditivosPorContratoResult.rows;

    const aditivosPorMesResult = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as mes,
        COUNT(*) as aditivos_criados,
        COUNT(CASE WHEN tipo = 'PRAZO' THEN 1 END) as prazo,
        COUNT(CASE WHEN tipo = 'QUANTIDADE' THEN 1 END) as quantidade,
        COUNT(CASE WHEN tipo = 'VALOR' THEN 1 END) as valor,
        COUNT(CASE WHEN tipo = 'MISTO' THEN 1 END) as misto
      FROM aditivos_contratos
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' AND ativo = true
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY mes DESC
    `);

    const aditivosPorMes = aditivosPorMesResult.rows;

    res.json({
      success: true,
      data: {
        resumo: stats,
        por_contrato: aditivosPorContrato,
        por_mes: aditivosPorMes
      }
    });
  } catch (error: any) {
    console.error('❌ Erro ao obter estatísticas de aditivos:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao obter estatísticas de aditivos.", 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}