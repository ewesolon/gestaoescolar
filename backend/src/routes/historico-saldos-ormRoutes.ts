import { Router } from 'express';
import historicoSaldosORMController from '../controllers/historicoSaldosORMController';

const router = Router();

// Rotas para HistoricoSaldosORM
router.get('/', historicoSaldosORMController.listar);
router.get('/:id', historicoSaldosORMController.buscarPorId);
router.post('/', historicoSaldosORMController.criar);
router.put('/:id', historicoSaldosORMController.atualizar);
router.delete('/:id', historicoSaldosORMController.deletar);

export default router;
