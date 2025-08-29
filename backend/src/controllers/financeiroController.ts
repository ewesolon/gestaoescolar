import { Request, Response } from 'express';
import { FinanceiroService } from '../services/FinanceiroService';
import { pool } from '../config/database';

const financeiroService = new FinanceiroService(pool);

export const criarContaPagar = async (req: Request, res: Response) => {
  try {
    const usuarioId = (req as any).user?.id;
    
    const contaPagar = {
      ...req.body,
      usuario_criacao_id: usuarioId,
      valor_pendente: req.body.valor_original,
      status: 'pendente'
    };

    const conta = await financeiroService.criarContaPagar(contaPagar);
    
    res.status(201).json({
      success: true,
      data: conta,
      message: 'Conta a pagar criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const gerarContasAutomaticas = async (req: Request, res: Response) => {
  try {
    const { pedidoId } = req.params;
    const usuarioId = (req as any).user?.id;

    const contas = await financeiroService.gerarContasAutomaticas(
      parseInt(pedidoId), 
      usuarioId
    );
    
    res.json({
      success: true,
      data: contas,
      message: `${contas.length} conta(s) gerada(s) automaticamente`
    });
  } catch (error) {
    console.error('Erro ao gerar conta automática:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const listarContasPagar = async (req: Request, res: Response) => {
  try {
    const {
      status,
      fornecedor_id,
      vencimento_inicio,
      vencimento_fim
    } = req.query;

    const filtros = {
      status: status as string,
      fornecedor_id: fornecedor_id ? parseInt(fornecedor_id as string) : undefined,
      vencimento_inicio: vencimento_inicio ? new Date(vencimento_inicio as string) : undefined,
      vencimento_fim: vencimento_fim ? new Date(vencimento_fim as string) : undefined
    };

    const contas = await financeiroService.listarContasPagar(filtros);

    res.json({
      success: true,
      data: contas
    });

  } catch (error) {
    console.error('Erro ao listar contas a pagar:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const pagarConta = async (req: Request, res: Response) => {
  try {
    const { contaId } = req.params;
    const { valor_pagamento, observacoes } = req.body;
    const usuarioId = (req as any).user?.id;

    const conta = await financeiroService.pagarConta(
      parseInt(contaId), 
      valor_pagamento, 
      usuarioId, 
      observacoes
    );
    
    if (conta) {
      res.json({ 
        success: true,
        data: conta,
        message: 'Pagamento registrado com sucesso' 
      });
    } else {
      res.status(404).json({ 
        success: false,
        error: 'Conta não encontrada' 
      });
    }

  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const gerarFluxoCaixa = async (req: Request, res: Response) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ 
        success: false,
        error: 'Parâmetros data_inicio e data_fim são obrigatórios' 
      });
    }

    const fluxo = await financeiroService.obterFluxoCaixa(
      new Date(data_inicio as string),
      new Date(data_fim as string)
    );

    const resumo = {
      total_entradas: fluxo.reduce((acc, item) => acc + item.entradas, 0),
      total_saidas: fluxo.reduce((acc, item) => acc + item.saidas, 0),
      saldo_liquido: fluxo.reduce((acc, item) => acc + item.saldo, 0)
    };

    res.json({
      success: true,
      data: {
        fluxo_caixa: fluxo,
        resumo,
        periodo: { data_inicio, data_fim }
      }
    });

  } catch (error) {
    console.error('Erro ao gerar fluxo de caixa:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};



export const atualizarStatusVencidos = async (req: Request, res: Response) => {
  try {
    await financeiroService.marcarContasVencidas();
    
    res.json({
      success: true,
      message: 'Status de contas vencidas atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar status vencidos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const resumoFinanceiro = async (req: Request, res: Response) => {
  try {
    const resumo = await financeiroService.obterResumoFinanceiro();
    
    res.json({
      success: true,
      data: resumo
    });

  } catch (error) {
    console.error('Erro ao gerar resumo financeiro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const obterContasVencendo = async (req: Request, res: Response) => {
  try {
    const { dias = 7 } = req.query;
    
    const contas = await financeiroService.obterContasVencendoEm(parseInt(dias as string));
    
    res.json({
      success: true,
      data: contas
    });

  } catch (error) {
    console.error('Erro ao obter contas vencendo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};