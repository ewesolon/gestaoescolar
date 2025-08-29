import { Router } from 'express';
import {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  alternarStatusProduto,
  listarProdutosAtivos,
  listarPorCategoria,
  listarPorUnidadeMedida,
  buscarProdutos
} from '../controllers/produtoORMController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplicar autenticação a todas as rotas (opcional)
// router.use(authMiddleware);

// Rotas específicas
router.get('/ativos', listarProdutosAtivos);
router.get('/categoria/:categoria', listarPorCategoria);
router.get('/unidade-medida/:unidade_medida', listarPorUnidadeMedida);
router.get('/buscar', buscarProdutos);
router.get('/:id', buscarProdutoPorId);
router.get('/', listarProdutos);

// Rotas de modificação (POST, PUT, DELETE)
router.post('/', criarProduto);                            // POST /api/produtos-orm
router.put('/:id', atualizarProduto);                      // PUT /api/produtos-orm/1
router.patch('/:id/status', alternarStatusProduto);        // PATCH /api/produtos-orm/1/status
router.delete('/:id', deletarProduto);                     // DELETE /api/produtos-orm/1

export default router;