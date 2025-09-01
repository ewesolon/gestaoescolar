const { Client } = require('pg');
require('dotenv').config();

async function verificarPedidos() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase');
    
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'pedidos' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Colunas da tabela pedidos:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
    });
    
    // Verificar se updated_at existe
    const hasUpdatedAt = result.rows.some(row => row.column_name === 'updated_at');
    console.log(`\n🔍 Coluna updated_at existe: ${hasUpdatedAt ? '✅ SIM' : '❌ NÃO'}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

verificarPedidos();