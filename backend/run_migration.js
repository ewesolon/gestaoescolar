const db = require('./src/database');
const fs = require('fs');

(async () => {
  try {
    console.log('🔄 Executando migração para remover unidade_medida...');
    const sql = fs.readFileSync('./migrations/016_remove_unidade_medida.sql', 'utf8');
    await db.query(sql);
    console.log('✅ Migração executada com sucesso!');
    
    // Verificar resultado
    const result = await db.query('SELECT nome, unidade FROM produtos LIMIT 3');
    console.log('📊 Produtos após migração:');
    result.rows.forEach(p => console.log(`  - ${p.nome}: ${p.unidade}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
})();