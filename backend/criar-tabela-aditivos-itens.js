const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function criarTabelaAditivosItens() {
  try {
    console.log('🔧 Criando tabela aditivos_contratos_itens...');
    
    // Criar a tabela aditivos_contratos_itens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aditivos_contratos_itens (
        id SERIAL PRIMARY KEY,
        aditivo_id INTEGER NOT NULL,
        contrato_produto_id INTEGER NOT NULL,
        quantidade_original DECIMAL(10,3) NOT NULL,
        percentual_acrescimo DECIMAL(5,2) NOT NULL,
        quantidade_adicional DECIMAL(10,3) NOT NULL,
        quantidade_nova DECIMAL(10,3) NOT NULL,
        valor_unitario DECIMAL(10,2) NOT NULL,
        valor_adicional DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (aditivo_id) REFERENCES aditivos_contratos(id) ON DELETE CASCADE,
        FOREIGN KEY (contrato_produto_id) REFERENCES contrato_produtos(id)
      )
    `);
    
    console.log('✅ Tabela aditivos_contratos_itens criada com sucesso!');
    
    // Criar índices para performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aditivos_itens_aditivo 
      ON aditivos_contratos_itens(aditivo_id)
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_aditivos_itens_contrato_produto 
      ON aditivos_contratos_itens(contrato_produto_id)
    `);
    
    console.log('✅ Índices criados com sucesso!');
    
    // Verificar se a tabela foi criada
    const verificacao = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'aditivos_contratos_itens' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela aditivos_contratos_itens:');
    verificacao.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
  } finally {
    await pool.end();
  }
}

criarTabelaAditivosItens();