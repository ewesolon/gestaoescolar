import { Request, Response } from 'express';
import EstoqueLotesORM, { IEstoqueLotes } from '../models/EstoqueLotesORM';

export const estoqueLotesORMController = {
  // Listar todos os registros
  async listar(req: Request, res: Response) {
    try {
      const registros = await EstoqueLotesORM.findAll();
      res.json(registros);
    } catch (error) {
      console.error('Erro ao listar estoque_lotes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar por ID
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registro = await EstoqueLotesORM.findById(parseInt(id));
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registro);
    } catch (error) {
      console.error('Erro ao buscar estoque_lotes por ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar novo registro
  async criar(req: Request, res: Response) {
    try {
      const dados = req.body;
      const novoRegistro = await EstoqueLotesORM.create(dados);
      res.status(201).json(novoRegistro);
    } catch (error) {
      console.error('Erro ao criar estoque_lotes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar registro
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const registroAtualizado = await EstoqueLotesORM.update(parseInt(id), dados);
      
      if (!registroAtualizado) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registroAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar estoque_lotes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar registro
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sucesso = await EstoqueLotesORM.delete(parseInt(id));
      
      if (!sucesso) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar estoque_lotes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export default estoqueLotesORMController;
