import { Router } from "express";
import { 
  listarFornecedores, 
  buscarFornecedor, 
  criarFornecedor, 
  editarFornecedor, 
  removerFornecedor,
  buscarContratosFornecedor,
  importarFornecedoresLote,
  verificarRelacionamentosFornecedor
} from "../controllers/fornecedorController";

const router = Router();

// Listar fornecedores (com filtros e paginação)
router.get("/", listarFornecedores);

// Verificar relacionamentos antes da exclusão
router.get("/:id/relacionamentos", verificarRelacionamentosFornecedor);

// Buscar contratos de um fornecedor
router.get("/:id/contratos", buscarContratosFornecedor);

// Buscar fornecedor por ID
router.get("/:id", buscarFornecedor);

// Importar fornecedores em lote
router.post("/importar-lote", importarFornecedoresLote);

// Criar novo fornecedor
router.post("/", criarFornecedor);

// Editar fornecedor
router.put("/:id", editarFornecedor);

// Remover fornecedor
router.delete("/:id", removerFornecedor);

export default router;