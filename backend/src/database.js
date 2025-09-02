// Configuração PostgreSQL - Sistema de Alimentação Escolar
const { Pool } = require('pg');

// Configuração do pool de conexões
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'alimentacao_escolar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
    require: true
  } : false,
  max: 10,
  min: 0,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  acquireTimeoutMillis: 30000
};

// Pool de conexões PostgreSQL (Supabase)
const pool = new Pool(poolConfig);

// Função principal para queries
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executada:', { 
        text: text.substring(0, 50) + '...', 
        duration: duration + 'ms', 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('Erro na query PostgreSQL:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
}

// Função para transações
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para testar conexão
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, version()');
    console.log('✅ PostgreSQL conectado:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão PostgreSQL:', error.message);
    return false;
  }
}

// Exportar funções PostgreSQL
const db = {
  query,
  transaction,
  testConnection,
  pool,
  
  // Métodos para compatibilidade com código existente
  all: async (sql, params = []) => {
    const result = await query(sql, params);
    return result.rows;
  },
  
  get: async (sql, params = []) => {
    const result = await query(sql, params);
    return result.rows[0];
  },
  
  run: async (sql, params = []) => {
    const result = await query(sql, params);
    return {
      changes: result.rowCount,
      lastID: result.rows && result.rows.length > 0 ? result.rows[0].id : null
    };
  }
};

// Fechar pool quando aplicação terminar
process.on('SIGINT', () => {
  console.log('Fechando pool PostgreSQL...');
  pool.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Fechando pool PostgreSQL...');
  pool.end();
  process.exit(0);
});

module.exports = db;
