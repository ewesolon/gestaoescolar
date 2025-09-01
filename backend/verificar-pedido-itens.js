const { Client } = require('pg');
require('dotenv').config();

async function verificarTabela() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('✅ Conectado ao Supabase');

        // Listar todas as tabelas relacionadas a recebimento
        const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%receb%' OR table_name LIKE '%pedido%')
      ORDER BY table_name;
    `);

        console.log('📋 Tabelas relacionadas a pedidos e recebimento:');
        tabelas.rows.forEach(row => {
            console.log(`  ${row.table_name}`);
        });

        // Verificar estrutura da tabela recebimentos_simples
        if (tabelas.rows.some(row => row.table_name === 'recebimentos_simples')) {
            const estrutura = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'recebimentos_simples' 
        ORDER BY ordinal_position;
      `);

            console.log('\n📋 Estrutura da tabela recebimentos_simples:');
            estrutura.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        }

        // Verificar estrutura da tabela recebimento_itens_controle
        if (tabelas.rows.some(row => row.table_name === 'recebimento_itens_controle')) {
            const estrutura = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'recebimento_itens_controle' 
        ORDER BY ordinal_position;
      `);

            console.log('\n📋 Estrutura da tabela recebimento_itens_controle:');
            estrutura.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        }

        // Verificar estrutura da tabela pedidos_itens
        if (tabelas.rows.some(row => row.table_name === 'pedidos_itens')) {
            const estrutura = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_itens' 
        ORDER BY ordinal_position;
      `);

            console.log('\n📋 Estrutura da tabela pedidos_itens:');
            estrutura.rows.forEach(row => {
                console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        }

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await client.end();
    }
}

verificarTabela();