const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function aplicarView() {
  try {
    console.log('🔧 Criando view view_saldo_contratos_itens...\n');
    
    // Ler o arquivo de migração
    const migracaoPath = path.join(__dirname, 'migrations', '038_criar_view_saldo_contratos.sql');
    const sql = fs.readFileSync(migracaoPath, 'utf8');
    
    // Executar a migração
    await pool.query(sql);
    
    console.log('✅ View criada com sucesso!');
    
    // Testar a view
    console.log('\n🧪 Testando a view...');
    const teste = await pool.query(`
      SELECT 
        contrato_numero,
        produto_nome,
        quantidade_total,
        quantidade_utilizada,
        quantidade_reservada,
        quantidade_disponivel_real,
        status
      FROM view_saldo_contratos_itens 
      LIMIT 5
    `);
    
    console.log(`✅ View funcionando! Encontrados ${teste.rows.length} registros`);
    
    if (teste.rows.length > 0) {
      console.log('\n📋 Exemplo de dados:');
      console.log('='.repeat(80));
      teste.rows.forEach(row => {
        console.log(`${row.contrato_numero} | ${row.produto_nome} | Total: ${row.quantidade_total} | Disponível: ${row.quantidade_disponivel_real} | Status: ${row.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar view:', error);
  } finally {
    await pool.end();
  }
}

aplicarView();