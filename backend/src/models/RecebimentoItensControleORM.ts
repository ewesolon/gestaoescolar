import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IRecebimentoItensControle {
  id?: number;
  pedido_item_id?: number;
  produto_id?: number;
  fornecedor_id?: number;
  quantidade_esperada: number;
  quantidade_recebida?: number;
  data_ultimo_recebimento?: Date;
  usuario_ultimo_recebimento?: number;
  observacoes?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Model('recebimento_itens_controle')
export class RecebimentoItensControleORM extends BaseModel {
  static tableName = 'recebimento_itens_controle';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    pedido_item_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    produto_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    fornecedor_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    quantidade_esperada: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    quantidade_recebida: {
      type: 'NUMERIC' as const,
      nullable: true
,
      default: 0
    },
    data_ultimo_recebimento: {
      type: 'TIMESTAMP' as const,
      nullable: true

    },
    usuario_ultimo_recebimento: {
      type: 'INTEGER' as const,
      nullable: false

    },
    observacoes: {
      type: 'VARCHAR' as const,
      nullable: true

    },
    status: {
      type: 'VARCHAR' as const,
      nullable: true
,
      default: 'PENDENTE'
    },
    created_at: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
    updated_at: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IRecebimentoItensControle[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IRecebimentoItensControle | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IRecebimentoItensControle, 'id' | 'created_at' | 'updated_at'>): Promise<IRecebimentoItensControle> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IRecebimentoItensControle>): Promise<IRecebimentoItensControle | null> {
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

export { IRecebimentoItensControle };
export default RecebimentoItensControleORM;
