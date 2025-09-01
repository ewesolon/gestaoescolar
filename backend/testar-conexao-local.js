const { Pool } = require('pg');

// Testar diferentes configurações de conexão
const configs = [
  {
    name: 'Local padrão',
    config: {
      user: 'postgres',
      password: 'admin123',
      host: 'localhost',
      port: 5432,
      database: 'postgres'
    }
  },
  {
    name: 'Local com database específico',
    config: {
      user: 'postgres',
      password: 'admin123',
      host: 'localhost',
      port: 5432,
      database: 'alimentacao_escolar'
    }
  },
  {
    name: 'URL de conexão',
    config: {
      connectionString: 'postgresql://postgres:admin123@localhost:5432/postgres'
    }
  }
];

async function testarConexoes() {
  for (const { name, config } of configs) {
    console.log(`\n🔍 Testando: ${name}`);
    
    const pool = new Pool(config);
    
    try {
      const result = await pool.query('SELECT NOW() as current_time');
      console.log(`✅ Conexão bem-sucedida: ${result.rows[0].current_time}`);
      
      // Listar tabelas
      const tabelas = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log(`📊 Tabelas encontradas: ${tabelas.rows.length}`);
      if (tabelas.rows.length > 0) {
        console.log('Tabelas:', tabelas.rows.map(t => t.table_name).join(', '));
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    } finally {
      await pool.end();
    }
  }
}

testarConexoes();