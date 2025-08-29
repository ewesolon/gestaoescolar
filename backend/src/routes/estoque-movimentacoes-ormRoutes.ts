import { Router } from 'express';
import estoqueMovimentacoesORMController from '../controllers/estoqueMovimentacoesORMController';

const router = Router();

// Rotas para EstoqueMovimentacoesORM
router.get('/', estoqueMovimentacoesORMController.listar);
router.get('/:id', estoqueMovimentacoesORMController.buscarPorId);
router.post('/', estoqueMovimentacoesORMController.criar);
router.put('/:id', estoqueMovimentacoesORMController.atualizar);
router.delete('/:id', estoqueMovimentacoesORMController.deletar);

export default router;
