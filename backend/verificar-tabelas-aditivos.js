const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verificarTabelasAditivos() {
  try {
    console.log('🔍 Verificando tabelas de aditivos...');
    
    // Verificar se as tabelas existem
    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%aditivo%'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tabelas relacionadas a aditivos:');
    if (tabelas.rows.length > 0) {
      tabelas.rows.forEach(tabela => {
        console.log(`  ✅ ${tabela.table_name}`);
      });
    } else {
      console.log('  ❌ Nenhuma tabela de aditivos encontrada');
    }
    
    // Verificar todas as tabelas do sistema
    console.log('\n📋 Todas as tabelas do sistema:');
    const todasTabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    todasTabelas.rows.forEach(tabela => {
      console.log(`  - ${tabela.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

verificarTabelasAditivos();