import express from "express";
import {
  listarAditivosContrato,
  buscarAditivo,
  criarAditivo,
  editarAditivo,
  removerAditivo,
  aprovarAditivo,
  validarLimites,
  obterQuantidadesComAditivos,
  obterProdutosContrato,
  obterEstatisticasAditivos,
} from "../controllers/aditivoContratoController";
// import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

// router.use(authMiddleware); // Temporarily disabled for testing

// Rotas para aditivos
router.get("/estatisticas", obterEstatisticasAditivos);
router.get("/contrato/:contrato_id", listarAditivosContrato);
router.get("/contrato/:contrato_id/quantidades", obterQuantidadesComAditivos);
router.get("/contrato/:contrato_id/produtos", obterProdutosContrato);
router.get("/validar-limites/:contrato_id", validarLimites);
router.get("/:id", buscarAditivo);
router.post("/", criarAditivo);
router.put("/:id", editarAditivo);
router.put("/:id/aprovar", aprovarAditivo);
router.delete("/:id", removerAditivo);

export default router;