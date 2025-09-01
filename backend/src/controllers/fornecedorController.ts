// Controller de fornecedores para PostgreSQL - SIMPLIFICADO
import { Request, Response } from "express";
const db = require("../database");

export async function listarFornecedores(req: Request, res: Response) {
  try {
    const result = await db.query(`
      SELECT 
        f.id,
        f.nome,
        f.cnpj,
        f.email,
        f.telefone,
        f.endereco,
        f.cidade,
        f.estado,
        f.cep,
        f.ativo,
        f.created_at
      FROM fornecedores f
      ORDER BY f.nome
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error("❌ Erro ao listar fornecedores:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar fornecedores",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function buscarFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT * FROM fornecedores WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao buscar fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function criarFornecedor(req: Request, res: Response) {
  try {
    const {
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      contato,
      ativo = true
    } = req.body;

    const result = await db.query(`
      INSERT INTO fornecedores (
        nome, cnpj, email, telefone, endereco, cidade, estado, cep, contato, ativo, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING *
    `, [nome, cnpj, email, telefone, endereco, cidade, estado, cep, contato, ativo]);

    res.json({
      success: true,
      message: "Fornecedor criado com sucesso",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao criar fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function editarFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      cidade,
      estado,
      cep,
      contato,
      ativo
    } = req.body;

    const result = await db.query(`
      UPDATE fornecedores SET
        nome = $1,
        cnpj = $2,
        email = $3,
        telefone = $4,
        endereco = $5,
        cidade = $6,
        estado = $7,
        cep = $8,
        contato = $9,
        ativo = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [nome, cnpj, email, telefone, endereco, cidade, estado, cep, contato, ativo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    res.json({
      success: true,
      message: "Fornecedor atualizado com sucesso",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao editar fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao editar fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function removerFornecedor(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await db.query(`
      DELETE FROM fornecedores WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Fornecedor não encontrado"
      });
    }

    res.json({
      success: true,
      message: "Fornecedor removido com sucesso"
    });
  } catch (error) {
    console.error("❌ Erro ao remover fornecedor:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover fornecedor",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}