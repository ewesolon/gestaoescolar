import { Router } from 'express';
import agrupamentosMensaisORMController from '../controllers/agrupamentosMensaisORMController';

const router = Router();

// Rotas para AgrupamentosMensaisORM
router.get('/', agrupamentosMensaisORMController.listar);
router.get('/:id', agrupamentosMensaisORMController.buscarPorId);
router.post('/', agrupamentosMensaisORMController.criar);
router.put('/:id', agrupamentosMensaisORMController.atualizar);
router.delete('/:id', agrupamentosMensaisORMController.deletar);

export default router;
