const express = require('express');
const router = express.Router();
const movimentacaoController = require('../controllers/movimentacaoConsumoContratoController');
const validacaoLimites = require('../middleware/validacaoLimitesContratuais');

/**
 * Rotas para gerenciamento de movimentações de consumo de contratos
 */

// Listar movimentações com filtros
router.get('/movimentacoes-consumo', movimentacaoController.listarMovimentacoes);

// Registrar nova movimentação
router.post('/movimentacoes-consumo', movimentacaoController.registrarMovimentacao);

// Consultar saldos por fornecedor
router.get('/saldos-contratos/:fornecedor_id', movimentacaoController.consultarSaldosPorFornecedor);

// Consultar histórico de um item específico
router.get('/movimentacoes-consumo/item/:contrato_produto_id', movimentacaoController.consultarHistoricoItem);

// Gerar relatório de consumo
router.get('/relatorios/consumo-contratos', movimentacaoController.gerarRelatorioConsumo);

// Validar limites contratuais
router.post('/validar-limites-contratuais', movimentacaoController.validarLimitesContratuais);

// Consultar reservas ativas
router.get('/reservas-ativas/:documento_referencia', movimentacaoController.consultarReservasAtivas);

// Middleware para validação automática de limites (pode ser usado em outras rotas)
router.use('/validacao-automatica', validacaoLimites.middleware.bind(validacaoLimites));

module.exports = router;