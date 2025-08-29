import { BaseModel } from '../orm/BaseModel';
import { Model } from '../orm/Migration';
import db from '../config/database';

export interface IPedidoItensModalidadesConfig {
  id?: number;
  pedido_item_id: number;
  modalidade_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface IModalidadeSelecionada {
  modalidade_id: number;
  nome_modalidade: string;
  valor_repasse: number;
  ativo: boolean;
}

export interface IPedidoItemComModalidades {
  pedido_item_id: number;
  produto_id: number;
  nome_produto: string;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  modalidades_selecionadas: IModalidadeSelecionada[];
}

@Model('pedido_itens_modalidades_config')
export class PedidoItensModalidadesConfigORM extends BaseModel {
  static tableName = 'pedido_itens_modalidades_config';

  static fields = {
    id: {
      type: 'SERIAL' as const,
      primaryKey: true
    },
    pedido_item_id: {
      type: 'INTEGER' as const,
      nullable: false
    },
    modalidade_id: {
      type: 'INTEGER' as const,
      nullable: false
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
    pedido_item: {
      type: 'belongsTo',
      model: 'PedidosItens',
      foreignKey: 'pedido_item_id'
    },
    modalidade: {
      type: 'belongsTo',
      model: 'Modalidade',
      foreignKey: 'modalidade_id'
    }
  };

  /**
   * Busca modalidades configuradas para um item do pedido
   */
  static async findByPedidoItem(pedido_item_id: number): Promise<IModalidadeSelecionada[]> {
    try {
      const result = await db.all(`
        SELECT 
          pimc.modalidade_id,
          m.nome as nome_modalidade,
          m.valor_repasse,
          true as ativo
        FROM pedido_itens_modalidades_config pimc
        JOIN modalidades m ON pimc.modalidade_id = m.id
        WHERE pimc.pedido_item_id = $1
        ORDER BY m.nome
      `, [pedido_item_id]);
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar modalidades do item:', error);
      throw error;
    }
  }

  /**
   * Busca todos os itens de um pedido com suas modalidades configuradas
   */
  static async findItensPedidoComModalidades(pedido_id: number): Promise<IPedidoItemComModalidades[]> {
    try {
      // Buscar itens do pedido
      const itens = await db.all(`
        SELECT 
          pi.id as pedido_item_id,
          pi.produto_id,
          p.nome as nome_produto,
          pi.quantidade,
          pi.preco_unitario,
          pi.subtotal
        FROM pedidos_fornecedores pf
        JOIN pedidos_itens pi ON pf.id = pi.pedido_fornecedor_id
        JOIN produtos p ON pi.produto_id = p.id
        WHERE pf.pedido_id = $1
        ORDER BY p.nome
      `, [pedido_id]);

      // Para cada item, buscar suas modalidades
      const itensComModalidades: IPedidoItemComModalidades[] = [];
      
      for (const item of itens) {
        const modalidades = await this.findByPedidoItem(item.pedido_item_id);
        
        itensComModalidades.push({
          ...item,
          modalidades_selecionadas: modalidades
        });
      }
      
      return itensComModalidades;
    } catch (error) {
      console.error('Erro ao buscar itens do pedido com modalidades:', error);
      throw error;
    }
  }

  /**
   * Configura modalidades para um item do pedido
   */
  static async configurarModalidadesItem(
    pedido_item_id: number, 
    modalidades_ids: number[]
  ): Promise<void> {
    try {
      // Iniciar transação
      await db.run('BEGIN TRANSACTION');
      
      // Remover todas as modalidades existentes para o item
      await db.run(`
        DELETE FROM pedido_itens_modalidades_config 
        WHERE pedido_item_id = $1
      `, [pedido_item_id]);
      
      // Inserir as modalidades selecionadas
      for (const modalidade_id of modalidades_ids) {
        await db.run(`
          INSERT INTO pedido_itens_modalidades_config 
          (pedido_item_id, modalidade_id, created_at, updated_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [pedido_item_id, modalidade_id]);
      }
      
      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('Erro ao configurar modalidades do item:', error);
      throw error;
    }
  }

  /**
   * Configura modalidades para múltiplos itens de um pedido
   */
  static async configurarModalidadesPedido(
    configuracoes: { pedido_item_id: number; modalidades_ids: number[] }[]
  ): Promise<void> {
    try {
      await db.run('BEGIN TRANSACTION');
      
      for (const config of configuracoes) {
        await this.configurarModalidadesItem(
          config.pedido_item_id, 
          config.modalidades_ids
        );
      }
      
      await db.run('COMMIT');
    } catch (error) {
      await db.run('ROLLBACK');
      console.error('Erro ao configurar modalidades do pedido:', error);
      throw error;
    }
  }

  /**
   * Verifica se um item tem modalidades configuradas
   */
  static async temModalidadesConfiguradas(pedido_item_id: number): Promise<boolean> {
    try {
      const result = await db.get(`
        SELECT COUNT(*) as total
        FROM pedido_itens_modalidades_config
        WHERE pedido_item_id = $1
      `, [pedido_item_id]);
      
      return result.total > 0;
    } catch (error) {
      console.error('Erro ao verificar modalidades configuradas:', error);
      throw error;
    }
  }

  /**
   * Remove configuração de modalidades de um item
   */
  static async removerConfiguracaoItem(pedido_item_id: number): Promise<void> {
    try {
      await db.run(`
        DELETE FROM pedido_itens_modalidades_config
        WHERE pedido_item_id = $1
      `, [pedido_item_id]);
    } catch (error) {
      console.error('Erro ao remover configuração de modalidades:', error);
      throw error;
    }
  }
}

export default PedidoItensModalidadesConfigORM;