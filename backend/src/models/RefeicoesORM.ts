import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IRefeicoes {
  id?: number;
  nome: string;
  descricao?: string;
  tipo?: string;
  ativo?: boolean;
  created_at?: Date;
}

@Model('refeicoes')
export class RefeicoesORM extends BaseModel {
  static tableName = 'refeicoes';

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
    tipo: {
      type: 'VARCHAR' as const,
      nullable: true

    },
    ativo: {
      type: 'BOOLEAN' as const,
      nullable: true
,
      default: true
    },
    created_at: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IRefeicoes[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IRefeicoes | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IRefeicoes, 'id' | 'created_at' | 'updated_at'>): Promise<IRefeicoes> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IRefeicoes>): Promise<IRefeicoes | null> {
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

export { IRefeicoes };
export default RefeicoesORM;
