// Função serverless para Vercel
module.exports = async (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { Pool } = require('pg');
  
  // Pool de conexões PostgreSQL (Supabase)
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: true,
  });

  // Função para queries
  async function query(text, params = []) {
    try {
      const res = await pool.query(text, params);
      return res;
    } catch (error) {
      console.error('Erro na query PostgreSQL:', error.message);
      throw error;
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

  const { url, method } = req;
  
  try {
    // Health check endpoint
    if (url === '/health' || url.endsWith('/health')) {
      const dbStatus = await testConnection();
      return res.json({
        status: "ok",
        database: "PostgreSQL",
        dbConnection: dbStatus ? "connected" : "disconnected",
        timestamp: new Date().toISOString(),
        environment: "production",
        platform: "vercel",
        url: url,
        method: method
      });
    }

    // Endpoint de teste PostgreSQL
    if (url === '/api/test-db' || url.endsWith('/api/test-db')) {
      const result = await query('SELECT NOW() as current_time, version()');
      return res.json({
        success: true,
        message: "PostgreSQL funcionando!",
        data: result.rows[0]
      });
    }

    // Endpoint básico de usuários para teste
    if (url === '/api/usuarios' || url.endsWith('/api/usuarios')) {
      const result = await query('SELECT id, nome, email, tipo FROM usuarios LIMIT 10');
      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Endpoint básico de escolas para teste
    if (url === '/api/escolas' || url.endsWith('/api/escolas')) {
      const result = await query('SELECT id, nome, endereco FROM escolas LIMIT 10');
      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Endpoint básico de produtos para teste
    if (url === '/api/produtos' || url.endsWith('/api/produtos')) {
      const result = await query('SELECT id, nome, unidade_medida FROM produtos LIMIT 10');
      return res.json({
        success: true,
        data: result.rows
      });
    }

    // Rota não encontrada
    return res.status(404).json({
      error: "Rota não encontrada",
      path: url,
      method: method,
      message: "Sistema migrado para PostgreSQL - Vercel Production",
      availableRoutes: [
        "/api/usuarios",
        "/api/escolas", 
        "/api/produtos",
        "/api/test-db",
        "/health"
      ],
    });

  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
      database: "PostgreSQL",
      platform: "vercel",
      url: url,
      method: method
    });
  }
};

