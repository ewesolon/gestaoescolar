import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { config } from "./config";

// Importar apenas rotas essenciais que funcionam com PostgreSQL
import userRoutes from "./routes/userRoutes";

// Importar rotas essenciais
import escolaRoutes from "./routes/escolaRoutes";
import modalidadeRoutes from "./routes/modalidadeRoutes";
import escolaModalidadeRoutes from "./routes/escolaModalidadeRoutes";
import carrinhoRoutes from "./routes/carrinhoRoutes";
import fornecedorRoutes from "./routes/fornecedorRoutes";
import contratoRoutes from "./routes/contratoRoutes";
import contratoProdutoRoutes from "./routes/contratoProdutoRoutes";
import aditivoContratoRoutes from "./routes/aditivoContratoRoutes";

import refeicaoRoutes from "./routes/refeicaoRoutes";
import refeicaoProdutoRoutes from "./routes/refeicaoProdutoRoutes";
import cardapioRoutes from "./routes/cardapioRoutes";
import demandaRoutes from "./routes/demandaRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import produtoORMRoutes from "./routes/produtoORMRoutes";
import produtoModalidadeRoutes from "./routes/produtoModalidadeRoutes";
// Importar novas rotas ORM
import { setupNewORMRoutes } from "./routes/newORMRoutes";
// Importar rotas modernas
import pedidoModernoRoutes from "./routes/pedidoModernoRoutes";
import recebimentoSimplificadoRoutes from "./routes/recebimentoSimplificadoRoutes";
import estoqueModernoRoutes from "./routes/estoqueModernoRoutes";
import estoqueEscolaRoutes from "./routes/estoqueEscolaRoutes";
import gestorEscolaRoutes from "./routes/gestorEscolaRoutes";
import estoqueConsolidadoRoutes from "./routes/estoqueConsolidadoRoutes";

import faturamentoModalidadesRoutes from "./routes/faturamentoModalidadesRoutes";
import faturamentoInterfaceRoutes from "./routes/faturamentoInterface";
import saldoContratosRoutes from "./routes/saldoContratosRoutes";

// Importar rotas preservadas do sistema escolar


// Importar configuração PostgreSQL (Supabase)
const db = require("./database");

dotenv.config();

const app = express();
app.use(express.json());

// Configuração CORS usando config.json
app.use(
  cors({
    origin: config.backend.cors.origin,
    credentials: config.backend.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers"
    ],
    exposedHeaders: ["Content-Length", "X-Foo", "X-Bar"],
    maxAge: 86400, // 24 horas
    preflightContinue: false,
    optionsSuccessStatus: 200
  })
);

// Middleware adicional para garantir CORS em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}



// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const dbStatus = await db.testConnection();
    res.json({
      status: "ok",
      database: "PostgreSQL",
      dbConnection: dbStatus ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
      apiUrl: (config as any).apiUrl || 'http://localhost:3000',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "PostgreSQL",
      dbConnection: "error",
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Endpoint de teste PostgreSQL
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as current_time, version()');
    res.json({
      success: true,
      message: "PostgreSQL funcionando!",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro no PostgreSQL",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Endpoint de teste para tabelas de pedidos
app.get("/api/test-pedidos", async (req, res) => {
  try {
    // Verificar se as tabelas existem
    const tabelas = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%pedido%'
      ORDER BY table_name
    `);

    // Testar uma consulta simples
    let pedidosCount = 0;
    try {
      const countResult = await db.query('SELECT COUNT(*) as total FROM pedidos');
      pedidosCount = countResult.rows[0].total;
    } catch (e) {
      // Tabela pode não existir ainda
    }

    res.json({
      success: true,
      message: "Teste de tabelas de pedidos",
      data: {
        tabelasEncontradas: tabelas.rows.map((r: any) => r.table_name),
        totalPedidos: pedidosCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao testar tabelas de pedidos",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Registrar rotas essenciais
app.use("/api/usuarios", userRoutes);
app.use("/api/auth", userRoutes); // compatibilidade para login

// Registrar rotas essenciais
app.use("/api/escolas", escolaRoutes);
app.use("/api/modalidades", modalidadeRoutes);
app.use("/api/escola-modalidades", escolaModalidadeRoutes);
app.use("/api/carrinho", carrinhoRoutes);
app.use("/api/fornecedores", fornecedorRoutes);
app.use("/api/contratos", contratoRoutes);
app.use("/api/contrato-produtos", contratoProdutoRoutes);
app.use("/api/aditivos-contratos", aditivoContratoRoutes);

app.use("/api/refeicoes", refeicaoRoutes);
app.use("/api/refeicao-produtos", refeicaoProdutoRoutes);
app.use("/api/cardapios", cardapioRoutes);
app.use("/api/demanda", demandaRoutes);
app.use("/api/produtos", produtoRoutes);
app.use("/api/produtos-orm", produtoORMRoutes);
app.use("/api/produto-modalidades", produtoModalidadeRoutes);

app.use("/api/pedidos-modernos", pedidoModernoRoutes);
app.use("/api/recebimento-simples", recebimentoSimplificadoRoutes);
app.use("/api/estoque-moderno", estoqueModernoRoutes);
app.use("/api/estoque-escola", estoqueEscolaRoutes);
app.use("/api/gestor-escola", gestorEscolaRoutes);
app.use("/api/estoque-consolidado", estoqueConsolidadoRoutes);

app.use("/api/faturamento-modalidades", faturamentoModalidadesRoutes);
app.use("/api/faturamento-interface", faturamentoInterfaceRoutes);
app.use("/api/saldos-contratos", saldoContratosRoutes);

// Rotas preservadas do sistema escolar


// Configurar novas rotas ORM
setupNewORMRoutes(app);

// Middleware para rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
    message: "Sistema migrado para PostgreSQL - apenas rotas essenciais ativas",
    availableRoutes: [
      "/api/usuarios",
      "/api/auth",

      "/api/escolas",
      "/api/modalidades",
      "/api/escola-modalidades",
      "/api/carrinho",
      "/api/fornecedores",
      "/api/contratos",
      "/api/contrato-produtos",
      "/api/aditivos-contratos",

      "/api/refeicoes",
      "/api/cardapios",
      "/api/produtos",
      "/api/produtos-orm",
      "/api/produto-modalidades",

      "/api/pedidos-modernos",
      "/api/recebimento-simples",
      "/api/estoque-moderno",
      "/api/estoque-consolidado",
      "/api/faturamento-modalidades",

      "/api/test-db",
      "/health"
    ],
  });
});

// Middleware global de erro
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Erro global:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    details: err.message,
    database: "PostgreSQL"
  });
});

// Inicializar servidor
async function iniciarServidor() {
  try {
    // Testar conexão PostgreSQL
    console.log('🔍 Testando conexão PostgreSQL...');
    const conectado = await db.testConnection();

    if (conectado) {
      console.log('✅ PostgreSQL conectado com sucesso!');

      // Verificar tabelas
      const tabelas = await db.query(`
        SELECT COUNT(*) as total 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      console.log(`📊 Tabelas disponíveis: ${tabelas.rows[0].total}`);

      // Inicializar sistema ORM
      console.log('🔧 Inicializando sistema ORM...');
      try {
        const { setupORM } = await import('./orm/index');
        await setupORM();
        console.log('✅ Sistema ORM inicializado com sucesso!');
      } catch (ormError) {
        console.warn('⚠️ Aviso: Erro ao inicializar ORM:', (ormError as Error).message);
        console.log('📝 Continuando sem ORM...');
      }

      // Inicializar módulos
      console.log('🔧 Inicializando módulos...');
      const { initEstoqueModerno } = await import('./controllers/estoqueModernoController');
      await initEstoqueModerno();

      // Inicializar tabelas de rotas
      const { createRotasTables } = await import('./models/Rota');
      await createRotasTables();
      console.log('✅ Tabelas de rotas criadas com sucesso');

      console.log('✅ Módulos inicializados com sucesso!');

      // Iniciar servidor
      app.listen(config.backend.port, config.backend.host, () => {
        console.log(`🚀 Servidor PostgreSQL rodando em ${config.backend.host}:${config.backend.port}`);

        // Tratar CORS origins que pode ser array ou boolean
        const corsOrigins = Array.isArray(config.backend.cors.origin)
          ? config.backend.cors.origin.join(', ')
          : config.backend.cors.origin === true
            ? 'Qualquer origem (desenvolvimento)'
            : String(config.backend.cors.origin);

        console.log(`📡 CORS Origins: ${corsOrigins}`);
        console.log(`🐘 Banco: ${config.database.host}:${config.database.port}/${config.database.name}`);
        console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Foreign Keys CASCADE: Ativas`);
      });

    } else {
      console.error('❌ Falha na conexão PostgreSQL');
      console.error('   Verifique se o PostgreSQL está rodando');
      console.error('   Verifique as credenciais em database-pg.js');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Inicializar
iniciarServidor();
