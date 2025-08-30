// Script simplificado para exportar dados para Supabase
const { Pool } = require('pg');
const fs = require('fs');

// Configuração do banco local
const localPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alimentacao_escolar',
  password: process.env.DB_PASSWORD || 'admin123',
  port: process.env.DB_PORT || 5432,
});

async function exportData() {
  try {
    console.log('🔍 Conectando ao banco local...');
    await localPool.query('SELECT NOW()');
    console.log('✅ Conectado com sucesso!');
    
    // Obter lista de tabelas
    const tablesResult = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📊 Encontradas ${tables.length} tabelas:`, tables.join(', '));
    
    let sqlScript = `-- Migração para Supabase - Sistema de Alimentação Escolar
-- Gerado em: ${new Date().toISOString()}
-- Tabelas: ${tables.length}

`;

    for (const tableName of tables) {
      try {
        console.log(`📄 Exportando ${tableName}...`);
        
        // Obter dados da tabela
        const dataResult = await localPool.query(`SELECT * FROM "${tableName}"`);
        
        if (dataResult.rows.length > 0) {
          // Limpar tabela primeiro
          sqlScript += `-- Tabela: ${tableName}\n`;
          sqlScript += `DELETE FROM "${tableName}";\n`;
          
          // Obter nomes das colunas
          const columns = Object.keys(dataResult.rows[0]);
          
          // Inserir dados
          for (const row of dataResult.rows) {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
              return value;
            });
            
            sqlScript += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
          }
          
          sqlScript += '\n';
          console.log(`  ✅ ${tableName}: ${dataResult.rows.length} registros`);
        } else {
          console.log(`  ⚪ ${tableName}: vazia`);
        }
        
      } catch (error) {
        console.error(`  ❌ Erro em ${tableName}:`, error.message);
      }
    }
    
    // Salvar arquivo
    fs.writeFileSync('supabase-data.sql', sqlScript);
    console.log('\n✅ Dados exportados para: supabase-data.sql');
    
    const fileSize = fs.statSync('supabase-data.sql').size;
    console.log(`📊 Tamanho: ${(fileSize / 1024).toFixed(2)} KB`);
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Copie o conteúdo do arquivo supabase-data.sql');
    console.log('2. No Supabase Dashboard, vá em SQL Editor');
    console.log('3. Cole e execute o script SQL');
    console.log('4. Verifique os dados no Table Editor');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await localPool.end();
  }
}

exportData();