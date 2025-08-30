// Script para importar apenas dados (sem estrutura) para Supabase
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

async function importDataToSupabase(connectionString) {
  console.log('☁️ Importando apenas dados para Supabase...');
  
  const supabasePool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Testar conexão Supabase
    await supabasePool.query('SELECT NOW()');
    console.log('✅ Conectado ao Supabase');
    
    // Testar conexão local
    await localPool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco local');
    
    // Obter lista de tabelas do banco local
    const tablesResult = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📊 Processando ${tablesResult.rows.length} tabelas...`);
    
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      try {
        console.log(`📄 Processando ${tableName}...`);
        
        // Verificar se tabela existe no Supabase
        const tableExists = await supabasePool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);
        
        if (!tableExists.rows[0].exists) {
          console.log(`  ⚠️ Tabela ${tableName} não existe no Supabase, pulando...`);
          continue;
        }
        
        // Obter dados do banco local
        const localData = await localPool.query(`SELECT * FROM "${tableName}"`);
        
        if (localData.rows.length === 0) {
          console.log(`  ⚪ ${tableName}: vazia`);
          continue;
        }
        
        // Limpar dados existentes no Supabase
        await supabasePool.query(`DELETE FROM "${tableName}"`);
        
        // Inserir dados
        const columns = Object.keys(localData.rows[0]);
        let insertedCount = 0;
        
        for (const row of localData.rows) {
          try {
            const values = columns.map(col => row[col]);
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            
            await supabasePool.query(
              `INSERT INTO "${tableName}" ("${columns.join('", "')}") VALUES (${placeholders})`,
              values
            );
            insertedCount++;
          } catch (insertError) {
            console.log(`    ⚠️ Erro ao inserir registro: ${insertError.message}`);
          }
        }
        
        console.log(`  ✅ ${tableName}: ${insertedCount}/${localData.rows.length} registros importados`);
        
      } catch (error) {
        console.log(`  ❌ Erro em ${tableName}: ${error.message}`);
      }
    }
    
    // Verificar resultado final
    console.log('\n📊 Verificando importação...');
    const finalCheck = await supabasePool.query(`
      SELECT schemaname, tablename, n_live_tup as rows
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public' AND n_live_tup > 0
      ORDER BY tablename
    `);
    
    console.log('\n✅ Tabelas com dados no Supabase:');
    finalCheck.rows.forEach(table => {
      console.log(`  📊 ${table.tablename}: ${table.rows} registros`);
    });
    
    console.log('\n🎉 Importação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
    throw error;
  } finally {
    await supabasePool.end();
    await localPool.end();
  }
}

// Executar
const connectionString = process.argv[2];
if (!connectionString) {
  console.error('❌ Forneça a connection string do Supabase');
  console.log('Uso: node import-data-only.js "postgresql://postgres:senha@host:port/db"');
  process.exit(1);
}

importDataToSupabase(connectionString);