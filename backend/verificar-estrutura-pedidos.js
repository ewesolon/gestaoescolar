const db = require('./src/database');

async function verificarEstruturaPedidos() {
  try {
    console.log('🔍 Verificando estrutura da tabela pedidos...');
    
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'pedidos' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colunas da tabela pedidos:');
    result.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

verificarEstruturaPedidos();