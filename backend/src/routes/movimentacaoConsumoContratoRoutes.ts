import express from "express";
import {
  registrarMovimentacaoConsumo,
  listarHistoricoMovimentacoes,
  buscarMovimentacao,
  editarMovimentacao,
  removerMovimentacao,
  validarMovimentacao,
  obterEstatisticasItem,
} from "../controllers/movimentacaoConsumoContratoController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// router.use(authMiddleware); // Temporariamente desabilitado para testes

// Rotas para movimentações por item de contrato
router.post("/contratos/itens/:itemId/movimentacoes", registrarMovimentacaoConsumo);
router.get("/contratos/itens/:itemId/movimentacoes", listarHistoricoMovimentacoes);
router.post("/contratos/itens/:itemId/validar-movimentacao", validarMovimentacao);
router.get("/contratos/itens/:itemId/estatisticas", obterEstatisticasItem);

// Rotas para movimentações específicas
router.get("/movimentacoes-consumo/:id", buscarMovimentacao);
router.put("/movimentacoes-consumo/:id", editarMovimentacao);
router.delete("/movimentacoes-consumo/:id", removerMovimentacao);

export default router;