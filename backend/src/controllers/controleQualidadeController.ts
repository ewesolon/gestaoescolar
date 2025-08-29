import { Request, Response } from 'express';
import { ControleQualidadeModel } from '../models/ControleQualidade';
import { AlertaService } from '../services/AlertaService';
import { pool } from '../config/database';

const controleQualidadeModel = new ControleQualidadeModel(pool);
const alertaService = new AlertaService(pool);

// Funções exportadas para as rotas
export const buscarItensQuarentena = async (req: Request, res: Response) => {
  try {
    const itens = await controleQualidadeModel.buscarItensQuarentena();
    
    res.json({
      success: true,
      data: itens
    });
  } catch (error) {
    console.error('Erro ao buscar itens em quarentena:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};

export const buscarCriteriosProduto = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  await controller.buscarCriteriosProduto(req, res);
};

export const colocarEmQuarentena = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  await controller.iniciarControle(req, res);
};

export const liberarItem = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  req.body.status = 'aprovado';
  await controller.processarQualidade(req, res);
};

export const rejeitarItem = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  req.body.status = 'rejeitado';
  await controller.processarQualidade(req, res);
};

export const uploadFoto = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  await controller.uploadFoto(req, res);
};

export const buscarHistorico = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  await controller.listarPendentes(req, res);
};

export const buscarItemPorId = async (req: Request, res: Response) => {
  const controller = new ControleQualidadeController();
  await controller.buscarPorId(req, res);
};

export class ControleQualidadeController {
  private controleQualidadeModel: ControleQualidadeModel;
  private alertaService: AlertaService;

  constructor() {
    this.controleQualidadeModel = new ControleQualidadeModel(pool);
    this.alertaService = new AlertaService(pool);
  }

  // Iniciar controle de qualidade para um item
  async iniciarControle(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const item = await this.controleQualidadeModel.criarItem({
        ...req.body,
        status: 'quarentena'
      });

      res.status(201).json({
        success: true,
        data: item,
        message: 'Controle de qualidade iniciado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao iniciar controle de qualidade:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  // Processar aprovação/rejeição
  async processarQualidade(req: Request, res: Response): Promise<void> {
    try {
      const { controleId } = req.params;
      const { status, observacoes, motivo_rejeicao } = req.body;
      const usuarioId = (req as any).user?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      if (!['aprovado', 'rejeitado', 'quarentena'].includes(status)) {
        res.status(400).json({ error: 'Status inválido' });
        return;
      }

      let item;
      
      if (status === 'aprovado') {
        item = await this.controleQualidadeModel.aprovarItem(parseInt(controleId), usuarioId, observacoes);
      } else if (status === 'rejeitado') {
        item = await this.controleQualidadeModel.rejeitarItem(parseInt(controleId), usuarioId, motivo_rejeicao);
      } else if (status === 'quarentena') {
        item = await this.controleQualidadeModel.colocarQuarentena(parseInt(controleId), usuarioId, observacoes);
      }

      if (item) {
        // Criar alerta se rejeitado
        if (status === 'rejeitado') {
          await this.alertaService.criarAlerta({
            tipo: 'sistema',
            titulo: 'Item Rejeitado no Controle de Qualidade',
            mensagem: `Item do lote ${item.lote} foi rejeitado na inspeção de qualidade`,
            prioridade: 'alta',
            status: 'pendente',
            dados_contexto: { controle_id: controleId, lote: item.lote }
          });
        }

        res.json({
          success: true,
          data: item,
          message: `Item ${status} com sucesso`
        });
      } else {
        res.status(404).json({ 
          success: false,
          error: 'Controle de qualidade não encontrado' 
        });
      }

    } catch (error) {
      console.error('Erro ao processar qualidade:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  // Listar itens pendentes de qualidade
  async listarPendentes(req: Request, res: Response): Promise<void> {
    try {
      const itens = await this.controleQualidadeModel.buscarItensPendentes();

      res.json({
        success: true,
        data: itens
      });

    } catch (error) {
      console.error('Erro ao listar controles pendentes:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  // Buscar controle por ID
  async buscarPorId(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await this.controleQualidadeModel.buscarPorId(parseInt(id));

      if (!item) {
        res.status(404).json({ 
          success: false,
          error: 'Controle de qualidade não encontrado' 
        });
        return;
      }

      // Buscar análises relacionadas
      const analises = await this.controleQualidadeModel.buscarAnalises(item.id!);

      res.json({
        success: true,
        data: {
          ...item,
          analises
        }
      });

    } catch (error) {
      console.error('Erro ao buscar controle de qualidade:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  // Buscar critérios de qualidade por produto
  async buscarCriteriosProduto(req: Request, res: Response): Promise<void> {
    try {
      // Critérios padrão para produtos
      const criterios = [
        'Aparência visual',
        'Integridade da embalagem',
        'Data de validade',
        'Temperatura adequada',
        'Ausência de pragas',
        'Documentação completa'
      ];

      res.json({ 
        success: true,
        data: criterios 
      });

    } catch (error) {
      console.error('Erro ao buscar critérios do produto:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  // Upload de foto
  async uploadFoto(req: Request, res: Response): Promise<void> {
    try {
      const { controleId } = req.params;
      const { tipo_foto, descricao } = req.body;

      if (!req.file) {
        res.status(400).json({ error: 'Nenhuma foto enviada' });
        return;
      }

      const foto = await this.controleQualidadeService.adicionarFoto({
        controle_qualidade_id: parseInt(controleId),
        nome_arquivo: req.file.filename,
        url_foto: `/uploads/qualidade/${req.file.filename}`,
        tipo_foto: tipo_foto || 'geral',
        descricao
      });

      res.status(201).json({
        message: 'Foto adicionada com sucesso',
        foto
      });

    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar fotos de um controle
  async listarFotos(req: Request, res: Response): Promise<void> {
    try {
      const { controleId } = req.params;
      const fotos = await this.controleQualidadeService.buscarFotos(parseInt(controleId));

      res.json({ fotos });

    } catch (error) {
      console.error('Erro ao listar fotos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Dashboard de qualidade
  async dashboardQualidade(req: Request, res: Response): Promise<void> {
    try {
      const estatisticas = await this.controleQualidadeModel.obterEstatisticas();
      const itensVencendo = await this.controleQualidadeModel.buscarItensVencendo(7);
      const itensVencidos = await this.controleQualidadeModel.buscarItensVencidos();

      res.json({
        success: true,
        data: {
          estatisticas,
          itens_vencendo: itensVencendo,
          itens_vencidos: itensVencidos
        }
      });

    } catch (error) {
      console.error('Erro ao gerar dashboard de qualidade:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  // Adicionar análise de qualidade
  async adicionarAnalise(req: Request, res: Response): Promise<void> {
    try {
      const { controleId } = req.params;
      const usuarioId = (req as any).user?.id;

      const analise = await this.controleQualidadeModel.adicionarAnalise({
        item_controle_id: parseInt(controleId),
        usuario_id: usuarioId,
        ...req.body
      });

      res.status(201).json({
        success: true,
        data: analise,
        message: 'Análise adicionada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao adicionar análise:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }
}