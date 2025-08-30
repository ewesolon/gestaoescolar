// Vercel Serverless Function Entry Point
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rotas
import userRoutes from '../src/routes/userRoutes';
import escolaRoutes from '../src/routes/escolaRoutes';
import modalidadeRoutes from '../src/routes/modalidadeRoutes';
import produtoRoutes from '../src/routes/produtoRoutes';
import fornecedorRoutes from '../src/routes/fornecedorRoutes';
import contratoRoutes from '../src/routes/contratoRoutes';
import cardapioRoutes from '../src/routes/cardapioRoutes';
import pedidoModernoRoutes from '../src/routes/pedidoModernoRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS para Vercel
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel-serverless'
  });
});

// API Routes
app.use('/api/usuarios', userRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/escolas', escolaRoutes);
app.use('/api/modalidades', modalidadeRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/cardapios', cardapioRoutes);
app.use('/api/pedidos-modernos', pedidoModernoRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Export for Vercel
export default app;