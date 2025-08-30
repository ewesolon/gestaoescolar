// Configuração otimizada para Neon Database
import { Pool, PoolConfig } from 'pg';

// Configuração específica para Neon
const neonConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  
  // Configurações otimizadas para Neon
  max: 10, // Neon suporta até 100 conexões
  min: 0,  // Serverless - não manter conexões ociosas
  idleTimeoutMillis: 10000, // 10s - Neon fecha conexões ociosas rapidamente
  connectionTimeoutMillis: 5000, // 5s timeout
  acquireTimeoutMillis: 5000,
  
  // Configurações para Vercel Serverless
  allowExitOnIdle: true, // Permite que o pool feche quando não há atividade
};

// Pool de conexões para Neon
const pool = new Pool(neonConfig);

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  let client;
  
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Neon Query:', { 
        text: text.substring(0, 50) + '...', 
        duration: duration + 'ms', 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('Neon Query Error:', {
      message: error.message,
      query: text.substring(0, 100),
      params: params?.slice(0, 3) // Primeiros 3 params apenas
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Função para transações
export const transaction = async (callback: (client: any) => Promise<any>) => {
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
};

// Função para testar conexão com Neon
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as current_time, version()');
    const dbInfo = result.rows[0];
    
    console.log('✅ Neon Database conectado:', {
      time: dbInfo.current_time,
      version: dbInfo.version.split(' ')[0] + ' ' + dbInfo.version.split(' ')[1]
    });
    
    // Verificar se é realmente Neon
    if (dbInfo.version.includes('neon')) {
      console.log('🚀 Neon Database detectado - Serverless PostgreSQL');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão Neon:', error.message);
    return false;
  }
};

// Função para obter estatísticas do Neon
export const getNeonStats = async () => {
  try {
    const stats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables 
      ORDER BY n_live_tup DESC
    `);
    
    return stats.rows;
  } catch (error) {
    console.error('Erro ao obter stats Neon:', error.message);
    return [];
  }
};

// Função para cleanup (importante para serverless)
export const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool Neon fechado');
  } catch (error) {
    console.error('Erro ao fechar pool Neon:', error.message);
  }
};

// Métodos de compatibilidade
export const db = {
  query,
  transaction,
  testConnection,
  getNeonStats,
  closePool,
  pool,
  
  // Compatibilidade com código existente
  all: async (sql: string, params: any[] = []) => {
    const result = await query(sql, params);
    return result.rows;
  },
  
  get: async (sql: string, params: any[] = []) => {
    const result = await query(sql, params);
    return result.rows[0];
  },
  
  run: async (sql: string, params: any[] = []) => {
    const result = await query(sql, params);
    return {
      changes: result.rowCount,
      lastID: result.rows && result.rows.length > 0 ? result.rows[0].id : null
    };
  }
};

// Cleanup automático para Vercel Serverless
if (typeof process !== 'undefined') {
  process.on('beforeExit', closePool);
  process.on('SIGINT', closePool);
  process.on('SIGTERM', closePool);
}

export default db;