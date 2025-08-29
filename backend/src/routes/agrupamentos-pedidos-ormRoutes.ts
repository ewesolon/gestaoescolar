import { Router } from 'express';
import agrupamentosPedidosORMController from '../controllers/agrupamentosPedidosORMController';

const router = Router();

// Rotas para AgrupamentosPedidosORM
router.get('/', agrupamentosPedidosORMController.listar);
router.get('/:id', agrupamentosPedidosORMController.buscarPorId);
router.post('/', agrupamentosPedidosORMController.criar);
router.put('/:id', agrupamentosPedidosORMController.atualizar);
router.delete('/:id', agrupamentosPedidosORMController.deletar);

export default router;
