import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface ICarrinhoItens {
  id?: number;
  usuario_id?: number;
  produto_id: number;
  contrato_id?: number;
  fornecedor_id?: number;
  quantidade: number;
  preco_unitario: number;
  subtotal?: number;
  created_at?: Date;
  updated_at?: Date;
}

@Model('carrinho_itens')
export class CarrinhoItensORM extends BaseModel {
  static tableName = 'carrinho_itens';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    usuario_id: {
      type: 'INTEGER' as const,
      nullable: true
,
      default: 1
    },
    produto_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    contrato_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    fornecedor_id: {
      type: 'INTEGER' as const,
      nullable: true

    },
    quantidade: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    preco_unitario: {
      type: 'NUMERIC' as const,
      nullable: false

    },
    subtotal: {
      type: 'NUMERIC' as const,
      nullable: true

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
  static async findAll(): Promise<ICarrinhoItens[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<ICarrinhoItens | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<ICarrinhoItens, 'id' | 'created_at' | 'updated_at'>): Promise<ICarrinhoItens> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<ICarrinhoItens>): Promise<ICarrinhoItens | null> {
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

export { ICarrinhoItens };
export default CarrinhoItensORM;
