// Configuração centralizada do frontend
export const config = {
  // Configurações da API
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  healthUrl: import.meta.env.VITE_HEALTH_URL || "/health",

  // Configurações do app
  appName: import.meta.env.VITE_APP_NAME || "Sistema de Alimentação Escolar",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Configurações de timeout
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,

  // Configurações de ambiente
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // URLs completas
  get baseApiUrl() {
    return this.apiUrl.replace("/api", "");
  },

  get fullHealthUrl() {
    return this.healthUrl;
  },
};

// Validação da configuração
export const validateConfig = () => {
  const errors: string[] = [];

  if (!config.apiUrl) {
    errors.push("VITE_API_URL não está configurada");
  }

  if (!config.healthUrl) {
    errors.push("VITE_HEALTH_URL não está configurada");
  }

  if (errors.length > 0) {
    console.error("❌ Erros de configuração:", errors);
    console.log("💡 Dica: Crie um arquivo .env na raiz do frontend com:");
    console.log("   VITE_API_URL=http://localhost:3000/api");
    console.log("   VITE_HEALTH_URL=http://localhost:3000/health");
  }

  return errors.length === 0;
};

// Log da configuração em desenvolvimento
if (config.isDevelopment) {
  console.log("🔧 Configuração do Frontend:", {
    apiUrl: config.apiUrl,
    healthUrl: config.healthUrl,
    appName: config.appName,
    environment: config.isDevelopment ? "development" : "production",
  });
}
