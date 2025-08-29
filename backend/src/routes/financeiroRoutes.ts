import { Router } from 'express';
import {
  criarContaPagar,
  gerarContasAutomaticas,
  listarContasPagar,
  pagarConta,
  gerarFluxoCaixa,
  atualizarStatusVencidos,
  resumoFinanceiro
} from '../controllers/financeiroController';

const router = Router();

// Resumo financeiro
router.get('/resumo', resumoFinanceiro);

// Contas a pagar
router.get('/contas-pagar', listarContasPagar);
router.post('/contas-pagar', criarContaPagar);
router.post('/contas-pagar/gerar/:pedidoId', gerarContasAutomaticas);
router.put('/contas-pagar/:contaId/pagar', pagarConta);

// Fluxo de caixa
router.get('/fluxo-caixa', gerarFluxoCaixa);

// Utilitários
router.post('/atualizar-vencidos', atualizarStatusVencidos);

export default router;