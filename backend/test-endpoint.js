const axios = require('axios');

async function testSupplierRelationshipsEndpoint() {
  try {
    console.log('🔍 Testing supplier relationships endpoint...\n');
    
    // Test the endpoint (assuming backend is running on port 3000)
    const response = await axios.get('http://localhost:3000/api/fornecedores/2/relacionamentos');
    
    console.log('✅ Endpoint response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('❌ HTTP Error:', error.response.status, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - make sure backend is running on port 3000');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testSupplierRelationshipsEndpoint();