import { Request, Response } from "express";
import {
  insertMovimentacaoConsumoContrato,
  getMovimentacoesByContratoItem,
  getMovimentacaoById,
  updateMovimentacaoConsumoContrato,
  deleteMovimentacaoConsumoContrato,
  getSaldoContratoItem,
  MovimentacaoConsumoContratoError,
} from "../models/MovimentacaoConsumoContrato";

/**
 * Registra uma nova movimentação de consumo
 * POST /api/contratos/itens/:itemId/movimentacoes
 */
export async function registrarMovimentacaoConsumo(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const {
      tipo = 'CONSUMO',
      quantidade_utilizada,
      valor_utilizado,
      justificativa,
      data_movimentacao,
      observacoes,
      documento_referencia
    } = req.body;

    // Validações básicas
    if (!quantidade_utilizada || !justificativa || !data_movimentacao) {
      return res.status(400).json({
        message: "Campos obrigatórios: quantidade_utilizada, justificativa, data_movimentacao"
      });
    }

    if (quantidade_utilizada <= 0) {
      return res.status(400).json({
        message: "Quantidade deve ser maior que zero"
      });
    }

    // Verificar se o item de contrato existe
    const saldoItem = await getSaldoContratoItem(Number(itemId));
    if (!saldoItem) {
      return res.status(404).json({
        message: "Item de contrato não encontrado"
      });
    }

    const novaMovimentacao = await insertMovimentacaoConsumoContrato({
      contrato_produto_id: Number(itemId),
      tipo,
      quantidade_utilizada: Number(quantidade_utilizada),
      valor_utilizado: valor_utilizado ? Number(valor_utilizado) : undefined,
      justificativa: justificativa.trim(),
      data_movimentacao,
      usuario_id: (req as any).user?.id || 1, // TODO: Implementar autenticação adequada
      observacoes: observacoes?.trim() || undefined,
      documento_referencia: documento_referencia?.trim() || undefined
    });

    // Buscar a movimentação criada com dados completos
    const movimentacaoCompleta = await getMovimentacaoById(novaMovimentacao.id!);

    res.status(201).json({
      message: "Movimentação registrada com sucesso",
      movimentacao: movimentacaoCompleta,
      saldo_atualizado: await getSaldoContratoItem(Number(itemId))
    });

  } catch (error: any) {
    console.error('Erro ao registrar movimentação:', error);

    if (error instanceof MovimentacaoConsumoContratoError) {
      const statusCode = error.code === 'QUANTIDADE_INSUFICIENTE' ? 400 :
                        error.code === 'CONTRATO_VENCIDO' ? 400 :
                        error.code === 'DATA_FUTURA' ? 400 :
                        error.code === 'JUSTIFICATIVA_OBRIGATORIA' ? 400 : 422;

      return res.status(statusCode).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    res.status(500).json({
      message: "Erro ao registrar movimentação de consumo",
      details: error.message
    });
  }
}

/**
 * Lista histórico de movimentações por item
 * GET /api/contratos/itens/:itemId/movimentacoes
 */
export async function listarHistoricoMovimentacoes(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { page = 1, limit = 20, tipo } = req.query;

    // Verificar se o item de contrato existe
    const saldoItem = await getSaldoContratoItem(Number(itemId));
    if (!saldoItem) {
      return res.status(404).json({
        message: "Item de contrato não encontrado"
      });
    }

    const offset = (Number(page) - 1) * Number(limit);
    
    let movimentacoes = await getMovimentacoesByContratoItem(
      Number(itemId),
      Number(limit),
      offset
    );

    // Filtrar por tipo se especificado
    if (tipo && typeof tipo === 'string') {
      movimentacoes = movimentacoes.filter(m => m.tipo === tipo.toUpperCase());
    }

    // Calcular totais
    const totalConsumo = movimentacoes
      .filter(m => m.tipo === 'CONSUMO')
      .reduce((sum, m) => sum + m.quantidade_utilizada, 0);

    const totalEstorno = movimentacoes
      .filter(m => m.tipo === 'ESTORNO')
      .reduce((sum, m) => sum + m.quantidade_utilizada, 0);

    res.json({
      movimentacoes,
      item: {
        produto_nome: saldoItem.produto_nome,
        produto_unidade: saldoItem.produto_unidade,
        contrato_numero: saldoItem.contrato_numero,
        quantidade_disponivel: saldoItem.quantidade_disponivel,
        status: saldoItem.status
      },
      resumo: {
        total_movimentacoes: movimentacoes.length,
        total_consumo: totalConsumo,
        total_estorno: totalEstorno,
        saldo_liquido: totalConsumo - totalEstorno
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: movimentacoes.length
      }
    });

  } catch (error: any) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({
      message: "Erro ao listar histórico de movimentações",
      details: error.message
    });
  }
}

/**
 * Busca uma movimentação específica
 * GET /api/movimentacoes-consumo/:id
 */
export async function buscarMovimentacao(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const movimentacao = await getMovimentacaoById(Number(id));
    if (!movimentacao) {
      return res.status(404).json({
        message: "Movimentação não encontrada"
      });
    }

    res.json(movimentacao);

  } catch (error: any) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({
      message: "Erro ao buscar movimentação",
      details: error.message
    });
  }
}

/**
 * Edita uma movimentação (apenas observações)
 * PUT /api/movimentacoes-consumo/:id
 */
export async function editarMovimentacao(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { observacoes } = req.body;

    // Verificar se a movimentação existe
    const movimentacaoExistente = await getMovimentacaoById(Number(id));
    if (!movimentacaoExistente) {
      return res.status(404).json({
        message: "Movimentação não encontrada"
      });
    }

    // Validar observações
    if (observacoes !== undefined && typeof observacoes !== 'string') {
      return res.status(400).json({
        message: "Observações devem ser uma string"
      });
    }

    await updateMovimentacaoConsumoContrato(
      Number(id),
      observacoes?.trim() || ''
    );

    const movimentacaoAtualizada = await getMovimentacaoById(Number(id));

    res.json({
      message: "Movimentação atualizada com sucesso",
      movimentacao: movimentacaoAtualizada
    });

  } catch (error: any) {
    console.error('Erro ao editar movimentação:', error);

    if (error instanceof MovimentacaoConsumoContratoError) {
      return res.status(400).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    res.status(500).json({
      message: "Erro ao editar movimentação",
      details: error.message
    });
  }
}

/**
 * Remove uma movimentação com validações
 * DELETE /api/movimentacoes-consumo/:id
 */
export async function removerMovimentacao(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Verificar se a movimentação existe
    const movimentacaoExistente = await getMovimentacaoById(Number(id));
    if (!movimentacaoExistente) {
      return res.status(404).json({
        message: "Movimentação não encontrada"
      });
    }

    // Obter saldo antes da remoção para informar o usuário
    const saldoAntes = await getSaldoContratoItem(movimentacaoExistente.contrato_produto_id);

    const movimentacaoRemovida = await deleteMovimentacaoConsumoContrato(Number(id));

    // Obter saldo após a remoção
    const saldoDepois = await getSaldoContratoItem(movimentacaoExistente.contrato_produto_id);

    res.json({
      message: "Movimentação removida com sucesso",
      movimentacao_removida: movimentacaoRemovida,
      impacto: {
        saldo_antes: saldoAntes?.quantidade_disponivel || 0,
        saldo_depois: saldoDepois?.quantidade_disponivel || 0,
        diferenca: (saldoDepois?.quantidade_disponivel || 0) - (saldoAntes?.quantidade_disponivel || 0)
      }
    });

  } catch (error: any) {
    console.error('Erro ao remover movimentação:', error);

    if (error instanceof MovimentacaoConsumoContratoError) {
      return res.status(400).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }

    res.status(500).json({
      message: "Erro ao remover movimentação",
      details: error.message
    });
  }
}

/**
 * Valida dados de uma movimentação antes de processar
 */
export async function validarMovimentacao(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { tipo = 'CONSUMO', quantidade_utilizada } = req.body;

    if (!quantidade_utilizada || quantidade_utilizada <= 0) {
      return res.status(400).json({
        message: "Quantidade deve ser maior que zero"
      });
    }

    // Verificar se o item existe e obter saldo atual
    const saldoItem = await getSaldoContratoItem(Number(itemId));
    if (!saldoItem) {
      return res.status(404).json({
        message: "Item de contrato não encontrado"
      });
    }

    // Simular validação sem salvar
    const validacao: {
      valido: boolean;
      item: {
        produto_nome: string;
        produto_unidade: string;
        contrato_numero: string;
      };
      saldo_atual: number;
      quantidade_solicitada: number;
      saldo_apos_movimentacao: number;
      alertas: Array<{
        tipo: 'ERRO' | 'AVISO';
        mensagem: string;
      }>;
    } = {
      valido: true,
      item: {
        produto_nome: saldoItem.produto_nome,
        produto_unidade: saldoItem.produto_unidade,
        contrato_numero: saldoItem.contrato_numero
      },
      saldo_atual: saldoItem.quantidade_disponivel,
      quantidade_solicitada: Number(quantidade_utilizada),
      saldo_apos_movimentacao: tipo === 'CONSUMO' 
        ? saldoItem.quantidade_disponivel - Number(quantidade_utilizada)
        : saldoItem.quantidade_disponivel + Number(quantidade_utilizada),
      alertas: []
    };

    // Verificar alertas
    if (tipo === 'CONSUMO' && Number(quantidade_utilizada) > saldoItem.quantidade_disponivel) {
      validacao.valido = false;
      validacao.alertas.push({
        tipo: 'ERRO',
        mensagem: `Quantidade insuficiente. Disponível: ${saldoItem.quantidade_disponivel} ${saldoItem.produto_unidade}`
      });
    }

    if (validacao.saldo_apos_movimentacao < 0) {
      validacao.alertas.push({
        tipo: 'AVISO',
        mensagem: 'Esta operação resultará em saldo negativo'
      });
    }

    // Verificar se contrato está vencido
    const hoje = new Date().toISOString().split('T')[0];
    if (saldoItem.data_fim && saldoItem.data_fim < hoje) {
      validacao.valido = false;
      validacao.alertas.push({
        tipo: 'ERRO',
        mensagem: `Contrato vencido em ${saldoItem.data_fim}`
      });
    }

    res.json(validacao);

  } catch (error: any) {
    console.error('Erro ao validar movimentação:', error);
    res.status(500).json({
      message: "Erro ao validar movimentação",
      details: error.message
    });
  }
}

/**
 * Busca estatísticas de movimentações por período
 * GET /api/contratos/itens/:itemId/estatisticas
 */
export async function obterEstatisticasItem(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const { periodo = '30' } = req.query; // dias

    // Verificar se o item existe
    const saldoItem = await getSaldoContratoItem(Number(itemId));
    if (!saldoItem) {
      return res.status(404).json({
        message: "Item de contrato não encontrado"
      });
    }

    // Buscar todas as movimentações do item
    const todasMovimentacoes = await getMovimentacoesByContratoItem(Number(itemId));

    // Filtrar por período se especificado
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - Number(periodo));
    
    const movimentacoesPeriodo = todasMovimentacoes.filter(m => 
      new Date(m.data_movimentacao) >= dataLimite
    );

    // Calcular estatísticas
    const estatisticas = {
      item: {
        produto_nome: saldoItem.produto_nome,
        produto_unidade: saldoItem.produto_unidade,
        contrato_numero: saldoItem.contrato_numero,
        quantidade_total: saldoItem.quantidade_total,
        quantidade_disponivel: saldoItem.quantidade_disponivel,
        percentual_utilizado: saldoItem.percentual_utilizado,
        status: saldoItem.status
      },
      periodo_dias: Number(periodo),
      totais: {
        total_movimentacoes: todasMovimentacoes.length,
        total_consumo: todasMovimentacoes
          .filter(m => m.tipo === 'CONSUMO')
          .reduce((sum, m) => sum + m.quantidade_utilizada, 0),
        total_estorno: todasMovimentacoes
          .filter(m => m.tipo === 'ESTORNO')
          .reduce((sum, m) => sum + m.quantidade_utilizada, 0),
        total_ajustes: todasMovimentacoes
          .filter(m => m.tipo === 'AJUSTE')
          .reduce((sum, m) => sum + m.quantidade_utilizada, 0)
      },
      periodo: {
        movimentacoes_periodo: movimentacoesPeriodo.length,
        consumo_periodo: movimentacoesPeriodo
          .filter(m => m.tipo === 'CONSUMO')
          .reduce((sum, m) => sum + m.quantidade_utilizada, 0),
        estorno_periodo: movimentacoesPeriodo
          .filter(m => m.tipo === 'ESTORNO')
          .reduce((sum, m) => sum + m.quantidade_utilizada, 0),
        media_diaria: movimentacoesPeriodo.length > 0 
          ? movimentacoesPeriodo.reduce((sum, m) => sum + m.quantidade_utilizada, 0) / Number(periodo)
          : 0
      },
      movimentacoes_recentes: todasMovimentacoes.slice(0, 5)
    };

    res.json(estatisticas);

  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      message: "Erro ao obter estatísticas do item",
      details: error.message
    });
  }
}