import { Router } from 'express';
import pedidosItensORMController from '../controllers/pedidosItensORMController';

const router = Router();

// Rotas para PedidosItensORM
router.get('/', pedidosItensORMController.listar);
router.get('/:id', pedidosItensORMController.buscarPorId);
router.post('/', pedidosItensORMController.criar);
router.put('/:id', pedidosItensORMController.atualizar);
router.delete('/:id', pedidosItensORMController.deletar);

export default router;
