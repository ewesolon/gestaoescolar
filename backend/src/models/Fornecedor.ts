import { openDb } from "../config/database";

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  sla_entrega_dias?: number;
  taxa_cumprimento?: number;
  avaliacao_qualidade?: number;
  condicoes_pagamento?: string;
  desconto_volume?: number;
  minimo_compra?: number;
  horario_funcionamento?: string;
  dias_entrega?: string;
  contato_responsavel?: string;
  taxa_cumprimento_prazo?: number;
  observacoes?: string;
  data_ultima_avaliacao?: string;
  total_pedidos?: number;
  total_valor_pedidos?: number;
  media_tempo_entrega?: number;
}

export async function createFornecedorTable() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cnpj TEXT NOT NULL,
      endereco TEXT,
      telefone TEXT,
      email TEXT,
      ativo BOOLEAN NOT NULL DEFAULT 1,
      sla_entrega_dias INTEGER DEFAULT 7,
      taxa_cumprimento REAL DEFAULT 100.00,
      avaliacao_qualidade REAL DEFAULT 5.00,
      condicoes_pagamento TEXT,
      desconto_volume REAL,
      minimo_compra REAL,
      horario_funcionamento TEXT,
      dias_entrega TEXT,
      contato_responsavel TEXT,
      taxa_cumprimento_prazo DECIMAL(5,2) DEFAULT 100.00,
      observacoes TEXT,
      data_ultima_avaliacao DATETIME,
      total_pedidos INTEGER DEFAULT 0,
      total_valor_pedidos DECIMAL(12,2) DEFAULT 0.00,
      media_tempo_entrega DECIMAL(5,2)
    )
  `);
}

export async function insertFornecedor(fornecedor: Omit<Fornecedor, "id">) {
  const db = await openDb();
  const result = await db.run(
    `INSERT INTO fornecedores (nome, cnpj, endereco, telefone, email, ativo, contato_responsavel) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      fornecedor.nome,
      fornecedor.cnpj,
      fornecedor.endereco || null,
      fornecedor.telefone || null,
      fornecedor.email || null,
      fornecedor.ativo ? 1 : 0,
      fornecedor.contato_responsavel || null,
    ]
  );
  return { ...fornecedor, id: result.lastID };
}

export async function getFornecedores() {
  const db = await openDb();
  return await db.all<Fornecedor[]>(`SELECT * FROM fornecedores ORDER BY nome`);
}

export async function getFornecedorById(id: number) {
  const db = await openDb();
  return await db.get<Fornecedor>(`SELECT * FROM fornecedores WHERE id = ?`, [id]);
}

export async function updateFornecedor(id: number, fornecedor: Partial<Fornecedor>) {
  const db = await openDb();
  
  // Build dynamic query based on provided fields
  const fields = [];
  const values = [];
  
  if (fornecedor.nome !== undefined) {
    fields.push('nome = ?');
    values.push(fornecedor.nome);
  }
  if (fornecedor.cnpj !== undefined) {
    fields.push('cnpj = ?');
    values.push(fornecedor.cnpj);
  }
  if (fornecedor.contato_responsavel !== undefined) {
    fields.push('contato_responsavel = ?');
    values.push(fornecedor.contato_responsavel || null);
  }
  if (fornecedor.email !== undefined) {
    fields.push('email = ?');
    values.push(fornecedor.email || null);
  }
  if (fornecedor.telefone !== undefined) {
    fields.push('telefone = ?');
    values.push(fornecedor.telefone || null);
  }
  if (fornecedor.endereco !== undefined) {
    fields.push('endereco = ?');
    values.push(fornecedor.endereco || null);
  }
  if (fornecedor.ativo !== undefined) {
    fields.push('ativo = ?');
    values.push(fornecedor.ativo ? 1 : 0);
  }
  
  if (fields.length === 0) {
    throw new Error('Nenhum campo para atualizar');
  }
  
  values.push(id);
  
  const query = `UPDATE fornecedores SET ${fields.join(', ')} WHERE id = ?`;
  console.log('Update query:', query, 'Values:', values);
  
  await db.run(query, values);
}

export async function deleteFornecedor(id: number) {
  const db = await openDb();
  await db.run(`DELETE FROM fornecedores WHERE id = ?`, [id]);
}