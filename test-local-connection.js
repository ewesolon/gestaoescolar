const { Pool } = require('pg');

// Configuração para PostgreSQL local
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'alimentacao_escolar',
  user: 'postgres',
  password: 'admin123',
  ssl: false,
  max: 1,
  connectionTimeoutMillis: 10000
});

async function testLocalConnection() {
  try {
    console.log('🔗 Testando conexão com PostgreSQL local...');
    const client = await pool.connect();
    console.log('✅ Conexão local estabelecida com sucesso!');
    
    // Testar se o banco existe
    const dbResult = await client.query('SELECT current_database() as database_name');
    console.log('📊 Banco de dados atual:', dbResult.rows[0].database_name);
    
    // Testar uma query simples
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('⏰ Hora atual:', result.rows[0].current_time);
    console.log('🐘 Versão PostgreSQL:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    
    // Verificar se existem tabelas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📋 Tabelas encontradas:', tablesResult.rows.length);
      tablesResult.rows.forEach(row => {
        console.log('  - ' + row.table_name);
      });
    } else {
      console.log('⚠️  Nenhuma tabela encontrada no schema public');
    }
    
    client.release();
    console.log('✅ Teste de conexão local concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro na conexão local:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Verifique se o PostgreSQL está rodando localmente');
      console.log('   - Windows: Verifique os serviços do Windows');
      console.log('   - Ou instale PostgreSQL se ainda não tiver');
    } else if (error.code === '3D000') {
      console.log('💡 Dica: O banco "alimentacao_escolar" não existe');
      console.log('   - Crie o banco ou use "postgres" como banco padrão');
    } else if (error.code === '28P01') {
      console.log('💡 Dica: Credenciais incorretas');
      console.log('   - Verifique usuário e senha do PostgreSQL');
    }
  } finally {
    await pool.end();
  }
}

testLocalConnection();