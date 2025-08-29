import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IAgrupamentosMensais {
  id?: number;
  ano: number;
  mes: number;
  descricao?: string;
  status?: string;
  total_pedidos?: number;
  valor_total?: number;
  data_criacao?: Date;
  data_atualizacao?: Date;
  criado_por?: number;
}

@Model('agrupamentos_mensais')
export class AgrupamentosMensaisORM extends BaseModel {
  static tableName = 'agrupamentos_mensais';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    ano: {
      type: 'INTEGER' as const,
      nullable: false

    },
    mes: {
      type: 'INTEGER' as const,
      nullable: false

    },
    descricao: {
      type: 'VARCHAR' as const,
      nullable: true

    },
    status: {
      type: 'VARCHAR' as const,
      nullable: true
,
      default: 'ATIVO'
    },
    total_pedidos: {
      type: 'INTEGER' as const,
      nullable: true
,
      default: 0
    },
    valor_total: {
      type: 'NUMERIC' as const,
      nullable: true
,
      default: 0
    },
    data_criacao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
    data_atualizacao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
    criado_por: {
      type: 'INTEGER' as const,
      nullable: true

    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IAgrupamentosMensais[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IAgrupamentosMensais | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IAgrupamentosMensais, 'id' | 'created_at' | 'updated_at'>): Promise<IAgrupamentosMensais> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IAgrupamentosMensais>): Promise<IAgrupamentosMensais | null> {
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

export { IAgrupamentosMensais };
export default AgrupamentosMensaisORM;
