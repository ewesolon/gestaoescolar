// Teste simples de conexão Supabase
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testarConexao() {
  try {
    console.log('🔍 Testando conexão Supabase...');
    
    // Teste básico
    const result = await pool.query('SELECT NOW() as current_time, version()');
    console.log('✅ Conexão OK:', result.rows[0].current_time);
    
    // Listar tabelas
    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 ${tabelas.rows.length} tabelas encontradas:`);
    tabelas.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    // Testar usuários
    try {
      const usuarios = await pool.query('SELECT COUNT(*) as total FROM usuarios');
      console.log(`👥 ${usuarios.rows[0].total} usuários no banco`);
      
      const user = await pool.query('SELECT id, nome, email FROM usuarios LIMIT 1');
      if (user.rows.length > 0) {
        console.log('👤 Usuário exemplo:', user.rows[0]);
      }
    } catch (e) {
      console.log('⚠️ Tabela usuarios não acessível:', e.message);
    }
    
    console.log('🎉 Supabase funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testarConexao();