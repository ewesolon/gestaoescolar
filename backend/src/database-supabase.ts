// Configuração otimizada para Supabase
import { Pool, PoolConfig } from 'pg';

// Configuração específica para Supabase
const supabaseConfig: PoolConfig = {
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  
  // Configurações otimizadas para Supabase
  max: 15, // Supabase suporta até 60 conexões no plano gratuito
  min: 0,  // Não manter conexões ociosas
  idleTimeoutMillis: 30000, // 30s
  connectionTimeoutMillis: 10000, // 10s timeout
  acquireTimeoutMillis: 10000,
  
  // Configurações para Vercel Serverless
  allowExitOnIdle: true,
};

// Pool de conexões para Supabase
const pool = new Pool(supabaseConfig);

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  let client;
  
  try {
    client = await pool.connect();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Supabase Query:', { 
        text: text.substring(0, 50) + '...', 
        duration: duration + 'ms', 
        rows: res.rowCount 
      });
    }
    
    return res;
  } catch (error) {
    console.error('Supabase Query Error:', {
      message: error.message,
      query: text.substring(0, 100),
      params: params?.slice(0, 3)
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

// Função para testar conexão com Supabase
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW() as current_time, version()');
    const dbInfo = result.rows[0];
    
    console.log('✅ Supabase conectado:', {
      time: dbInfo.current_time,
      version: dbInfo.version.split(' ')[0] + ' ' + dbInfo.version.split(' ')[1],
      host: process.env.POSTGRES_URL?.includes('supabase.co') ? 'Supabase' : 'PostgreSQL'
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error.message);
    return false;
  }
};

// Função para obter estatísticas do Supabase
export const getSupabaseStats = async () => {
  try {
    const stats = await query(`
      SELECT 
        schemaname,
        tablename,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_analyze
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `);
    
    return stats.rows;
  } catch (error) {
    console.error('Erro ao obter stats Supabase:', error.message);
    return [];
  }
};

// Função para cleanup
export const closePool = async () => {
  try {
    await pool.end();
    console.log('🔒 Pool Supabase fechado');
  } catch (error) {
    console.error('Erro ao fechar pool Supabase:', error.message);
  }
};

// Métodos de compatibilidade
export const db = {
  query,
  transaction,
  testConnection,
  getSupabaseStats,
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