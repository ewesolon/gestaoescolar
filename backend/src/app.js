const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar rotas
const movimentacaoConsumoRoutes = require('./routes/movimentacaoConsumoContratoRoutes');
const saldoContratosRoutes = require('./routes/saldoContratosRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api', movimentacaoConsumoRoutes);
app.use('/api/saldos-contratos', saldoContratosRoutes);

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando corretamente' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

module.exports = app;