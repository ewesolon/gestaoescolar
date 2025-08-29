import { BaseModel, Field, FieldDefinition } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

// Interface para o Produto
export interface IProduto {
  id?: number;
  nome: string;
  descricao?: string;
  unidade_medida?: string;
  preco_referencia?: number;
  estoque_minimo?: number;
  ativo?: boolean;
  created_at?: Date;
  categoria?: string;
  marca?: string;
  codigo_barras?: string;
  unidade?: string;
  peso?: number;
  validade_minima?: number;
  fator_divisao?: number;
  tipo_processamento?: string;
  imagem_url?: string;
}

// Modelo Produto usando ORM
@Model('produtos')
export class ProdutoORM extends BaseModel {
  // Definir campos da tabela
  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true
    },
    nome: {
      type: 'VARCHAR' as const,
      nullable: false
    },
    descricao: {
      type: 'TEXT' as const,
      nullable: true
    },
    unidade_medida: {
      type: 'VARCHAR' as const,
      nullable: true,
      default: 'kg'
    },
    preco_referencia: {
      type: 'NUMERIC' as const,
      nullable: true
    },
    estoque_minimo: {
      type: 'NUMERIC' as const,
      nullable: true,
      default: 0
    },
    ativo: {
      type: 'BOOLEAN' as const,
      nullable: true,
      default: true
    },
    created_at: {
      type: 'TIMESTAMP' as const,
      nullable: true,
      default: 'CURRENT_TIMESTAMP'
    },
    categoria: {
      type: 'VARCHAR' as const,
      nullable: true
    },
    marca: {
      type: 'VARCHAR' as const,
      nullable: true
    },
    codigo_barras: {
      type: 'VARCHAR' as const,
      nullable: true
    },
    unidade: {
      type: 'VARCHAR' as const,
      nullable: true
    },
    peso: {
      type: 'INTEGER' as const,
      nullable: true
    },
    validade_minima: {
      type: 'INTEGER' as const,
      nullable: true
    },
    fator_divisao: {
      type: 'NUMERIC' as const,
      nullable: true
    },
    tipo_processamento: {
      type: 'VARCHAR' as const,
      nullable: true
    },
    imagem_url: {
      type: 'VARCHAR' as const,
      nullable: true
    }
  };

  // Método para buscar produtos por nome
  static async findByName(nome: string): Promise<IProduto[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE nome ILIKE $1 AND ativo = true`;
    const result = await db.query(query, [`%${nome}%`]);
    return result.rows;
  }

  static async findActive(): Promise<IProduto[]> {
    return await this.findAll({ ativo: true });
  }

  static async findByUnidade(unidade: string): Promise<IProduto[]> {
    return await this.findAll({ unidade });
  }

  // Método para criar um novo produto
  static async createProduto(produto: Omit<IProduto, 'id' | 'created_at'>): Promise<IProduto> {
    const query = `
      INSERT INTO ${this.tableName} (nome, descricao, unidade_medida, preco_referencia, estoque_minimo, ativo, categoria, marca, codigo_barras, unidade, peso, validade_minima, fator_divisao, tipo_processamento, imagem_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const result = await db.query(query, [
      produto.nome,
      produto.descricao || null,
      produto.unidade_medida || 'kg',
      produto.preco_referencia || null,
      produto.estoque_minimo || 0,
      produto.ativo !== undefined ? produto.ativo : true,
      produto.categoria || null,
      produto.marca || null,
      produto.codigo_barras || null,
      produto.unidade || null,
      produto.peso || null,
      produto.validade_minima || null,
      produto.fator_divisao || null,
      produto.tipo_processamento || null,
      produto.imagem_url || null
    ]);
    return result.rows[0];
  }

  // Método para atualizar um produto
  static async updateProduto(id: number, produto: Partial<IProduto>): Promise<IProduto | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMappings = [
      'nome', 'descricao', 'unidade_medida', 'preco_referencia', 'estoque_minimo',
      'ativo', 'categoria', 'marca', 'codigo_barras', 'unidade', 'peso',
      'validade_minima', 'fator_divisao', 'tipo_processamento', 'imagem_url'
    ];

    fieldMappings.forEach(field => {
      if (produto[field as keyof IProduto] !== undefined) {
        fields.push(`${field} = $${paramCount++}`);
        values.push(produto[field as keyof IProduto]);
      }
    });

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id);

    const query = `
      UPDATE ${this.tableName} 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  static async deactivateProduto(id: number): Promise<IProduto | null> {
    return await this.updateProduto(id, { ativo: false });
  }

  static async activateProduto(id: number): Promise<IProduto | null> {
    return await this.updateProduto(id, { ativo: true });
  }

  static async deleteProduto(id: number): Promise<boolean> {
    return await this.delete(id);
  }

  // Método para busca avançada
  static async search(filters: {
    nome?: string;
    unidade_medida?: string;
    categoria?: string;
    marca?: string;
    ativo?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<IProduto[]> {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.nome) {
      conditions.push(`nome ILIKE $${paramCount++}`);
      values.push(`%${filters.nome}%`);
    }

    if (filters.unidade_medida) {
      conditions.push(`unidade_medida = $${paramCount++}`);
      values.push(filters.unidade_medida);
    }

    if (filters.categoria) {
      conditions.push(`categoria = $${paramCount++}`);
      values.push(filters.categoria);
    }

    if (filters.marca) {
      conditions.push(`marca = $${paramCount++}`);
      values.push(filters.marca);
    }

    if (filters.ativo !== undefined) {
      conditions.push(`ativo = $${paramCount++}`);
      values.push(filters.ativo);
    }

    let query = `SELECT * FROM ${this.tableName}`;
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY nome`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(filters.offset);
    }

    const result = await db.query(query, values);
    return result.rows;
  }

  // Método auxiliar para executar queries customizadas
  private static async query(sql: string, params: any[] = []): Promise<any> {
    const db = require('../database').default;
    return await db.query(sql, params);
  }
}

// Exportar interface e classe
export { IProduto };
export default ProdutoORM;