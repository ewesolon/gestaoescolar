// Script para migrar banco PostgreSQL local para nuvem
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco local
const localPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'alimentacao_escolar',
  password: process.env.DB_PASSWORD || 'admin123',
  port: process.env.DB_PORT || 5432,
});

// Configuração do banco na nuvem (será preenchida depois)
let cloudPool = null;

async function exportSchema() {
  console.log('📋 Exportando schema do banco local...');
  
  try {
    // Obter todas as tabelas
    const tablesResult = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    let schema = '-- Schema export from local PostgreSQL\n';
    schema += '-- Generated at: ' + new Date().toISOString() + '\n\n';
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Obter CREATE TABLE
      const createResult = await localPool.query(`
        SELECT 
          'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
          array_to_string(
            array_agg(
              column_name || ' ' || type || 
              CASE WHEN not_null THEN ' NOT NULL' ELSE '' END
            ), ', '
          ) || ');' as create_statement
        FROM (
          SELECT 
            schemaname, tablename, 
            attname as column_name,
            format_type(atttypid, atttypmod) as type,
            attnotnull as not_null
          FROM pg_attribute 
          JOIN pg_class ON pg_class.oid = pg_attribute.attrelid
          JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
          WHERE pg_class.relname = $1
            AND pg_namespace.nspname = 'public'
            AND pg_attribute.attnum > 0
            AND NOT pg_attribute.attisdropped
          ORDER BY pg_attribute.attnum
        ) t
        GROUP BY schemaname, tablename
      `, [tableName]);
      
      if (createResult.rows.length > 0) {
        schema += createResult.rows[0].create_statement + '\n\n';
      }
    }
    
    // Salvar schema
    fs.writeFileSync('database-schema.sql', schema);
    console.log('✅ Schema exportado para database-schema.sql');
    
    return tablesResult.rows.map(r => r.table_name);
    
  } catch (error) {
    console.error('❌ Erro ao exportar schema:', error.message);
    throw error;
  }
}

async function exportData(tables) {
  console.log('📊 Exportando dados das tabelas...');
  
  let dataScript = '-- Data export from local PostgreSQL\n';
  dataScript += '-- Generated at: ' + new Date().toISOString() + '\n\n';
  
  for (const tableName of tables) {
    try {
      console.log(`  📄 Exportando ${tableName}...`);
      
      // Obter dados da tabela
      const dataResult = await localPool.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.rows.length > 0) {
        // Obter colunas
        const columns = Object.keys(dataResult.rows[0]);
        
        dataScript += `-- Dados da tabela ${tableName}\n`;
        dataScript += `DELETE FROM ${tableName};\n`;
        
        for (const row of dataResult.rows) {
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          });
          
          dataScript += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        dataScript += '\n';
        console.log(`  ✅ ${tableName}: ${dataResult.rows.length} registros`);
      } else {
        console.log(`  ⚪ ${tableName}: vazia`);
      }
      
    } catch (error) {
      console.error(`  ❌ Erro em ${tableName}:`, error.message);
    }
  }
  
  // Salvar dados
  fs.writeFileSync('database-data.sql', dataScript);
  console.log('✅ Dados exportados para database-data.sql');
}

async function importToCloud(cloudConnectionString) {
  console.log('☁️ Importando para banco na nuvem...');
  
  cloudPool = new Pool({
    connectionString: cloudConnectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Testar conexão
    await cloudPool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco na nuvem');
    
    // Importar schema
    console.log('📋 Importando schema...');
    const schema = fs.readFileSync('database-schema.sql', 'utf8');
    await cloudPool.query(schema);
    console.log('✅ Schema importado');
    
    // Importar dados
    console.log('📊 Importando dados...');
    const data = fs.readFileSync('database-data.sql', 'utf8');
    await cloudPool.query(data);
    console.log('✅ Dados importados');
    
  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
    throw error;
  } finally {
    if (cloudPool) {
      await cloudPool.end();
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando migração do banco PostgreSQL...\n');
    
    // Testar conexão local
    console.log('🔍 Testando conexão local...');
    await localPool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco local\n');
    
    // Exportar schema e dados
    const tables = await exportSchema();
    await exportData(tables);
    
    console.log('\n📦 Arquivos gerados:');
    console.log('  📄 database-schema.sql - Estrutura das tabelas');
    console.log('  📊 database-data.sql - Dados das tabelas');
    
    console.log('\n📋 Próximos passos:');
    console.log('1. Crie conta em um serviço PostgreSQL gratuito');
    console.log('2. Execute: node migrate-to-cloud.js import "sua-connection-string"');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await localPool.end();
  }
}

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
if (args[0] === 'import' && args[1]) {
  // Importar para nuvem
  importToCloud(args[1]).then(() => {
    console.log('🎉 Migração concluída com sucesso!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Falha na migração:', error.message);
    process.exit(1);
  });
} else {
  // Exportar do local
  main();
}