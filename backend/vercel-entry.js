const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configuração CORS para produção
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas em produção
    const allowedOrigins = [
      'https://gestaoescolar-frontend.vercel.app',
      'https://gestaoescolar-frontend-git-main-ewenunes0-4923s-projects.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    
    // Verificar se a origem está na lista ou é um subdomínio do Vercel
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') ||
                     origin.includes('localhost') ||
                     origin.includes('127.0.0.1');
    
    callback(null, isAllowed);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

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

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbStatus = await testConnection();
    res.json({
      status: "ok",
      database: "PostgreSQL",
      dbConnection: dbStatus ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      environment: "production",
      platform: "vercel"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "PostgreSQL",
      dbConnection: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Endpoint de teste PostgreSQL
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time, version()');
    res.json({
      success: true,
      message: "PostgreSQL funcionando!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro no PostgreSQL",
      error: error.message
    });
  }
});

// Endpoint básico de usuários para teste
app.get("/api/usuarios", async (req, res) => {
  try {
    const result = await query('SELECT id, nome, email, tipo FROM usuarios LIMIT 10');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuários",
      error: error.message
    });
  }
});

// Endpoint básico de escolas para teste
app.get("/api/escolas", async (req, res) => {
  try {
    const result = await query('SELECT id, nome, endereco FROM escolas LIMIT 10');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar escolas",
      error: error.message
    });
  }
});

// Endpoint básico de produtos para teste
app.get("/api/produtos", async (req, res) => {
  try {
    const result = await query('SELECT id, nome, unidade_medida FROM produtos LIMIT 10');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar produtos",
      error: error.message
    });
  }
});

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
    message: "Sistema migrado para PostgreSQL - Vercel Production",
    availableRoutes: [
      "/api/usuarios",
      "/api/escolas",
      "/api/produtos",
      "/api/test-db",
      "/health"
    ],
  });
});

// Middleware global de erro
app.use((err, req, res, next) => {
  console.error("Erro global:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    details: err.message,
    database: "PostgreSQL",
    platform: "vercel"
  });
});

// Exportar para Vercel
module.exports = app;