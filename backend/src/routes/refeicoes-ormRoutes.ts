import { Router } from 'express';
import refeicoesORMController from '../controllers/refeicoesORMController';

const router = Router();

// Rotas para RefeicoesORM
router.get('/', refeicoesORMController.listar);
router.get('/:id', refeicoesORMController.buscarPorId);
router.post('/', refeicoesORMController.criar);
router.put('/:id', refeicoesORMController.atualizar);
router.delete('/:id', refeicoesORMController.deletar);

export default router;
