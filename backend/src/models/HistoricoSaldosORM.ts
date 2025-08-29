import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IHistoricoSaldos {
  id?: number;
  contrato_produto_id: number;
  saldo_anterior: number;
  saldo_novo: number;
  diferenca?: number;
  observacao?: string;
  usuario_id?: number;
  data_alteracao?: Date;
}

@Model('historico_saldos')
export class HistoricoSaldosORM extends BaseModel {
  static tableName = 'historico_saldos';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    contrato_produto_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    saldo_anterior: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    saldo_novo: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    diferenca: {
      type: 'NUMERIC' as const,
      nullable: true

    },
    observacao: {
      type: 'TEXT' as const,
      nullable: true

    },
    usuario_id: {
      type: 'INTEGER' as const,
      nullable: true
,
      default: 1
    },
    data_alteracao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IHistoricoSaldos[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IHistoricoSaldos | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IHistoricoSaldos, 'id' | 'created_at' | 'updated_at'>): Promise<IHistoricoSaldos> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IHistoricoSaldos>): Promise<IHistoricoSaldos | null> {
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

export { IHistoricoSaldos };
export default HistoricoSaldosORM;
