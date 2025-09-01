const { Client } = require('pg');
require('dotenv').config();

async function verificarUsuarios() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase');
    
    // Verificar se a tabela usuarios existe
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%usuario%'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas relacionadas a usuários:');
    tabelas.rows.forEach(row => {
      console.log(`  ${row.table_name}`);
    });
    
    // Se a tabela usuarios existir, verificar sua estrutura
    if (tabelas.rows.some(row => row.table_name === 'usuarios')) {
      const estrutura = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estrutura da tabela usuarios:');
      estrutura.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
      
      // Verificar se há usuários
      const count = await client.query('SELECT COUNT(*) FROM usuarios');
      console.log(`\n📊 Total de usuários: ${count.rows[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

verificarUsuarios();