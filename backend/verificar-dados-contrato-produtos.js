const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function verificarDados() {
  try {
    console.log('🔍 Verificando dados da tabela contrato_produtos...');
    
    const result = await pool.query(`
      SELECT 
        cp.id,
        cp.contrato_id,
        cp.produto_id,
        cp.preco_unitario,
        cp.quantidade_contratada,
        p.nome as produto_nome
      FROM contrato_produtos cp
      LEFT JOIN produtos p ON cp.produto_id = p.id
      ORDER BY cp.id
      LIMIT 10;
    `);
    
    console.log('\n📋 Dados encontrados:');
    if (result.rows.length === 0) {
      console.log('❌ Nenhum dado encontrado na tabela contrato_produtos');
    } else {
      result.rows.forEach(row => {
        console.log(`ID: ${row.id}, Produto: ${row.produto_nome}, Preço: ${row.preco_unitario}, Quantidade: ${row.quantidade_contratada}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

verificarDados();