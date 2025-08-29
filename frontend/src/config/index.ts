interface FrontendConfig {
  apiUrl: string;
  environment: string;
  features: {
    debugMode: boolean;
    mockData: boolean;
  };
}

function loadConfig(): FrontendConfig {
  const environment = import.meta.env.MODE || 'development';
  
  // Sempre usar /api para que o proxy do Vite funcione corretamente
  let apiUrl = '/api';
  
  // Em produção, pode usar URL absoluta se necessário
  if (environment === 'production' && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }

  const config: FrontendConfig = {
    apiUrl,
    environment,
    features: {
      debugMode: environment === 'development',
      mockData: import.meta.env.VITE_MOCK_DATA === 'true'
    }
  };

  console.log('🔧 Configuração do frontend:');
  console.log(`   API URL: ${config.apiUrl}`);
  console.log(`   Environment: ${config.environment}`);
  console.log(`   Debug Mode: ${config.features.debugMode}`);

  return config;
}

export const config = loadConfig();
export default config;