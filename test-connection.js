const { Pool } = require('pg');
const dns = require('dns');
const net = require('net');

// Forçar IPv4 globalmente
dns.setDefaultResultOrder('ipv4first');
process.env.NODE_OPTIONS = '--dns-result-order=ipv4first';

console.log('🔍 Testando conectividade IPv4 com Supabase...');

// Primeiro, vamos tentar resolver o DNS para IPv4
const hostname = 'db.aswbqvyxsfecjdjfjodz.supabase.co';

// Teste de resolução DNS IPv4
dns.resolve4(hostname, (err, addresses) => {
  if (err) {
    console.log('❌ Não foi possível resolver IPv4 para', hostname);
    console.log('Erro:', err.message);
    
    // Tentar com IPv6
    dns.resolve6(hostname, (err6, addresses6) => {
      if (err6) {
        console.log('❌ Também não foi possível resolver IPv6');
        return;
      }
      console.log('⚠️  Apenas IPv6 disponível:', addresses6);
      testWithIPv6(addresses6[0]);
    });
  } else {
    console.log('✅ IPv4 resolvido:', addresses);
    testWithIPv4(addresses[0]);
  }
});

function testWithIPv4(ipv4Address) {
  console.log('🔗 Testando conexão direta com IPv4:', ipv4Address);
  
  const pool = new Pool({
    host: ipv4Address, // Usar IP direto
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Nunes8922',
    ssl: {
      rejectUnauthorized: false,
      require: true
    },
    max: 1,
    connectionTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    family: 4
  });
  
  testConnection(pool, 'IPv4');
}

function testWithIPv6(ipv6Address) {
  console.log('🔗 Testando conexão com IPv6:', ipv6Address);
  
  const pool = new Pool({
    host: ipv6Address,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '@Nunes8922',
    ssl: {
      rejectUnauthorized: false,
      require: true
    },
    max: 1,
    connectionTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    family: 6
  });
  
  testConnection(pool, 'IPv6');
}

async function testConnection(pool, protocol) {
  try {
    console.log(`🔗 Testando conexão ${protocol} com Supabase...`);
    const client = await pool.connect();
    console.log(`✅ Conexão ${protocol} estabelecida com sucesso!`);
    
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Query executada:', result.rows[0]);
    
    client.release();
    console.log(`✅ Teste ${protocol} concluído com sucesso!`);
  } catch (error) {
    console.error(`❌ Erro na conexão ${protocol}:`, error.message);
    if (error.address) {
      console.error('Endereço tentado:', error.address);
    }
  } finally {
    await pool.end();
  }
}