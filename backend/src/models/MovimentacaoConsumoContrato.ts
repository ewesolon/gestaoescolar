import { openDb } from "../config/database";

export interface MovimentacaoConsumoContrato {
  id: number;
  contrato_produto_id: number;
  tipo: 'CONSUMO' | 'ESTORNO' | 'AJUSTE' | 'RESERVA' | 'LIBERACAO_RESERVA';
  quantidade_utilizada: number;
  valor_utilizado?: number;
  justificativa: string;
  data_movimentacao: string;
  usuario_id: number;
  observacoes?: string;
  documento_referencia?: string;
  created_at: string;
  updated_at: string;
}

export class MovimentacaoConsumoContratoError extends Error {
  constructor(
    message: string,
    public code: 'QUANTIDADE_INSUFICIENTE' | 'CONTRATO_VENCIDO' | 'DADOS_INVALIDOS' | 'DATA_FUTURA' | 'JUSTIFICATIVA_OBRIGATORIA',
    public details?: any
  ) {
    super(message);
    this.name = 'MovimentacaoConsumoContratoError';
  }
}

export interface SaldoContratoItem {
  contrato_produto_id: number;
  produto_id: number;
  produto_nome: string;
  produto_unidade: string;
  contrato_id: number;
  contrato_numero: string;
  data_inicio: string;
  data_fim: string;
  
  // Quantidades
  quantidade_original: number;
  quantidade_aditivos: number;
  quantidade_total: number;
  quantidade_utilizada: number;
  quantidade_disponivel: number;
  
  // Valores
  valor_unitario: number;
  valor_total_disponivel: number;
  
  // Status
  status: 'DISPONIVEL' | 'BAIXO_ESTOQUE' | 'ESGOTADO';
  percentual_utilizado: number;
}

/**
 * Cria a tabela de movimentações de consumo de contratos
 * Esta função é chamada automaticamente pela migração
 */
export async function createMovimentacaoConsumoContratoTable() {
  const db = await openDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS movimentacoes_consumo_contratos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contrato_produto_id INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('CONSUMO', 'ESTORNO', 'AJUSTE', 'RESERVA', 'LIBERACAO_RESERVA')),
      quantidade_utilizada DECIMAL(10,3) NOT NULL,
      valor_utilizado DECIMAL(12,2),
      justificativa TEXT NOT NULL,
      data_movimentacao DATE NOT NULL,
      usuario_id INTEGER NOT NULL,
      observacoes TEXT,
      documento_referencia TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (contrato_produto_id) REFERENCES contrato_produtos(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Criar índices para otimização
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movimentacoes_consumo_contrato_produto 
    ON movimentacoes_consumo_contratos(contrato_produto_id, data_movimentacao DESC)
  `);
  
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movimentacoes_consumo_data 
    ON movimentacoes_consumo_contratos(data_movimentacao DESC)
  `);
  
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_movimentacoes_consumo_usuario 
    ON movimentacoes_consumo_contratos(usuario_id)
  `);
}

/**
 * Insere uma nova movimentação de consumo
 */
export async function insertMovimentacaoConsumoContrato(
  movimentacao: Omit<MovimentacaoConsumoContrato, "id" | "created_at" | "updated_at">
) {
  // Validar dados básicos
  validarDadosMovimentacao(movimentacao);
  
  // Validar regras de negócio
  await validarMovimentacaoConsumo(
    movimentacao.contrato_produto_id,
    movimentacao.quantidade_utilizada,
    movimentacao.tipo
  );
  
  const db = await openDb();
  
  const result = await db.run(
    `INSERT INTO movimentacoes_consumo_contratos (
      contrato_produto_id, tipo, quantidade_utilizada, valor_utilizado,
      justificativa, data_movimentacao, usuario_id, observacoes, documento_referencia
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      movimentacao.contrato_produto_id,
      movimentacao.tipo,
      movimentacao.quantidade_utilizada,
      movimentacao.valor_utilizado || null,
      movimentacao.justificativa,
      movimentacao.data_movimentacao,
      movimentacao.usuario_id,
      movimentacao.observacoes || null,
      movimentacao.documento_referencia || null
    ]
  );
  
  return { ...movimentacao, id: result.lastID };
}

/**
 * Busca movimentações por item de contrato
 */
export async function getMovimentacoesByContratoItem(
  contrato_produto_id: number,
  limit?: number,
  offset?: number
) {
  const db = await openDb();
  
  let query = `
    SELECT 
      m.*,
      u.nome as usuario_nome,
      p.nome as produto_nome,
      c.numero as contrato_numero
    FROM movimentacoes_consumo_contratos m
    JOIN usuarios u ON m.usuario_id = u.id
    JOIN contrato_produtos cp ON m.contrato_produto_id = cp.id
    JOIN produtos p ON cp.produto_id = p.id
    JOIN contratos c ON cp.contrato_id = c.id
    WHERE m.contrato_produto_id = ?
    ORDER BY m.data_movimentacao DESC, m.created_at DESC
  `;
  
  const params: any[] = [contrato_produto_id];
  
  if (limit) {
    query += ` LIMIT ?`;
    params.push(limit);
    
    if (offset) {
      query += ` OFFSET ?`;
      params.push(offset);
    }
  }
  
  return await db.all<MovimentacaoConsumoContrato[]>(query, params);
}

/**
 * Busca uma movimentação específica por ID
 */
export async function getMovimentacaoById(id: number) {
  const db = await openDb();
  
  return await db.get<MovimentacaoConsumoContrato>(
    `SELECT 
      m.*,
      u.nome as usuario_nome,
      p.nome as produto_nome,
      c.numero as contrato_numero
    FROM movimentacoes_consumo_contratos m
    JOIN usuarios u ON m.usuario_id = u.id
    JOIN contrato_produtos cp ON m.contrato_produto_id = cp.id
    JOIN produtos p ON cp.produto_id = p.id
    JOIN contratos c ON cp.contrato_id = c.id
    WHERE m.id = ?`,
    [id]
  );
}

/**
 * Atualiza uma movimentação (apenas observações são editáveis)
 */
export async function updateMovimentacaoConsumoContrato(
  id: number,
  observacoes: string
) {
  // Validar se pode ser editada
  await validarEdicaoMovimentacao(id);
  
  const db = await openDb();
  
  await db.run(
    `UPDATE movimentacoes_consumo_contratos 
     SET observacoes = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [observacoes, id]
  );
}

/**
 * Remove uma movimentação (com validações)
 */
export async function deleteMovimentacaoConsumoContrato(id: number) {
  // Validar se pode ser removida
  const movimentacao = await validarRemocaoMovimentacao(id);
  
  const db = await openDb();
  
  await db.run(`DELETE FROM movimentacoes_consumo_contratos WHERE id = ?`, [id]);
  
  return movimentacao;
}

/**
 * Busca saldos de itens de contratos usando a view otimizada
 */
export async function getSaldosContratosByFornecedor(
  fornecedor_id: number,
  filtros?: {
    contrato_id?: number;
    status?: 'DISPONIVEL' | 'BAIXO_ESTOQUE' | 'ESGOTADO';
    produto_nome?: string;
  }
) {
  const db = await openDb();
  
  let query = `
    SELECT * FROM view_saldo_contratos_itens v
    JOIN contratos c ON v.contrato_id = c.id
    WHERE c.fornecedor_id = ?
  `;
  
  const params: any[] = [fornecedor_id];
  
  if (filtros?.contrato_id) {
    query += ` AND v.contrato_id = ?`;
    params.push(filtros.contrato_id);
  }
  
  if (filtros?.status) {
    query += ` AND v.status = ?`;
    params.push(filtros.status);
  }
  
  if (filtros?.produto_nome) {
    query += ` AND v.produto_nome LIKE ?`;
    params.push(`%${filtros.produto_nome}%`);
  }
  
  query += ` ORDER BY v.contrato_numero, v.produto_nome`;
  
  return await db.all<SaldoContratoItem[]>(query, params);
}

/**
 * Busca saldo de um item específico de contrato
 */
export async function getSaldoContratoItem(contrato_produto_id: number) {
  const db = await openDb();
  
  return await db.get<SaldoContratoItem>(
    `SELECT * FROM view_saldo_contratos_itens WHERE contrato_produto_id = ?`,
    [contrato_produto_id]
  );
}

/**
 * Calcula estatísticas de consumo por período
 */
export async function getEstatisticasConsumo(
  fornecedor_id: number,
  data_inicio: string,
  data_fim: string
) {
  const db = await openDb();
  
  return await db.all(`
    SELECT 
      p.nome as produto_nome,
      p.unidade,
      COUNT(m.id) as total_movimentacoes,
      SUM(CASE WHEN m.tipo = 'CONSUMO' THEN m.quantidade_utilizada ELSE 0 END) as total_consumido,
      SUM(CASE WHEN m.tipo = 'ESTORNO' THEN m.quantidade_utilizada ELSE 0 END) as total_estornado,
      AVG(m.quantidade_utilizada) as media_por_movimentacao
    FROM movimentacoes_consumo_contratos m
    JOIN contrato_produtos cp ON m.contrato_produto_id = cp.id
    JOIN produtos p ON cp.produto_id = p.id
    JOIN contratos c ON cp.contrato_id = c.id
    WHERE c.fornecedor_id = ?
      AND m.data_movimentacao BETWEEN ? AND ?
    GROUP BY p.id, p.nome, p.unidade
    ORDER BY total_consumido DESC
  `, [fornecedor_id, data_inicio, data_fim]);
}

/**
 * Busca itens com baixo estoque para um fornecedor
 */
export async function getItensBaixoEstoque(fornecedor_id: number, limite_percentual: number = 10) {
  const db = await openDb();
  
  return await db.all<SaldoContratoItem[]>(`
    SELECT * FROM view_saldo_contratos_itens v
    JOIN contratos c ON v.contrato_id = c.id
    WHERE c.fornecedor_id = ?
      AND v.status IN ('BAIXO_ESTOQUE', 'ESGOTADO')
      AND v.percentual_utilizado >= ?
    ORDER BY v.percentual_utilizado DESC, v.produto_nome
  `, [fornecedor_id, 100 - limite_percentual]);
}

/**
 * Busca resumo de saldos por fornecedor
 */
export async function getResumoSaldosFornecedor(fornecedor_id: number) {
  const db = await openDb();
  
  const resumo = await db.get(`
    SELECT 
      COUNT(*) as total_itens,
      COUNT(CASE WHEN v.status = 'DISPONIVEL' THEN 1 END) as itens_disponiveis,
      COUNT(CASE WHEN v.status = 'BAIXO_ESTOQUE' THEN 1 END) as itens_baixo_estoque,
      COUNT(CASE WHEN v.status = 'ESGOTADO' THEN 1 END) as itens_esgotados,
      SUM(v.valor_total_disponivel) as valor_total_disponivel,
      COUNT(DISTINCT v.contrato_id) as total_contratos
    FROM view_saldo_contratos_itens v
    JOIN contratos c ON v.contrato_id = c.id
    WHERE c.fornecedor_id = ?
  `, [fornecedor_id]);
  
  return resumo;
}

/**
 * Busca movimentações recentes de um fornecedor
 */
export async function getMovimentacaoesRecentesFornecedor(
  fornecedor_id: number,
  limite: number = 10
) {
  const db = await openDb();
  
  return await db.all(`
    SELECT 
      m.*,
      u.nome as usuario_nome,
      p.nome as produto_nome,
      c.numero as contrato_numero
    FROM movimentacoes_consumo_contratos m
    JOIN usuarios u ON m.usuario_id = u.id
    JOIN contrato_produtos cp ON m.contrato_produto_id = cp.id
    JOIN produtos p ON cp.produto_id = p.id
    JOIN contratos c ON cp.contrato_id = c.id
    WHERE c.fornecedor_id = ?
    ORDER BY m.data_movimentacao DESC, m.created_at DESC
    LIMIT ?
  `, [fornecedor_id, limite]);
}

/**
 * Calcula o valor total consumido por contrato
 */
export async function getValorConsumidoPorContrato(contrato_id: number) {
  const db = await openDb();
  
  return await db.get(`
    SELECT 
      c.numero as contrato_numero,
      SUM(CASE WHEN m.tipo = 'CONSUMO' THEN m.quantidade_utilizada * cp.preco ELSE 0 END) as valor_consumido,
      SUM(CASE WHEN m.tipo = 'ESTORNO' THEN m.quantidade_utilizada * cp.preco ELSE 0 END) as valor_estornado,
      COUNT(m.id) as total_movimentacoes
    FROM contratos c
    LEFT JOIN contrato_produtos cp ON c.id = cp.contrato_id
    LEFT JOIN movimentacoes_consumo_contratos m ON cp.id = m.contrato_produto_id
    WHERE c.id = ?
    GROUP BY c.id, c.numero
  `, [contrato_id]);
}

/**
 * Valida dados básicos de uma movimentação
 */
export function validarDadosMovimentacao(
  movimentacao: Omit<MovimentacaoConsumoContrato, "id" | "created_at" | "updated_at">
) {
  const erros: string[] = [];

  // Validar justificativa obrigatória
  if (!movimentacao.justificativa || movimentacao.justificativa.trim().length === 0) {
    throw new MovimentacaoConsumoContratoError(
      'Justificativa é obrigatória para registrar movimentação',
      'JUSTIFICATIVA_OBRIGATORIA'
    );
  }

  // Validar quantidade positiva
  if (movimentacao.quantidade_utilizada <= 0) {
    erros.push('Quantidade deve ser maior que zero');
  }

  // Validar data não futura
  const hoje = new Date();
  const dataMovimentacao = new Date(movimentacao.data_movimentacao);
  
  if (dataMovimentacao > hoje) {
    throw new MovimentacaoConsumoContratoError(
      'Data da movimentação não pode ser futura',
      'DATA_FUTURA',
      { data_informada: movimentacao.data_movimentacao }
    );
  }

  // Validar tipo de movimentação
  const tiposValidos = ['CONSUMO', 'ESTORNO', 'AJUSTE', 'RESERVA', 'LIBERACAO_RESERVA'];
  if (!tiposValidos.includes(movimentacao.tipo)) {
    erros.push('Tipo de movimentação inválido');
  }

  if (erros.length > 0) {
    throw new MovimentacaoConsumoContratoError(
      `Dados inválidos: ${erros.join(', ')}`,
      'DADOS_INVALIDOS',
      { erros }
    );
  }

  return true;
}

/**
 * Valida se uma movimentação pode ser registrada
 */
export async function validarMovimentacaoConsumo(
  contrato_produto_id: number,
  quantidade: number,
  tipo: 'CONSUMO' | 'ESTORNO' | 'AJUSTE' | 'RESERVA' | 'LIBERACAO_RESERVA'
) {
  const saldo = await getSaldoContratoItem(contrato_produto_id);
  
  if (!saldo) {
    throw new MovimentacaoConsumoContratoError(
      'Item de contrato não encontrado',
      'DADOS_INVALIDOS',
      { contrato_produto_id }
    );
  }
  
  if (tipo === 'CONSUMO' && quantidade > saldo.quantidade_disponivel) {
    throw new MovimentacaoConsumoContratoError(
      `Quantidade insuficiente. Disponível: ${saldo.quantidade_disponivel} ${saldo.produto_unidade}`,
      'QUANTIDADE_INSUFICIENTE',
      { 
        quantidade_solicitada: quantidade,
        quantidade_disponivel: saldo.quantidade_disponivel,
        produto: saldo.produto_nome,
        unidade: saldo.produto_unidade
      }
    );
  }
  
  // Validar se o contrato está vigente
  const hoje = new Date().toISOString().split('T')[0];
  if (saldo.data_fim && saldo.data_fim < hoje) {
    throw new MovimentacaoConsumoContratoError(
      'Contrato vencido. Não é possível registrar movimentações.',
      'CONTRATO_VENCIDO',
      { 
        data_fim: saldo.data_fim,
        contrato_numero: saldo.contrato_numero
      }
    );
  }
  
  return {
    valido: true,
    saldo_atual: saldo.quantidade_disponivel,
    saldo_apos_movimentacao: tipo === 'CONSUMO' 
      ? saldo.quantidade_disponivel - quantidade
      : saldo.quantidade_disponivel + quantidade,
    item: {
      produto_nome: saldo.produto_nome,
      produto_unidade: saldo.produto_unidade,
      contrato_numero: saldo.contrato_numero
    }
  };
}

/**
 * Valida se uma movimentação pode ser editada
 */
export async function validarEdicaoMovimentacao(id: number) {
  const movimentacao = await getMovimentacaoById(id);
  
  if (!movimentacao) {
    throw new MovimentacaoConsumoContratoError(
      'Movimentação não encontrada',
      'DADOS_INVALIDOS',
      { id }
    );
  }

  // Verificar se a movimentação não é muito antiga (ex: mais de 30 dias)
  const dataMovimentacao = new Date(movimentacao.data_movimentacao);
  const hoje = new Date();
  const diasDiferenca = Math.floor((hoje.getTime() - dataMovimentacao.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasDiferenca > 30) {
    throw new MovimentacaoConsumoContratoError(
      'Não é possível editar movimentações com mais de 30 dias',
      'DADOS_INVALIDOS',
      { dias_diferenca: diasDiferenca }
    );
  }

  return movimentacao;
}

/**
 * Valida se uma movimentação pode ser removida
 */
export async function validarRemocaoMovimentacao(id: number) {
  const movimentacao = await getMovimentacaoById(id);
  
  if (!movimentacao) {
    throw new MovimentacaoConsumoContratoError(
      'Movimentação não encontrada',
      'DADOS_INVALIDOS',
      { id }
    );
  }

  // Verificar se a movimentação não é muito antiga (ex: mais de 7 dias)
  const dataMovimentacao = new Date(movimentacao.data_movimentacao);
  const hoje = new Date();
  const diasDiferenca = Math.floor((hoje.getTime() - dataMovimentacao.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diasDiferenca > 7) {
    throw new MovimentacaoConsumoContratoError(
      'Não é possível remover movimentações com mais de 7 dias',
      'DADOS_INVALIDOS',
      { dias_diferenca: diasDiferenca }
    );
  }

  return movimentacao;
}