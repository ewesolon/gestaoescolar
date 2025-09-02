const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function aplicarMigracao() {
    try {
        console.log('🔧 Aplicando migração para corrigir tabela estoque_escolas_historico...\n');

        // Ler o arquivo de migração
        const migracaoPath = path.join(__dirname, 'migrations', '036_corrigir_tabela_historico_estoque.sql');
        const sql = fs.readFileSync(migracaoPath, 'utf8');

        // Executar a migração
        await pool.query(sql);

        console.log('✅ Migração aplicada com sucesso!');

        // Verificar a estrutura atualizada
        const colunas = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'estoque_escolas_historico'
      ORDER BY ordinal_position;
    `);

        console.log('\n📋 Estrutura atualizada da tabela estoque_escolas_historico:');
        console.log('='.repeat(60));

        colunas.rows.forEach(col => {
            console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

    } catch (error) {
        console.error('❌ Erro ao aplicar migração:', error);
    } finally {
        await pool.end();
    }
}

aplicarMigracao();