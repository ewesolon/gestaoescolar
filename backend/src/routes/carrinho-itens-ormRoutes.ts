import { Router } from 'express';
import carrinhoItensORMController from '../controllers/carrinhoItensORMController';

const router = Router();

// Rotas para CarrinhoItensORM
router.get('/', carrinhoItensORMController.listar);
router.get('/:id', carrinhoItensORMController.buscarPorId);
router.post('/', carrinhoItensORMController.criar);
router.put('/:id', carrinhoItensORMController.atualizar);
router.delete('/:id', carrinhoItensORMController.deletar);

export default router;
