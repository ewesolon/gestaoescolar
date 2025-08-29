import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IAgrupamentosPedidos {
  id?: number;
  agrupamento_id: number;
  pedido_id: number;
  data_vinculacao?: Date;
}

@Model('agrupamentos_pedidos')
export class AgrupamentosPedidosORM extends BaseModel {
  static tableName = 'agrupamentos_pedidos';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    agrupamento_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    pedido_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    data_vinculacao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IAgrupamentosPedidos[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IAgrupamentosPedidos | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IAgrupamentosPedidos, 'id' | 'created_at' | 'updated_at'>): Promise<IAgrupamentosPedidos> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IAgrupamentosPedidos>): Promise<IAgrupamentosPedidos | null> {
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

export { IAgrupamentosPedidos };
export default AgrupamentosPedidosORM;
