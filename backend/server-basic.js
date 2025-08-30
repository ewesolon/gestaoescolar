// Servidor básico para testar Supabase
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// Pool Supabase
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'ok',
      database: 'Supabase PostgreSQL',
      timestamp: result.rows[0].current_time,
      message: 'Sistema conectado ao Supabase!'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

// Test DB
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version()');
    res.json({
      success: true,
      message: 'Supabase PostgreSQL funcionando!',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email, tipo FROM usuarios ORDER BY id');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Login básico
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    const result = await pool.query(
      'SELECT id, nome, email, tipo FROM usuarios WHERE email = $1 AND senha = $2',
      [email, senha]
    );
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: result.rows[0],
        token: 'fake-jwt-token-for-testing'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Email ou senha inválidos'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Produtos
app.get('/api/produtos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos ORDER BY nome LIMIT 10');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Escolas
app.get('/api/escolas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM escolas ORDER BY nome LIMIT 10');
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor básico Supabase rodando na porta ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`🔗 Usuários: http://localhost:${PORT}/api/usuarios`);
});