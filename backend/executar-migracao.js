const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeMigration() {
  try {
    console.log('🔄 Executando migração...');
    const sql = fs.readFileSync('./migrations/030_adicionar_colunas_cardapios.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Migração executada com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await pool.end();
  }
}

executeMigration();