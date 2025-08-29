const db = require('../database');

console.log('🔄 Executando migration: Sistema Financeiro...');

try {
  // Iniciar transação
  db.exec('BEGIN TRANSACTION');

  // 1. Criar tabela de contas a pagar
  db.exec(`
    CREATE TABLE IF NOT EXISTS contas_pagar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      fornecedor_id INTEGER NOT NULL,
      numero_documento VARCHAR(50) NOT NULL,
      descricao TEXT NOT NULL,
      valor_original DECIMAL(12,2) NOT NULL,
      valor_desconto DECIMAL(12,2) DEFAULT 0.00,
      valor_juros DECIMAL(12,2) DEFAULT 0.00,
      valor_final DECIMAL(12,2) NOT NULL,
      data_vencimento DATE NOT NULL,
      data_pagamento DATE,
      status VARCHAR(20) DEFAULT 'pendente',
      forma_pagamento VARCHAR(50),
      observacoes TEXT,
      usuario_id INTEGER,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_atualizacao DATETIME,
      FOREIGN KEY (pedido_id) REFERENCES pedidos_modernos(id),
      FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // 2. Criar tabela de categorias de despesa
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias_despesa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(100) NOT NULL UNIQUE,
      descricao TEXT,
      cor VARCHAR(7) DEFAULT '#007AFF',
      ativo BOOLEAN DEFAULT true,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Criar tabela de formas de pagamento
  db.exec(`
    CREATE TABLE IF NOT EXISTS formas_pagamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome VARCHAR(50) NOT NULL UNIQUE,
      descricao TEXT,
      taxa_juros DECIMAL(5,2) DEFAULT 0.00,
      prazo_compensacao INTEGER DEFAULT 0,
      ativo BOOLEAN DEFAULT true,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Criar tabela de fluxo de caixa
  db.exec(`
    CREATE TABLE IF NOT EXISTS fluxo_caixa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_movimento DATE NOT NULL,
      tipo VARCHAR(20) NOT NULL, -- 'entrada' ou 'saida'
      categoria_id INTEGER,
      descricao TEXT NOT NULL,
      valor DECIMAL(12,2) NOT NULL,
      conta_pagar_id INTEGER,
      usuario_id INTEGER,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias_despesa(id),
      FOREIGN KEY (conta_pagar_id) REFERENCES contas_pagar(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // 5. Criar tabela de configurações financeiras
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracoes_financeiras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chave VARCHAR(100) NOT NULL UNIQUE,
      valor TEXT NOT NULL,
      descricao TEXT,
      tipo VARCHAR(20) DEFAULT 'string',
      data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Criar índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contas_pagar_status 
    ON contas_pagar(status)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento 
    ON contas_pagar(data_vencimento)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor 
    ON contas_pagar(fornecedor_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_data 
    ON fluxo_caixa(data_movimento)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_fluxo_caixa_tipo 
    ON fluxo_caixa(tipo)
  `);

  // 7. Inserir categorias padrão
  const categoriasPadrao = [
    { nome: 'Alimentação Escolar', descricao: 'Gastos com produtos alimentícios', cor: '#4CAF50' },
    { nome: 'Fornecedores', descricao: 'Pagamentos a fornecedores', cor: '#2196F3' },
    { nome: 'Transporte', descricao: 'Custos de frete e transporte', cor: '#FF9800' },
    { nome: 'Administrativo', descricao: 'Despesas administrativas', cor: '#9C27B0' },
    { nome: 'Outros', descricao: 'Outras despesas', cor: '#607D8B' }
  ];

  const insertCategoria = db.prepare(`
    INSERT OR IGNORE INTO categorias_despesa (nome, descricao, cor)
    VALUES (?, ?, ?)
  `);

  categoriasPadrao.forEach(categoria => {
    insertCategoria.run(categoria.nome, categoria.descricao, categoria.cor);
  });

  // 8. Inserir formas de pagamento padrão
  const formasPagamentoPadrao = [
    { nome: 'Dinheiro', descricao: 'Pagamento em espécie', taxa_juros: 0, prazo_compensacao: 0 },
    { nome: 'Transferência Bancária', descricao: 'TED/DOC/PIX', taxa_juros: 0, prazo_compensacao: 1 },
    { nome: 'Boleto Bancário', descricao: 'Pagamento via boleto', taxa_juros: 0, prazo_compensacao: 2 },
    { nome: 'Cartão de Crédito', descricao: 'Pagamento no cartão', taxa_juros: 2.5, prazo_compensacao: 30 },
    { nome: 'Cheque', descricao: 'Pagamento em cheque', taxa_juros: 0, prazo_compensacao: 3 }
  ];

  const insertFormaPagamento = db.prepare(`
    INSERT OR IGNORE INTO formas_pagamento (nome, descricao, taxa_juros, prazo_compensacao)
    VALUES (?, ?, ?, ?)
  `);

  formasPagamentoPadrao.forEach(forma => {
    insertFormaPagamento.run(forma.nome, forma.descricao, forma.taxa_juros, forma.prazo_compensacao);
  });

  // 9. Inserir configurações padrão
  const configuracoesPadrao = [
    { chave: 'dias_alerta_vencimento', valor: '7', descricao: 'Dias de antecedência para alertar vencimento', tipo: 'number' },
    { chave: 'desconto_pagamento_vista', valor: '2.0', descricao: 'Percentual de desconto para pagamento à vista', tipo: 'number' },
    { chave: 'juros_atraso_mes', valor: '1.0', descricao: 'Percentual de juros por mês de atraso', tipo: 'number' },
    { chave: 'email_notificacao_financeiro', valor: 'financeiro@escola.com', descricao: 'Email para notificações financeiras', tipo: 'string' },
    { chave: 'gerar_contas_automaticamente', valor: 'true', descricao: 'Gerar contas a pagar automaticamente', tipo: 'boolean' }
  ];

  const insertConfiguracao = db.prepare(`
    INSERT OR IGNORE INTO configuracoes_financeiras (chave, valor, descricao, tipo)
    VALUES (?, ?, ?, ?)
  `);

  configuracoesPadrao.forEach(config => {
    insertConfiguracao.run(config.chave, config.valor, config.descricao, config.tipo);
  });

  // 10. Criar trigger para atualizar status de contas vencidas
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS atualizar_contas_vencidas
    AFTER UPDATE ON contas_pagar
    WHEN NEW.status = 'pendente' AND date(NEW.data_vencimento) < date('now')
    BEGIN
      UPDATE contas_pagar 
      SET status = 'vencido', data_atualizacao = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END
  `);

  // 11. Criar view para dashboard financeiro
  db.exec(`
    CREATE VIEW IF NOT EXISTS vw_dashboard_financeiro AS
    SELECT 
      'resumo_mensal' as tipo,
      strftime('%Y-%m', data_criacao) as periodo,
      SUM(CASE WHEN status = 'pendente' THEN valor_final ELSE 0 END) as total_pendente,
      SUM(CASE WHEN status = 'pago' THEN valor_final ELSE 0 END) as total_pago,
      SUM(CASE WHEN status = 'vencido' THEN valor_final ELSE 0 END) as total_vencido,
      COUNT(*) as total_contas
    FROM contas_pagar
    GROUP BY strftime('%Y-%m', data_criacao)
  `);

  // 12. Criar diretório para relatórios financeiros
  const fs = require('fs');
  const relatoriosDir = path.join(__dirname, '../../uploads/relatorios');
  if (!fs.existsSync(relatoriosDir)) {
    fs.mkdirSync(relatoriosDir, { recursive: true });
    console.log('📁 Diretório de relatórios criado');
  }

  // Confirmar transação
  db.exec('COMMIT');

  console.log('✅ Migration de Sistema Financeiro executada com sucesso!');
  console.log('📋 Tabelas criadas:');
  console.log('   - contas_pagar');
  console.log('   - categorias_despesa');
  console.log('   - formas_pagamento');
  console.log('   - fluxo_caixa');
  console.log('   - configuracoes_financeiras');
  console.log('🔍 Índices e triggers criados');
  console.log('📝 Dados padrão inseridos');
  console.log('📊 View de dashboard criada');

} catch (error) {
  // Reverter em caso de erro
  db.exec('ROLLBACK');
  console.error('❌ Erro na migration de Sistema Financeiro:', error);
  throw error;
} finally {
  db.close();
}