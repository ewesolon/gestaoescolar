import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IPedidosHistorico {
  id?: number;
  pedido_id: number;
  status_anterior: string;
  status_novo: string;
  observacoes?: string;
  data_alteracao?: Date;
  alterado_por: string;
}

@Model('pedidos_historico')
export class PedidosHistoricoORM extends BaseModel {
  static tableName = 'pedidos_historico';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    pedido_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    status_anterior: {
      type: 'VARCHAR' as const,
      nullable: false

    },
    status_novo: {
      type: 'VARCHAR' as const,
      nullable: false

    },
    observacoes: {
      type: 'TEXT' as const,
      nullable: true

    },
    data_alteracao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
    alterado_por: {
      type: 'VARCHAR' as const,
      nullable: false

    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IPedidosHistorico[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IPedidosHistorico | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IPedidosHistorico, 'id' | 'created_at' | 'updated_at'>): Promise<IPedidosHistorico> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IPedidosHistorico>): Promise<IPedidosHistorico | null> {
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

export { IPedidosHistorico };
export default PedidosHistoricoORM;
