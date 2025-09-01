const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function corrigirDados() {
  try {
    console.log('🔧 Corrigindo dados da tabela contrato_produtos...');
    
    // Primeiro, vamos ver quais registros existem
    const existentes = await pool.query(`
      SELECT id, contrato_id, produto_id, preco_unitario, quantidade_contratada
      FROM contrato_produtos
      WHERE preco_unitario IS NULL OR quantidade_contratada IS NULL
    `);
    
    console.log(`📋 Encontrados ${existentes.rows.length} registros para corrigir`);
    
    // Atualizar os registros com valores padrão
    for (const registro of existentes.rows) {
      const precoUnitario = 5.50; // Preço exemplo para arroz
      const quantidadeContratada = 1000; // Quantidade exemplo
      
      await pool.query(`
        UPDATE contrato_produtos 
        SET 
          preco_unitario = $1,
          quantidade_contratada = $2
        WHERE id = $3
      `, [precoUnitario, quantidadeContratada, registro.id]);
      
      console.log(`✅ Atualizado registro ID ${registro.id}: preço=${precoUnitario}, quantidade=${quantidadeContratada}`);
    }
    
    console.log('\n🎉 Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

corrigirDados();