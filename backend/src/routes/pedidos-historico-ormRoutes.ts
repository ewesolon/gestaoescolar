import { Router } from 'express';
import pedidosHistoricoORMController from '../controllers/pedidosHistoricoORMController';

const router = Router();

// Rotas para PedidosHistoricoORM
router.get('/', pedidosHistoricoORMController.listar);
router.get('/:id', pedidosHistoricoORMController.buscarPorId);
router.post('/', pedidosHistoricoORMController.criar);
router.put('/:id', pedidosHistoricoORMController.atualizar);
router.delete('/:id', pedidosHistoricoORMController.deletar);

export default router;
