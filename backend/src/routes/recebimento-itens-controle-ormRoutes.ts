import { Router } from 'express';
import recebimentoItensControleORMController from '../controllers/recebimentoItensControleORMController';

const router = Router();

// Rotas para RecebimentoItensControleORM
router.get('/', recebimentoItensControleORMController.listar);
router.get('/:id', recebimentoItensControleORMController.buscarPorId);
router.post('/', recebimentoItensControleORMController.criar);
router.put('/:id', recebimentoItensControleORMController.atualizar);
router.delete('/:id', recebimentoItensControleORMController.deletar);

export default router;
