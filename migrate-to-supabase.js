// Script específico para migrar para Supabase
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

// Configuração Supabase
let supabasePool = null;

async function exportToSupabase() {
  console.log('🚀 Exportando dados para formato Supabase...');
  
  try {
    // Obter todas as tabelas
    const tablesResult = await localPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📋 Encontradas ${tablesResult.rows.length} tabelas`);
    
    let supabaseScript = `-- Migração para Supabase
-- Sistema de Alimentação Escolar
-- Gerado em: ${new Date().toISOString()}

-- Configurações Supabase
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

    // Exportar schema de cada tabela
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`  📄 Processando ${tableName}...`);
      
      try {
        // Obter estrutura da tabela
        const columnsResult = await localPool.query(`
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_name = $1 
          AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [tableName]);
        
        if (columnsResult.rows.length > 0) {
          supabaseScript += `-- Tabela: ${tableName}\n`;
          supabaseScript += `DROP TABLE IF EXISTS public.${tableName} CASCADE;\n`;
          supabaseScript += `CREATE TABLE public.${tableName} (\n`;
          
          const columns = columnsResult.rows.map(col => {
            let columnDef = `    ${col.column_name} `;
            
            // Mapear tipos PostgreSQL para Supabase
            switch (col.data_type) {
              case 'character varying':
                columnDef += col.character_maximum_length ? 
                  `VARCHAR(${col.character_maximum_length})` : 'TEXT';
                break;
              case 'text':
                columnDef += 'TEXT';
                break;
              case 'integer':
                columnDef += 'INTEGER';
                break;
              case 'bigint':
                columnDef += 'BIGINT';
                break;
              case 'boolean':
                columnDef += 'BOOLEAN';
                break;
              case 'timestamp without time zone':
                columnDef += 'TIMESTAMP';
                break;
              case 'timestamp with time zone':
                columnDef += 'TIMESTAMPTZ';
                break;
              case 'date':
                columnDef += 'DATE';
                break;
              case 'numeric':
                if (col.numeric_precision && col.numeric_scale) {
                  columnDef += `NUMERIC(${col.numeric_precision},${col.numeric_scale})`;
                } else {
                  columnDef += 'NUMERIC';
                }
                break;
              case 'real':
                columnDef += 'REAL';
                break;
              case 'double precision':
                columnDef += 'DOUBLE PRECISION';
                break;
              default:
                columnDef += col.data_type.toUpperCase();
            }
            
            // NOT NULL
            if (col.is_nullable === 'NO') {
              columnDef += ' NOT NULL';
            }
            
            // DEFAULT
            if (col.column_default) {
              columnDef += ` DEFAULT ${col.column_default}`;
            }
            
            return columnDef;
          });
          
          supabaseScript += columns.join(',\n') + '\n';
          supabaseScript += ');\n\n';
          
          // Obter dados da tabela
          const dataResult = await localPool.query(`SELECT * FROM ${tableName}`);
          
          if (dataResult.rows.length > 0) {
            supabaseScript += `-- Dados da tabela ${tableName} (${dataResult.rows.length} registros)\n`;
            
            const columnNames = columnsResult.rows.map(col => col.column_name);
            
            for (const row of dataResult.rows) {
              const values = columnNames.map(col => {
                const value = row[col];
                if (value === null) return 'NULL';
                if (typeof value === 'string') {
                  return `'${value.replace(/'/g, "''")}'`;
                }
                if (value instanceof Date) {
                  return `'${value.toISOString()}'`;
                }
                if (typeof value === 'boolean') {
                  return value ? 'TRUE' : 'FALSE';
                }
                return value;
              });
              
              supabaseScript += `INSERT INTO public.${tableName} (${columnNames.join(', ')}) VALUES (${values.join(', ')});\n`;
            }
            
            supabaseScript += '\n';
            console.log(`    ✅ ${dataResult.rows.length} registros exportados`);
          } else {
            console.log(`    ⚪ Tabela vazia`);
          }
        }
        
      } catch (error) {
        console.error(`    ❌ Erro em ${tableName}:`, error.message);
      }
    }
    
    // Adicionar configurações de segurança Supabase
    supabaseScript += `
-- Configurações de segurança Supabase
-- Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo (descomente se necessário)
-- CREATE POLICY "Usuários podem ver próprios dados" ON public.usuarios
--   FOR SELECT USING (auth.uid() = id::text);

-- Commit das mudanças
COMMIT;
`;
    
    // Salvar arquivo
    fs.writeFileSync('supabase-migration.sql', supabaseScript);
    console.log('✅ Arquivo supabase-migration.sql criado com sucesso!');
    
    return tablesResult.rows.length;
    
  } catch (error) {
    console.error('❌ Erro na exportação:', error.message);
    throw error;
  }
}

async function testSupabaseConnection(connectionString) {
  console.log('🔍 Testando conexão com Supabase...');
  
  supabasePool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const result = await supabasePool.query('SELECT NOW() as current_time, version()');
    const info = result.rows[0];
    
    console.log('✅ Conectado ao Supabase:', {
      time: info.current_time,
      version: info.version.split(' ').slice(0, 2).join(' ')
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão Supabase:', error.message);
    return false;
  }
}

async function importToSupabase(connectionString) {
  console.log('☁️ Importando dados para Supabase...');
  
  if (!fs.existsSync('supabase-migration.sql')) {
    throw new Error('Arquivo supabase-migration.sql não encontrado. Execute a exportação primeiro.');
  }
  
  const connected = await testSupabaseConnection(connectionString);
  if (!connected) {
    throw new Error('Não foi possível conectar ao Supabase');
  }
  
  try {
    // Ler e executar script
    const sqlScript = fs.readFileSync('supabase-migration.sql', 'utf8');
    
    console.log('📊 Executando migração...');
    await supabasePool.query(sqlScript);
    
    console.log('✅ Dados importados com sucesso para Supabase!');
    
    // Verificar importação
    const tablesResult = await supabasePool.query(`
      SELECT schemaname, tablename, n_live_tup as rows
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    
    console.log('\n📋 Tabelas importadas:');
    tablesResult.rows.forEach(table => {
      console.log(`  ✅ ${table.tablename}: ${table.rows} registros`);
    });
    
  } catch (error) {
    console.error('❌ Erro na importação:', error.message);
    throw error;
  } finally {
    if (supabasePool) {
      await supabasePool.end();
    }
  }
}

async function main() {
  try {
    console.log('🌐 Migração PostgreSQL → Supabase');
    console.log('==================================\n');
    
    // Testar conexão local
    console.log('🔍 Testando conexão local...');
    await localPool.query('SELECT NOW()');
    console.log('✅ Conectado ao banco local\n');
    
    // Verificar argumentos
    const args = process.argv.slice(2);
    
    if (args[0] === 'import' && args[1]) {
      // Importar para Supabase
      await importToSupabase(args[1]);
    } else {
      // Exportar dados locais
      const tableCount = await exportToSupabase();
      
      console.log(`\n🎉 Exportação concluída!`);
      console.log(`📊 ${tableCount} tabelas processadas`);
      console.log(`📄 Arquivo: supabase-migration.sql`);
      
      console.log('\n📋 Próximos passos:');
      console.log('1. 🌐 Acesse: https://supabase.com');
      console.log('2. 📦 Crie novo projeto: "gestaoescolar"');
      console.log('3. 🔗 Copie a Connection String');
      console.log('4. 🚀 Execute: node migrate-to-supabase.js import "sua-connection-string"');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  } finally {
    await localPool.end();
  }
}

// Executar
main();