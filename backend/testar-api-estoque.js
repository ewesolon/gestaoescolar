const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testarAPIEstoque() {
  try {
    console.log('🧪 Testando API de estoque da escola...');
    
    // Testar endpoint de estoque da escola 5
    console.log('\n📦 Testando GET /estoque-escola/escola/5:');
    const response = await axios.get(`${BASE_URL}/estoque-escola/escola/5`);
    console.log('✅ Status:', response.status);
    console.log('✅ Dados:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Erro na API:', error.response.status);
      console.error('❌ Dados do erro:', error.response.data);
      console.error('❌ Headers:', error.response.headers);
    } else if (error.request) {
      console.error('❌ Erro de conexão:', error.message);
      console.log('💡 Certifique-se de que o backend está rodando na porta 3000');
    } else {
      console.error('❌ Erro:', error.message);
    }
  }
}

testarAPIEstoque();