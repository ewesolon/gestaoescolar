import { Request, Response } from 'express';
import HistoricoSaldosORM, { IHistoricoSaldos } from '../models/HistoricoSaldosORM';

export const historicoSaldosORMController = {
  // Listar todos os registros
  async listar(req: Request, res: Response) {
    try {
      const registros = await HistoricoSaldosORM.findAll();
      res.json(registros);
    } catch (error) {
      console.error('Erro ao listar historico_saldos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar por ID
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registro = await HistoricoSaldosORM.findById(parseInt(id));
      
      if (!registro) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registro);
    } catch (error) {
      console.error('Erro ao buscar historico_saldos por ID:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar novo registro
  async criar(req: Request, res: Response) {
    try {
      const dados = req.body;
      const novoRegistro = await HistoricoSaldosORM.create(dados);
      res.status(201).json(novoRegistro);
    } catch (error) {
      console.error('Erro ao criar historico_saldos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar registro
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dados = req.body;
      
      const registroAtualizado = await HistoricoSaldosORM.update(parseInt(id), dados);
      
      if (!registroAtualizado) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.json(registroAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar historico_saldos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar registro
  async deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sucesso = await HistoricoSaldosORM.delete(parseInt(id));
      
      if (!sucesso) {
        return res.status(404).json({ error: 'Registro não encontrado' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar historico_saldos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

export default historicoSaldosORMController;
