// Função serverless para Vercel - Versão Simplificada
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    // Health check endpoint
    if (url === '/health' || url.includes('/health')) {
      return res.json({
        status: "ok",
        message: "Backend funcionando!",
        timestamp: new Date().toISOString(),
        environment: "production",
        platform: "vercel",
        url: url,
        method: method,
        version: "2.0"
      });
    }

    // Endpoint de teste simples
    if (url.includes('/api/test')) {
      return res.json({
        success: true,
        message: "API funcionando!",
        timestamp: new Date().toISOString(),
        url: url,
        method: method
      });
    }

    // Rota não encontrada
    return res.status(404).json({
      error: "Rota não encontrada",
      path: url,
      method: method,
      message: "Backend Vercel - Versão Simplificada",
      availableRoutes: [
        "/api/test",
        "/health"
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      details: error.message,
      platform: "vercel",
      url: url,
      method: method,
      timestamp: new Date().toISOString()
    });
  }
}