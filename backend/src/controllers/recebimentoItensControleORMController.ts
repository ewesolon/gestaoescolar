import { Request, Response } from 'express';
import RecebimentoItensControleORM, { IRecebimentoItensControle } from '../models/RecebimentoItensControleORM';

export const recebimentoItensControleORMController = {
  // Listar todos os registros
  async listar(req: Request, res: Response) {
    try {
      const registros = await RecebimentoItensControleORM.findAll();
      res.json(registros);
    } catch (error) {
      console.error('Erro ao listar recebimento_itens_controle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar por ID
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registro = await RecebimentoItensControleORM.findById(parseInt(id));
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registro);
    } catch (error) {
      console.error('Erro ao buscar recebimento_itens_controle por ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar novo registro
  async criar(req: Request, res: Response) {
    try {
      const dados = req.body;
      const novoRegistro = await RecebimentoItensControleORM.create(dados);
      res.status(201).json(novoRegistro);
    } catch (error) {
      console.error('Erro ao criar recebimento_itens_controle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar registro
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const registroAtualizado = await RecebimentoItensControleORM.update(parseInt(id), dados);
      
      if (!registroAtualizado) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registroAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar recebimento_itens_controle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar registro
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sucesso = await RecebimentoItensControleORM.delete(parseInt(id));
      
      if (!sucesso) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar recebimento_itens_controle:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export default recebimentoItensControleORMController;
