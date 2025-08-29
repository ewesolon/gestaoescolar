import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IPedidosItens {
  id?: number;
  pedido_fornecedor_id: number;
  produto_id: number;
  contrato_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  observacoes_item?: string;
  data_entrega_prevista?: Date;
  status_entrega?: string;
  quantidade_recebida?: number;
  quantidade_pendente?: number;
  data_ultima_atualizacao?: Date;
}

@Model('pedidos_itens')
export class PedidosItensORM extends BaseModel {
  static tableName = 'pedidos_itens';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true

    },
    pedido_fornecedor_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    produto_id: {
      type: 'INTEGER' as const,
      nullable: false

    },
    contrato_id: {
      type: 'INTEGER' as const,
      nullable: false

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
      nullable: false

    },
    observacoes_item: {
      type: 'TEXT' as const,
      nullable: true

    },
    data_entrega_prevista: {
      type: 'TIMESTAMP' as const,
      nullable: true

    },
    status_entrega: {
      type: 'VARCHAR' as const,
      nullable: true
,
      default: 'PENDENTE'
    },
    quantidade_recebida: {
      type: 'NUMERIC' as const,
      nullable: true
,
      default: 0
    },
    quantidade_pendente: {
      type: 'NUMERIC' as const,
      nullable: true
,
      default: 0
    },
    data_ultima_atualizacao: {
      type: 'TIMESTAMP' as const,
      nullable: true
,
      default: 'CURRENT_TIMESTAMP'
    },
  };


  // Métodos básicos do modelo
  static async findAll(): Promise<IPedidosItens[]> {
    const result = await db.query(`SELECT * FROM ${this.tableName} ORDER BY id`);
    return result.rows;
  }

  static async findById(id: number): Promise<IPedidosItens | null> {
    const result = await db.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async create(data: Omit<IPedidosItens, 'id' | 'created_at' | 'updated_at'>): Promise<IPedidosItens> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const result = await db.query(
      `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async update(id: number, data: Partial<IPedidosItens>): Promise<IPedidosItens | null> {
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

export { IPedidosItens };
export default PedidosItensORM;
