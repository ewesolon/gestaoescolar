const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testarAPI() {
  try {
    console.log('🧪 Testando API de aditivos...');
    
    // Testar obter produtos do contrato
    console.log('\n📦 Testando obter produtos do contrato 1:');
    const produtosResponse = await axios.get(`${BASE_URL}/aditivos-contratos/contrato/1/produtos`);
    console.log('✅ Produtos obtidos:', produtosResponse.data);
    
    // Testar listar aditivos do contrato
    console.log('\n📋 Testando listar aditivos do contrato 1:');
    const aditivosResponse = await axios.get(`${BASE_URL}/aditivos-contratos/contrato/1`);
    console.log('✅ Aditivos obtidos:', aditivosResponse.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na API:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Erro de conexão:', error.message);
      console.log('💡 Certifique-se de que o backend está rodando na porta 3000');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testarAPI();