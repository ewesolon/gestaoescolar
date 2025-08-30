// Script simplificado para exportar dados PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');

// Configuração do banco local
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alimentacao_escolar',
  password: process.env.DB_PASSWORD || 'admin123',
  port: process.env.DB_PORT || 5432,
});

async function exportData() {
  try {
    console.log('🔍 Conectando ao banco local...');
    
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado com sucesso!');
    
    // Obter lista de tabelas
    console.log('📋 Obtendo lista de tabelas...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📊 Encontradas ${tables.length} tabelas:`, tables.join(', '));
    
    // Gerar script de dados
    let dataScript = '-- Dados exportados do PostgreSQL local\n';
    dataScript += `-- Data: ${new Date().toISOString()}\n`;
    dataScript += `-- Tabelas: ${tables.length}\n\n`;
    
    for (const tableName of tables) {
      try {
        console.log(`📄 Exportando ${tableName}...`);
        
        // Obter dados
        const dataResult = await pool.query(`SELECT * FROM "${tableName}"`);
        
        if (dataResult.rows.length > 0) {
          // Obter colunas
          const columns = Object.keys(dataResult.rows[0]);
          
          dataScript += `-- Tabela: ${tableName} (${dataResult.rows.length} registros)\n`;
          dataScript += `TRUNCATE TABLE "${tableName}" CASCADE;\n`;
          
          // Inserir dados
          for (const row of dataResult.rows) {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'boolean') return value ? 'true' : 'false';
              return value;
            });
            
            dataScript += `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${values.join(', ')});\n`;
          }
          
          dataScript += '\n';
          console.log(`  ✅ ${tableName}: ${dataResult.rows.length} registros exportados`);
        } else {
          console.log(`  ⚪ ${tableName}: tabela vazia`);
        }
        
      } catch (error) {
        console.error(`  ❌ Erro em ${tableName}:`, error.message);
      }
    }
    
    // Salvar arquivo
    fs.writeFileSync('database-export.sql', dataScript);
    console.log('\n✅ Dados exportados para: database-export.sql');
    
    // Estatísticas
    const fileSize = fs.statSync('database-export.sql').size;
    console.log(`📊 Tamanho do arquivo: ${(fileSize / 1024).toFixed(2)} KB`);
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Crie conta em um serviço PostgreSQL gratuito (Neon, Supabase, etc.)');
    console.log('2. Execute o arquivo database-export.sql no novo banco');
    console.log('3. Atualize POSTGRES_URL nas configurações');
    
  } catch (error) {
    console.error('❌ Erro na exportação:', error.message);
  } finally {
    await pool.end();
  }
}

exportData();