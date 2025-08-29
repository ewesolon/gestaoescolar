import { Pool } from 'pg';

export interface ItemControleQualidade {
  id?: number;
  produto_id: number;
  lote: string;
  data_fabricacao: Date;
  data_validade: Date;
  quantidade: number;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'quarentena';
  observacoes?: string;
  usuario_analise_id?: number;
  data_analise?: Date;
  motivo_rejeicao?: string;
  fornecedor_id: number;
  recebimento_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface AnaliseQualidade {
  id?: number;
  item_controle_id: number;
  criterio: string;
  resultado: 'conforme' | 'nao_conforme';
  observacoes?: string;
  usuario_id: number;
  created_at?: Date;
}

export class ControleQualidadeModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async criarItem(item: Omit<ItemControleQualidade, 'id' | 'created_at' | 'updated_at'>): Promise<ItemControleQualidade> {
    const query = `
      INSERT INTO controle_qualidade (
        produto_id, lote, data_fabricacao, data_validade, quantidade,
        status, observacoes, fornecedor_id, recebimento_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      item.produto_id,
      item.lote,
      item.data_fabricacao,
      item.data_validade,
      item.quantidade,
      item.status,
      item.observacoes,
      item.fornecedor_id,
      item.recebimento_id
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async buscarItensQuarentena(): Promise<ItemControleQualidade[]> {
    const query = `
      SELECT cq.*, 
             p.nome as produto_nome,
             p.unidade_medida,
             f.nome as fornecedor_nome
      FROM controle_qualidade cq
      JOIN produtos p ON cq.produto_id = p.id
      JOIN fornecedores f ON cq.fornecedor_id = f.id
      WHERE cq.status = 'quarentena'
      ORDER BY cq.created_at DESC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async buscarItensPendentes(): Promise<ItemControleQualidade[]> {
    const query = `
      SELECT cq.*, 
             p.nome as produto_nome,
             p.unidade_medida,
             f.nome as fornecedor_nome
      FROM controle_qualidade cq
      JOIN produtos p ON cq.produto_id = p.id
      JOIN fornecedores f ON cq.fornecedor_id = f.id
      WHERE cq.status = 'pendente'
      ORDER BY cq.data_validade ASC, cq.created_at ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async buscarPorId(id: number): Promise<ItemControleQualidade | null> {
    const query = `
      SELECT cq.*, 
             p.nome as produto_nome,
             p.unidade_medida,
             f.nome as fornecedor_nome,
             u.nome as usuario_analise_nome
      FROM controle_qualidade cq
      JOIN produtos p ON cq.produto_id = p.id
      JOIN fornecedores f ON cq.fornecedor_id = f.id
      LEFT JOIN usuarios u ON cq.usuario_analise_id = u.id
      WHERE cq.id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async aprovarItem(id: number, usuarioId: number, observacoes?: string): Promise<ItemControleQualidade | null> {
    const query = `
      UPDATE controle_qualidade 
      SET status = 'aprovado',
          usuario_analise_id = $1,
          data_analise = CURRENT_TIMESTAMP,
          observacoes = COALESCE($2, observacoes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await this.pool.query(query, [usuarioId, observacoes, id]);
    return result.rows[0] || null;
  }

  async rejeitarItem(id: number, usuarioId: number, motivo: string): Promise<ItemControleQualidade | null> {
    const query = `
      UPDATE controle_qualidade 
      SET status = 'rejeitado',
          usuario_analise_id = $1,
          data_analise = CURRENT_TIMESTAMP,
          motivo_rejeicao = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await this.pool.query(query, [usuarioId, motivo, id]);
    return result.rows[0] || null;
  }

  async colocarQuarentena(id: number, usuarioId: number, motivo: string): Promise<ItemControleQualidade | null> {
    const query = `
      UPDATE controle_qualidade 
      SET status = 'quarentena',
          usuario_analise_id = $1,
          data_analise = CURRENT_TIMESTAMP,
          observacoes = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await this.pool.query(query, [usuarioId, motivo, id]);
    return result.rows[0] || null;
  }

  async adicionarAnalise(analise: Omit<AnaliseQualidade, 'id' | 'created_at'>): Promise<AnaliseQualidade> {
    const query = `
      INSERT INTO analises_qualidade (item_controle_id, criterio, resultado, observacoes, usuario_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      analise.item_controle_id,
      analise.criterio,
      analise.resultado,
      analise.observacoes,
      analise.usuario_id
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async buscarAnalises(itemControleId: number): Promise<AnaliseQualidade[]> {
    const query = `
      SELECT aq.*, u.nome as usuario_nome
      FROM analises_qualidade aq
      JOIN usuarios u ON aq.usuario_id = u.id
      WHERE aq.item_controle_id = $1
      ORDER BY aq.created_at DESC
    `;
    
    const result = await this.pool.query(query, [itemControleId]);
    return result.rows;
  }

  async buscarItensVencendo(dias: number = 7): Promise<ItemControleQualidade[]> {
    const query = `
      SELECT cq.*, 
             p.nome as produto_nome,
             p.unidade_medida,
             f.nome as fornecedor_nome
      FROM controle_qualidade cq
      JOIN produtos p ON cq.produto_id = p.id
      JOIN fornecedores f ON cq.fornecedor_id = f.id
      WHERE cq.status IN ('aprovado', 'quarentena')
        AND cq.data_validade <= CURRENT_DATE + INTERVAL '${dias} days'
        AND cq.data_validade > CURRENT_DATE
      ORDER BY cq.data_validade ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async buscarItensVencidos(): Promise<ItemControleQualidade[]> {
    const query = `
      SELECT cq.*, 
             p.nome as produto_nome,
             p.unidade_medida,
             f.nome as fornecedor_nome
      FROM controle_qualidade cq
      JOIN produtos p ON cq.produto_id = p.id
      JOIN fornecedores f ON cq.fornecedor_id = f.id
      WHERE cq.status IN ('aprovado', 'quarentena', 'pendente')
        AND cq.data_validade < CURRENT_DATE
      ORDER BY cq.data_validade ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  async obterEstatisticas(): Promise<any> {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
        COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
        COUNT(*) FILTER (WHERE status = 'rejeitado') as rejeitados,
        COUNT(*) FILTER (WHERE status = 'quarentena') as quarentena,
        COUNT(*) FILTER (WHERE data_validade < CURRENT_DATE) as vencidos,
        COUNT(*) FILTER (WHERE data_validade <= CURRENT_DATE + INTERVAL '7 days' AND data_validade > CURRENT_DATE) as vencendo
      FROM controle_qualidade
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    `;
    
    const result = await this.pool.query(query);
    return result.rows[0];
  }
}