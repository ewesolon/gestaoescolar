import { Request, Response } from 'express';
import PedidosHistoricoORM, { IPedidosHistorico } from '../models/PedidosHistoricoORM';

export const pedidosHistoricoORMController = {
  // Listar todos os registros
  async listar(req: Request, res: Response) {
    try {
      const registros = await PedidosHistoricoORM.findAll();
      res.json(registros);
    } catch (error) {
      console.error('Erro ao listar pedidos_historico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar por ID
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registro = await PedidosHistoricoORM.findById(parseInt(id));
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registro);
    } catch (error) {
      console.error('Erro ao buscar pedidos_historico por ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar novo registro
  async criar(req: Request, res: Response) {
    try {
      const dados = req.body;
      const novoRegistro = await PedidosHistoricoORM.create(dados);
      res.status(201).json(novoRegistro);
    } catch (error) {
      console.error('Erro ao criar pedidos_historico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar registro
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const registroAtualizado = await PedidosHistoricoORM.update(parseInt(id), dados);
      
      if (!registroAtualizado) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registroAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar pedidos_historico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar registro
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sucesso = await PedidosHistoricoORM.delete(parseInt(id));
      
      if (!sucesso) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar pedidos_historico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export default pedidosHistoricoORMController;
