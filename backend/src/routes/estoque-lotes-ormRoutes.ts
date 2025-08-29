import { Router } from 'express';
import estoqueLotesORMController from '../controllers/estoqueLotesORMController';

const router = Router();

// Rotas para EstoqueLotesORM
router.get('/', estoqueLotesORMController.listar);
router.get('/:id', estoqueLotesORMController.buscarPorId);
router.post('/', estoqueLotesORMController.criar);
router.put('/:id', estoqueLotesORMController.atualizar);
router.delete('/:id', estoqueLotesORMController.deletar);

export default router;
