import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IEstoqueLotes {
  id?: number;
  produto_id?: number;
  lote: string;
  quantidade_inicial?: number;
  quantidade_atual?: number;
  data_fabricacao?: Date;
  data_validade?: Date;
  fornecedor_id?: number;
  observacoes?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  recebimento_id?: number;
}

@Model('estoque_lotes')
export class EstoqueLotesORM extends BaseModel {
  static tableName = 'estoque_lotes';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    produto_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    lote: {
      type: 'VARCHAR' as const,
      nullable: false

    },
    quantidade_inicial: {
      type: 'NUMERIC' as const,
      nullable: true
,
      default: 0
    },
    quantidade_atual: {
      type: 'NUMERIC' as const,
      nullable: true
,
      default: 0
    },
    data_fabricacao: {
      type: 'DATE' as const,
      nullable: true

    },
    data_validade: {
      type: 'DATE' as const,
      nullable: true

    },
    fornecedor_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    observacoes: {
      type: 'TEXT' as const,
      nullable: true

    },
    status: {
      type: 'VARCHAR' as const,
      nullable: true
,
      default: 'ativo'
    },
    created_at: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'NOW()'
    },
    updated_at: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'NOW()'
    },
    recebimento_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IEstoqueLotes[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IEstoqueLotes | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IEstoqueLotes, 'id' | 'created_at' | 'updated_at'>): Promise<IEstoqueLotes> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IEstoqueLotes>): Promise<IEstoqueLotes | null> {
    const entries = Object.entries(data);
    const setClause = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...entries.map(([, value]) => value)];
    
    const result = await db.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }
}

export { IEstoqueLotes };
export default EstoqueLotesORM;
