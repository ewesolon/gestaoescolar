import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IFaturamentoItensModalidades {
  id?: number;
  faturamento_id: number;
  pedido_item_id: number;
  produto_id: number;
  modalidade_id: number;
  quantidade_original: number;
  quantidade_modalidade: number;
  percentual_modalidade: number;
  valor_unitario: number;
  valor_total_modalidade: number;
  valor_repasse_modalidade: number;
  observacoes?: string;
  created_at?: Date;
  updated_at?: Date;
}

@Model('faturamento_itens_modalidades')
export class FaturamentoItensModalidadesORM extends BaseModel {
  static tableName = 'faturamento_itens_modalidades';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true
    },
    faturamento_id: {
      type: 'INTEGER' as const,
      nullable: false
    },
    pedido_item_id: {
      type: 'INTEGER' as const,
      nullable: false
    },
    produto_id: {
      type: 'INTEGER' as const,
      nullable: false
    },
    modalidade_id: {
      type: 'INTEGER' as const,
      nullable: false
    },
    quantidade_original: {
      type: 'NUMERIC' as const,
      nullable: false
    },
    quantidade_modalidade: {
      type: 'NUMERIC' as const,
      nullable: false
    },
    percentual_modalidade: {
      type: 'NUMERIC' as const,
      nullable: false
    },
    valor_unitario: {
      type: 'NUMERIC' as const,
      nullable: false
    },
    valor_total_modalidade: {
      type: 'NUMERIC' as const,
      nullable: false
    },
    valor_repasse_modalidade: {
      type: 'NUMERIC' as const,
      nullable: false
    },
    observacoes: {
      type: 'TEXT' as const,
      nullable: true
    },
    created_at: {
      type: 'TIMESTAMP' as const,
      nullable: true,
      default: 'CURRENT_TIMESTAMP'
    },
    updated_at: {
      type: 'TIMESTAMP' as const,
      nullable: true,
      default: 'CURRENT_TIMESTAMP'
    }
  };

  static relationships = {
    faturamento: {
      type: 'belongsTo',
      model: 'Faturamento',
      foreignKey: 'faturamento_id'
    },
    pedido_item: {
      type: 'belongsTo',
      model: 'PedidosItens',
      foreignKey: 'pedido_item_id'
    },
    produto: {
      type: 'belongsTo',
      model: 'Produto',
      foreignKey: 'produto_id'
    },
    modalidade: {
      type: 'belongsTo',
      model: 'Modalidade',
      foreignKey: 'modalidade_id'
    }
  };

  /**
   * Busca divisões de modalidade por faturamento
   */
  static async findByFaturamento(faturamento_id: number): Promise<IFaturamentoItensModalidades[]> {
    try {
      const result = await db.all(`
        SELECT 
          fim.*,
          p.nome as nome_produto,
          m.nome as nome_modalidade,
          m.valor_repasse
        FROM faturamento_itens_modalidades fim
        JOIN produtos p ON fim.produto_id = p.id
        JOIN modalidades m ON fim.modalidade_id = m.id
        WHERE fim.faturamento_id = $1
        ORDER BY p.nome, m.nome
      `, [faturamento_id]);
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar divisões por faturamento:', error);
      throw error;
    }
  }

  /**
   * Busca divisões de modalidade por item do pedido
   */
  static async findByPedidoItem(pedido_item_id: number): Promise<IFaturamentoItensModalidades[]> {
    try {
      const result = await db.all(`
        SELECT 
          fim.*,
          p.nome as nome_produto,
          m.nome as nome_modalidade,
          m.valor_repasse
        FROM faturamento_itens_modalidades fim
        JOIN produtos p ON fim.produto_id = p.id
        JOIN modalidades m ON fim.modalidade_id = m.id
        WHERE fim.pedido_item_id = $1
        ORDER BY m.nome
      `, [pedido_item_id]);
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar divisões por item do pedido:', error);
      throw error;
    }
  }

  /**
   * Calcula estatísticas de divisão por modalidade
   */
  static async getEstatisticasPorModalidade(modalidade_id: number, periodo_inicio?: string, periodo_fim?: string): Promise<any> {
    try {
      let whereClause = 'WHERE fim.modalidade_id = $1';
      const params = [modalidade_id];
      
      if (periodo_inicio && periodo_fim) {
        whereClause += ' AND fim.created_at BETWEEN $2 AND $3';
        params.push(periodo_inicio, periodo_fim);
      }
      
      const result = await db.get(`
        SELECT 
          COUNT(*) as total_itens,
          SUM(fim.quantidade_modalidade) as quantidade_total,
          SUM(fim.valor_total_modalidade) as valor_total,
          AVG(fim.percentual_modalidade) as percentual_medio,
          m.nome as nome_modalidade,
          m.valor_repasse
        FROM faturamento_itens_modalidades fim
        JOIN modalidades m ON fim.modalidade_id = m.id
        ${whereClause}
        GROUP BY m.id, m.nome, m.valor_repasse
      `, params);
      
      return result;
    } catch (error) {
      console.error('Erro ao calcular estatísticas por modalidade:', error);
      throw error;
    }
  }
}

export default FaturamentoItensModalidadesORM;