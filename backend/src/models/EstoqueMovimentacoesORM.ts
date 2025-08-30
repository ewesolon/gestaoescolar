import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IEstoqueMovimentacoes {
  id?: number;
  lote_id?: number;
  produto_id?: number;
  usuario_id?: number;
  tipo: string;
  quantidade: number;
  quantidade_anterior: number;
  quantidade_posterior: number;
  motivo: string;
  documento_referencia?: string;
  data_movimentacao?: Date;
  observacoes?: string;
}

@Model('estoque_movimentacoes')
export class EstoqueMovimentacoesORM extends BaseModel {
  static tableName = 'estoque_movimentacoes';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    lote_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    produto_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    usuario_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    tipo: {
      type: 'VARCHAR' as const,
      nullable: false

    },
    quantidade: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    quantidade_anterior: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    quantidade_posterior: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    motivo: {
      type: 'VARCHAR' as const,
      nullable: false

    },
    documento_referencia: {
      type: 'VARCHAR' as const,
      nullable: true

    },
    data_movimentacao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'NOW()'
    },
    observacoes: {
      type: 'TEXT' as const,
      nullable: true

    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IEstoqueMovimentacoes[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IEstoqueMovimentacoes | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IEstoqueMovimentacoes, 'id' | 'created_at' | 'updated_at'>): Promise<IEstoqueMovimentacoes> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IEstoqueMovimentacoes>): Promise<IEstoqueMovimentacoes | null> {
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

export { IEstoqueMovimentacoes };
export default EstoqueMovimentacoesORM;
