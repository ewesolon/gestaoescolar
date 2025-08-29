const db = require('../database');

console.log('🔄 Executando migration: Controle de Consumo de Contratos...');

async function runMigration() {
  try {
    // Iniciar transação
    await db.query('BEGIN');

    // 1. Garantir que a tabela movimentacoes_consumo_contratos existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS movimentacoes_consumo_contratos (
        id SERIAL PRIMARY KEY,
        contrato_produto_id INTEGER NOT NULL,
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('CONSUMO', 'ESTORNO', 'AJUSTE', 'RESERVA', 'LIBERACAO_RESERVA')),
        quantidade_utilizada DECIMAL(10,3) NOT NULL,
        valor_utilizado DECIMAL(12,2),
        justificativa TEXT NOT NULL,
        data_movimentacao DATE NOT NULL,
        usuario_id INTEGER NOT NULL,
        observacoes TEXT,
        documento_referencia TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contrato_produto_id) REFERENCES contrato_produtos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )
    `);

    // 2. Criar índices para otimização
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_movimentacoes_consumo_contrato_produto 
      ON movimentacoes_consumo_contratos(contrato_produto_id, data_movimentacao DESC)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_movimentacoes_consumo_data 
      ON movimentacoes_consumo_contratos(data_movimentacao DESC)
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_movimentacoes_consumo_usuario 
      ON movimentacoes_consumo_contratos(usuario_id)
    `);

    // 3. Remover view se existir (para recriar)
    await db.query('DROP VIEW IF EXISTS view_saldo_contratos_itens');

    // 4. Criar view otimizada para consulta de saldos
    await db.query(`
      CREATE VIEW view_saldo_contratos_itens AS
      SELECT 
        cp.id as contrato_produto_id,
        cp.produto_id,
        p.nome as produto_nome,
        p.unidade as produto_unidade,
        cp.contrato_id,
        c.numero as contrato_numero,
        c.data_inicio,
        c.data_fim,
        
        -- Quantidades base
        cp.limite as quantidade_original,
        COALESCE(aditivos.quantidade_adicional, 0) as quantidade_aditivos,
        (cp.limite + COALESCE(aditivos.quantidade_adicional, 0)) as quantidade_total,
        
        -- Quantidades utilizadas (CONSUMO - ESTORNO)
        COALESCE(consumo.quantidade_utilizada, 0) as quantidade_utilizada,
        (cp.limite + COALESCE(aditivos.quantidade_adicional, 0) - COALESCE(consumo.quantidade_utilizada, 0)) as quantidade_disponivel,
        
        -- Quantidades reservadas
        COALESCE(reservas.quantidade_reservada, 0) as quantidade_reservada,
        (cp.limite + COALESCE(aditivos.quantidade_adicional, 0) - COALESCE(consumo.quantidade_utilizada, 0) - COALESCE(reservas.quantidade_reservada, 0)) as quantidade_disponivel_real,
        
        -- Valores
        cp.preco as valor_unitario,
        ((cp.limite + COALESCE(aditivos.quantidade_adicional, 0) - COALESCE(consumo.quantidade_utilizada, 0)) * cp.preco) as valor_total_disponivel,
        
        -- Status calculado
        CASE 
          WHEN (cp.limite + COALESCE(aditivos.quantidade_adicional, 0) - COALESCE(consumo.quantidade_utilizada, 0)) <= 0 THEN 'ESGOTADO'
          WHEN (COALESCE(consumo.quantidade_utilizada, 0) / NULLIF(cp.limite + COALESCE(aditivos.quantidade_adicional, 0), 0)) >= 0.9 THEN 'BAIXO_ESTOQUE'
          ELSE 'DISPONIVEL'
        END as status,
        
        -- Percentual utilizado
        CASE 
          WHEN (cp.limite + COALESCE(aditivos.quantidade_adicional, 0)) > 0 
          THEN (COALESCE(consumo.quantidade_utilizada, 0) / (cp.limite + COALESCE(aditivos.quantidade_adicional, 0))) * 100
          ELSE 0
        END as percentual_utilizado

      FROM contrato_produtos cp
      JOIN produtos p ON cp.produto_id = p.id
      JOIN contratos c ON cp.contrato_id = c.id
      LEFT JOIN (
        SELECT 
          contrato_produto_id,
          SUM(quantidade_adicional) as quantidade_adicional
        FROM aditivos_contratos_itens
        GROUP BY contrato_produto_id
      ) aditivos ON cp.id = aditivos.contrato_produto_id
      LEFT JOIN (
        SELECT 
          contrato_produto_id,
          SUM(CASE 
            WHEN tipo = 'CONSUMO' THEN quantidade_utilizada 
            WHEN tipo = 'ESTORNO' THEN -quantidade_utilizada
            WHEN tipo = 'AJUSTE' THEN quantidade_utilizada
            ELSE 0
          END) as quantidade_utilizada
        FROM movimentacoes_consumo_contratos
        WHERE tipo IN ('CONSUMO', 'ESTORNO', 'AJUSTE')
        GROUP BY contrato_produto_id
      ) consumo ON cp.id = consumo.contrato_produto_id
      LEFT JOIN (
        SELECT 
          contrato_produto_id,
          SUM(CASE 
            WHEN tipo = 'RESERVA' THEN quantidade_utilizada 
            WHEN tipo = 'LIBERACAO_RESERVA' THEN -quantidade_utilizada
            ELSE 0
          END) as quantidade_reservada
        FROM movimentacoes_consumo_contratos
        WHERE tipo IN ('RESERVA', 'LIBERACAO_RESERVA')
        GROUP BY contrato_produto_id
      ) reservas ON cp.id = reservas.contrato_produto_id
    `);

    // 5. Criar função para atualizar updated_at automaticamente
    await db.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // 6. Criar trigger para atualizar updated_at automaticamente
    await db.query(`
      DROP TRIGGER IF EXISTS update_movimentacoes_consumo_updated_at ON movimentacoes_consumo_contratos
    `);
    
    await db.query(`
      CREATE TRIGGER update_movimentacoes_consumo_updated_at
      BEFORE UPDATE ON movimentacoes_consumo_contratos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);

    // Confirmar transação
    await db.query('COMMIT');
    
    console.log('✅ Migration executada com sucesso: Controle de Consumo de Contratos');
    
  } catch (error) {
    // Reverter transação em caso de erro
    await db.query('ROLLBACK');
    console.error('❌ Erro na migration:', error);
    throw error;
  }
}

// Executar migration se chamado diretamente
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };