const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verificarEstrutura() {
  try {
    console.log('🔍 Verificando estrutura da tabela contrato_produtos...');
    
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'contrato_produtos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Colunas da tabela contrato_produtos:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\n🔍 Verificando se existe coluna "limite"...');
    const limiteExists = result.rows.find(row => row.column_name === 'limite');
    console.log(limiteExists ? '✅ Coluna "limite" existe' : '❌ Coluna "limite" NÃO existe');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstrutura();