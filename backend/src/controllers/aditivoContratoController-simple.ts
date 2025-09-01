import { Request, Response } from "express";
const db = require("../database");

export async function listarAditivosContrato(req: Request, res: Response) {
  try {
    const { contrato_id } = req.params;
    
    const result = await db.query(`
      SELECT 
        a.id,
        a.contrato_id,
        a.numero_aditivo,
        a.tipo,
        a.data_assinatura,
        a.data_inicio_vigencia,
        a.data_fim_vigencia,
        a.valor_aditivo,
        a.ativo,
        a.created_at
      FROM aditivos_contratos a
      WHERE a.contrato_id = $1 AND a.ativo = true
      ORDER BY a.created_at DESC
    `, [contrato_id]);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar aditivos:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao listar aditivos do contrato.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function buscarAditivo(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT * FROM aditivos_contratos WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aditivo não encontrado."
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar aditivo:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao buscar aditivo.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Placeholder functions for the other routes
export async function criarAditivo(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function editarAditivo(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function removerAditivo(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function aprovarAditivo(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function validarLimites(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function obterQuantidadesComAditivos(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function obterProdutosContrato(req: Request, res: Response) {
  res.status(501).json({ success: false, message: "Funcionalidade não implementada" });
}

export async function obterEstatisticasAditivos(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      data: {
        resumo: {
          total_aditivos: 0,
          aditivos_prazo: 0,
          aditivos_quantidade: 0,
          aditivos_valor: 0,
          aditivos_aprovados: 0,
          aditivos_pendentes: 0
        },
        por_contrato: [],
        por_mes: []
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      success: false,
      message: "Erro ao obter estatísticas.",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}