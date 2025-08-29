import { Pool } from 'pg';

export interface ContaPagar {
  id?: number;
  fornecedor_id: number;
  pedido_id?: number;
  contrato_id?: number;
  numero_documento: string;
  descricao: string;
  valor_original: number;
  valor_pago: number;
  valor_pendente: number;
  data_vencimento: Date;
  data_pagamento?: Date;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  observacoes?: string;
  usuario_criacao_id: number;
  usuario_pagamento_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ContaReceber {
  id?: number;
  escola_id: number;
  pedido_id?: number;
  numero_documento: string;
  descricao: string;
  valor_original: number;
  valor_recebido: number;
  valor_pendente: number;
  data_vencimento: Date;
  data_recebimento?: Date;
  status: 'pendente' | 'recebido' | 'vencido' | 'cancelado';
  observacoes?: string;
  usuario_criacao_id: number;
  usuario_recebimento_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface FluxoCaixa {
  data: Date;
  entradas: number;
  saidas: number;
  saldo: number;
  descricao: string;
}

export class FinanceiroService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  // === CONTAS A PAGAR ===
  async criarContaPagar(conta: Omit<ContaPagar, 'id' | 'created_at' | 'updated_at'>): Promise<ContaPagar> {
    const query = `
      INSERT INTO contas_pagar (
        fornecedor_id, pedido_id, contrato_id, numero_documento, descricao,
        valor_original, valor_pago, valor_pendente, data_vencimento,
        status, observacoes, usuario_criacao_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      conta.fornecedor_id,
      conta.pedido_id,
      conta.contrato_id,
      conta.numero_documento,
      conta.descricao,
      conta.valor_original,
      conta.valor_pago,
      conta.valor_pendente,
      conta.data_vencimento,
      conta.status,
      conta.observacoes,
      conta.usuario_criacao_id
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async gerarContasAutomaticas(pedidoId: number, usuarioId: number): Promise<ContaPagar[]> {
    // Buscar dados do pedido
    const pedidoQuery = `
      SELECT p.*, f.nome as fornecedor_nome, c.numero as contrato_numero
      FROM pedidos p
      JOIN fornecedores f ON p.fornecedor_id = f.id
      LEFT JOIN contratos c ON p.contrato_id = c.id
      WHERE p.id = $1
    `;
    
    const pedidoResult = await this.pool.query(pedidoQuery, [pedidoId]);
    
    if (pedidoResult.rows.length === 0) {
      throw new Error('Pedido não encontrado');
    }

    const pedido = pedidoResult.rows[0];
    const contasGeradas: ContaPagar[] = [];

    // Gerar conta baseada no valor do pedido
    const conta = await this.criarContaPagar({
      fornecedor_id: pedido.fornecedor_id,
      pedido_id: pedidoId,
      contrato_id: pedido.contrato_id,
      numero_documento: `PED-${pedidoId}`,
      descricao: `Pagamento referente ao pedido ${pedidoId} - ${pedido.fornecedor_nome}`,
      valor_original: pedido.valor_total,
      valor_pago: 0,
      valor_pendente: pedido.valor_total,
      data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      status: 'pendente',
      observacoes: `Gerado automaticamente para o pedido ${pedidoId}`,
      usuario_criacao_id: usuarioId
    });

    contasGeradas.push(conta);
    return contasGeradas;
  }

  async pagarConta(contaId: number, valorPagamento: number, usuarioId: number, observacoes?: string): Promise<ContaPagar | null> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Buscar a conta
      const contaQuery = 'SELECT * FROM contas_pagar WHERE id = $1';
      const contaResult = await client.query(contaQuery, [contaId]);
      
      if (contaResult.rows.length === 0) {
        throw new Error('Conta não encontrada');
      }

      const conta = contaResult.rows[0];
      
      if (conta.status === 'pago') {
        throw new Error('Conta já está paga');
      }

      const novoValorPago = parseFloat(conta.valor_pago) + valorPagamento;
      const novoValorPendente = parseFloat(conta.valor_original) - novoValorPago;
      const novoStatus = novoValorPendente <= 0 ? 'pago' : 'pendente';

      // Atualizar a conta
      const updateQuery = `
        UPDATE contas_pagar 
        SET valor_pago = $1,
            valor_pendente = $2,
            status = $3,
            data_pagamento = CASE WHEN $3 = 'pago' THEN CURRENT_TIMESTAMP ELSE data_pagamento END,
            usuario_pagamento_id = $4,
            observacoes = COALESCE($5, observacoes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        novoValorPago, novoValorPendente, novoStatus, usuarioId, observacoes, contaId
      ]);

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async listarContasPagar(filtros?: {
    fornecedor_id?: number;
    status?: string;
    vencimento_inicio?: Date;
    vencimento_fim?: Date;
  }): Promise<ContaPagar[]> {
    let query = `
      SELECT cp.*, 
             f.nome as fornecedor_nome,
             f.cnpj as fornecedor_cnpj,
             u.nome as usuario_criacao_nome
      FROM contas_pagar cp
      JOIN fornecedores f ON cp.fornecedor_id = f.id
      JOIN usuarios u ON cp.usuario_criacao_id = u.id
      WHERE 1=1
    `;
    
    const values: any[] = [];
    let paramCount = 1;

    if (filtros?.fornecedor_id) {
      query += ` AND cp.fornecedor_id = $${paramCount}`;
      values.push(filtros.fornecedor_id);
      paramCount++;
    }

    if (filtros?.status) {
      query += ` AND cp.status = $${paramCount}`;
      values.push(filtros.status);
      paramCount++;
    }

    if (filtros?.vencimento_inicio) {
      query += ` AND cp.data_vencimento >= $${paramCount}`;
      values.push(filtros.vencimento_inicio);
      paramCount++;
    }

    if (filtros?.vencimento_fim) {
      query += ` AND cp.data_vencimento <= $${paramCount}`;
      values.push(filtros.vencimento_fim);
      paramCount++;
    }

    query += ' ORDER BY cp.data_vencimento ASC, cp.created_at DESC';

    const result = await this.pool.query(query, values);
    return result.rows;
  }

  // === CONTAS A RECEBER ===
  async criarContaReceber(conta: Omit<ContaReceber, 'id' | 'created_at' | 'updated_at'>): Promise<ContaReceber> {
    const query = `
      INSERT INTO contas_receber (
        escola_id, pedido_id, numero_documento, descricao,
        valor_original, valor_recebido, valor_pendente, data_vencimento,
        status, observacoes, usuario_criacao_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      conta.escola_id,
      conta.pedido_id,
      conta.numero_documento,
      conta.descricao,
      conta.valor_original,
      conta.valor_recebido,
      conta.valor_pendente,
      conta.data_vencimento,
      conta.status,
      conta.observacoes,
      conta.usuario_criacao_id
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async receberConta(contaId: number, valorRecebimento: number, usuarioId: number, observacoes?: string): Promise<ContaReceber | null> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Buscar a conta
      const contaQuery = 'SELECT * FROM contas_receber WHERE id = $1';
      const contaResult = await client.query(contaQuery, [contaId]);
      
      if (contaResult.rows.length === 0) {
        throw new Error('Conta não encontrada');
      }

      const conta = contaResult.rows[0];
      
      if (conta.status === 'recebido') {
        throw new Error('Conta já está recebida');
      }

      const novoValorRecebido = parseFloat(conta.valor_recebido) + valorRecebimento;
      const novoValorPendente = parseFloat(conta.valor_original) - novoValorRecebido;
      const novoStatus = novoValorPendente <= 0 ? 'recebido' : 'pendente';

      // Atualizar a conta
      const updateQuery = `
        UPDATE contas_receber 
        SET valor_recebido = $1,
            valor_pendente = $2,
            status = $3,
            data_recebimento = CASE WHEN $3 = 'recebido' THEN CURRENT_TIMESTAMP ELSE data_recebimento END,
            usuario_recebimento_id = $4,
            observacoes = COALESCE($5, observacoes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await client.query(updateQuery, [
        novoValorRecebido, novoValorPendente, novoStatus, usuarioId, observacoes, contaId
      ]);

      await client.query('COMMIT');
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // === FLUXO DE CAIXA ===
  async obterFluxoCaixa(dataInicio: Date, dataFim: Date): Promise<FluxoCaixa[]> {
    const query = `
      WITH movimentacoes AS (
        -- Entradas (Contas Recebidas)
        SELECT 
          DATE(data_recebimento) as data,
          SUM(valor_recebido) as valor,
          'entrada' as tipo,
          'Recebimentos' as descricao
        FROM contas_receber
        WHERE data_recebimento BETWEEN $1 AND $2
          AND status = 'recebido'
        GROUP BY DATE(data_recebimento)
        
        UNION ALL
        
        -- Saídas (Contas Pagas)
        SELECT 
          DATE(data_pagamento) as data,
          SUM(valor_pago) as valor,
          'saida' as tipo,
          'Pagamentos' as descricao
        FROM contas_pagar
        WHERE data_pagamento BETWEEN $1 AND $2
          AND status = 'pago'
        GROUP BY DATE(data_pagamento)
      )
      SELECT 
        data,
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END), 0) as entradas,
        COALESCE(SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END), 0) as saidas,
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END), 0) as saldo,
        STRING_AGG(DISTINCT descricao, ', ') as descricao
      FROM movimentacoes
      GROUP BY data
      ORDER BY data
    `;
    
    const result = await this.pool.query(query, [dataInicio, dataFim]);
    return result.rows;
  }

  async obterResumoFinanceiro(): Promise<any> {
    const query = `
      SELECT 
        -- Contas a Pagar
        (SELECT COALESCE(SUM(valor_pendente), 0) FROM contas_pagar WHERE status = 'pendente') as total_pagar,
        (SELECT COALESCE(SUM(valor_pendente), 0) FROM contas_pagar WHERE status = 'vencido') as total_vencido_pagar,
        (SELECT COUNT(*) FROM contas_pagar WHERE status = 'pendente') as contas_pendentes_pagar,
        
        -- Contas a Receber
        (SELECT COALESCE(SUM(valor_pendente), 0) FROM contas_receber WHERE status = 'pendente') as total_receber,
        (SELECT COALESCE(SUM(valor_pendente), 0) FROM contas_receber WHERE status = 'vencido') as total_vencido_receber,
        (SELECT COUNT(*) FROM contas_receber WHERE status = 'pendente') as contas_pendentes_receber,
        
        -- Movimentação do Mês
        (SELECT COALESCE(SUM(valor_pago), 0) FROM contas_pagar WHERE DATE(data_pagamento) >= DATE_TRUNC('month', CURRENT_DATE)) as pago_mes,
        (SELECT COALESCE(SUM(valor_recebido), 0) FROM contas_receber WHERE DATE(data_recebimento) >= DATE_TRUNC('month', CURRENT_DATE)) as recebido_mes
    `;
    
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async marcarContasVencidas(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Marcar contas a pagar vencidas
      await client.query(`
        UPDATE contas_pagar 
        SET status = 'vencido', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'pendente' AND data_vencimento < CURRENT_DATE
      `);

      // Marcar contas a receber vencidas
      await client.query(`
        UPDATE contas_receber 
        SET status = 'vencido', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'pendente' AND data_vencimento < CURRENT_DATE
      `);

      await client.query('COMMIT');
      console.log('Contas vencidas atualizadas com sucesso');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao marcar contas vencidas:', error);
    } finally {
      client.release();
    }
  }

  async obterContasVencendoEm(dias: number): Promise<{ pagar: ContaPagar[]; receber: ContaReceber[] }> {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + dias);

    const contasPagar = await this.pool.query(`
      SELECT cp.*, f.nome as fornecedor_nome
      FROM contas_pagar cp
      JOIN fornecedores f ON cp.fornecedor_id = f.id
      WHERE cp.status = 'pendente' 
        AND cp.data_vencimento <= $1
        AND cp.data_vencimento > CURRENT_DATE
      ORDER BY cp.data_vencimento
    `, [dataLimite]);

    const contasReceber = await this.pool.query(`
      SELECT cr.*, e.nome as escola_nome
      FROM contas_receber cr
      JOIN escolas e ON cr.escola_id = e.id
      WHERE cr.status = 'pendente' 
        AND cr.data_vencimento <= $1
        AND cr.data_vencimento > CURRENT_DATE
      ORDER BY cr.data_vencimento
    `, [dataLimite]);

    return {
      pagar: contasPagar.rows,
      receber: contasReceber.rows
    };
  }
}