import { Router } from 'express';
import { AlertaController } from '../controllers/alertaController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createAlertaRoutes(): Router {
  const router = Router();
  const alertaController = new AlertaController();

  // Middleware de autenticação para todas as rotas
  router.use(authMiddleware);

  // Listar alertas do usuário
  router.get('/', (req, res) => 
    alertaController.listarAlertas(req, res)
  );

  // Contar alertas não lidos
  router.get('/nao-lidos/count', (req, res) => 
    alertaController.contarNaoLidos(req, res)
  );

  // Dashboard de alertas
  router.get('/dashboard', (req, res) => 
    alertaController.dashboardAlertas(req, res)
  );

  // Marcar alerta específico como lido
  router.put('/:alertaId/marcar-lido', (req, res) => 
    alertaController.marcarComoLido(req, res)
  );

  // Marcar todos os alertas como lidos
  router.put('/marcar-todos-lidos', (req, res) => 
    alertaController.marcarTodosComoLidos(req, res)
  );

  // Criar alerta manual (apenas admins/gerentes)
  router.post('/criar', (req, res) => 
    alertaController.criarAlerta(req, res)
  );

  // Criar alerta geral para todos (apenas admins)
  router.post('/criar-geral', (req, res) => 
    alertaController.criarAlertaGeral(req, res)
  );

  return router;
}