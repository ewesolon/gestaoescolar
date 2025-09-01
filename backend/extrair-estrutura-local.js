const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function extrairEstrutura() {
  try {
    console.log('🔍 Conectando ao banco local...');
    
    // Listar todas as tabelas
    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:', tabelas.rows.length);
    
    let sqlScript = '-- Script de migração completa do banco local para Supabase\n\n';
    
    for (const tabela of tabelas.rows) {
      const tableName = tabela.table_name;
      console.log(`📊 Processando tabela: ${tableName}`);
      
      // Obter estrutura da tabela
      const colunas = await pool.query(`
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
      
      // Obter constraints
      const constraints = await pool.query(`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = $1 
        AND tc.table_schema = 'public'
      `, [tableName]);
      
      // Gerar CREATE TABLE
      sqlScript += `-- Tabela: ${tableName}\n`;
      sqlScript += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
      
      const colunasSQL = colunas.rows.map(col => {
        let colDef = `  ${col.column_name} `;
        
        // Tipo de dados
        if (col.data_type === 'character varying') {
          colDef += col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'VARCHAR';
        } else if (col.data_type === 'numeric') {
          if (col.numeric_precision && col.numeric_scale) {
            colDef += `DECIMAL(${col.numeric_precision},${col.numeric_scale})`;
          } else {
            colDef += 'DECIMAL';
          }
        } else if (col.data_type === 'timestamp without time zone') {
          colDef += 'TIMESTAMP';
        } else if (col.data_type === 'integer') {
          colDef += 'INTEGER';
        } else if (col.data_type === 'boolean') {
          colDef += 'BOOLEAN';
        } else if (col.data_type === 'text') {
          colDef += 'TEXT';
        } else if (col.data_type === 'date') {
          colDef += 'DATE';
        } else if (col.data_type === 'bigint') {
          colDef += 'BIGINT';
        } else {
          colDef += col.data_type.toUpperCase();
        }
        
        // Default
        if (col.column_default) {
          if (col.column_default.includes('nextval')) {
            // É uma sequência (SERIAL)
            colDef = colDef.replace('INTEGER', 'SERIAL');
          } else {
            colDef += ` DEFAULT ${col.column_default}`;
          }
        }
        
        // NOT NULL
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        return colDef;
      });
      
      sqlScript += colunasSQL.join(',\n');
      
      // Adicionar constraints
      const primaryKeys = constraints.rows.filter(c => c.constraint_type === 'PRIMARY KEY');
      const foreignKeys = constraints.rows.filter(c => c.constraint_type === 'FOREIGN KEY');
      const uniqueKeys = constraints.rows.filter(c => c.constraint_type === 'UNIQUE');
      
      if (primaryKeys.length > 0) {
        const pkColumns = primaryKeys.map(pk => pk.column_name).join(', ');
        sqlScript += `,\n  PRIMARY KEY (${pkColumns})`;
      }
      
      foreignKeys.forEach(fk => {
        sqlScript += `,\n  FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})`;
      });
      
      uniqueKeys.forEach(uk => {
        sqlScript += `,\n  UNIQUE (${uk.column_name})`;
      });
      
      sqlScript += '\n);\n\n';
    }
    
    // Obter dados de algumas tabelas importantes
    const tabelasComDados = ['modalidades', 'usuarios'];
    
    for (const tableName of tabelasComDados) {
      const tabelaExiste = tabelas.rows.find(t => t.table_name === tableName);
      if (tabelaExiste) {
        console.log(`📦 Extraindo dados da tabela: ${tableName}`);
        
        const dados = await pool.query(`SELECT * FROM ${tableName}`);
        
        if (dados.rows.length > 0) {
          sqlScript += `-- Dados da tabela: ${tableName}\n`;
          
          const colunas = Object.keys(dados.rows[0]);
          const colunasStr = colunas.join(', ');
          
          dados.rows.forEach(row => {
            const valores = colunas.map(col => {
              const valor = row[col];
              if (valor === null) return 'NULL';
              if (typeof valor === 'string') return `'${valor.replace(/'/g, "''")}'`;
              if (valor instanceof Date) return `'${valor.toISOString()}'`;
              return valor;
            }).join(', ');
            
            sqlScript += `INSERT INTO ${tableName} (${colunasStr}) VALUES (${valores}) ON CONFLICT DO NOTHING;\n`;
          });
          
          sqlScript += '\n';
        }
      }
    }
    
    // Salvar script
    fs.writeFileSync('./migracao-completa-supabase.sql', sqlScript);
    console.log('✅ Script de migração salvo em: migracao-completa-supabase.sql');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

extrairEstrutura();