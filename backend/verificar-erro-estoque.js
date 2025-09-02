const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verificarErroEstoque() {
  try {
    console.log('🔍 Verificando erro de estoque da escola ID: 5...');
    
    // 1. Verificar se a escola existe
    console.log('\n📋 Verificando escola:');
    const escola = await pool.query(`
      SELECT id, nome, ativo 
      FROM escolas 
      WHERE id = 5
    `);
    
    if (escola.rows.length > 0) {
      console.log(`✅ Escola encontrada: ${escola.rows[0].nome} (Ativo: ${escola.rows[0].ativo})`);
    } else {
      console.log('❌ Escola ID 5 não encontrada');
      return;
    }
    
    // 2. Verificar estrutura da tabela estoque_escolas
    console.log('\n📋 Estrutura da tabela estoque_escolas:');
    const estruturaEstoque = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'estoque_escolas' 
      ORDER BY ordinal_position
    `);
    
    if (estruturaEstoque.rows.length > 0) {
      estruturaEstoque.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
    } else {
      console.log('❌ Tabela estoque_escolas não encontrada');
    }
    
    // 3. Verificar dados de estoque da escola
    console.log('\n📦 Dados de estoque da escola 5:');
    const estoqueEscola = await pool.query(`
      SELECT 
        ee.id,
        ee.escola_id,
        ee.produto_id,
        ee.quantidade_atual,
        ee.quantidade_minima,
        p.nome as produto_nome,
        p.unidade
      FROM estoque_escolas ee
      LEFT JOIN produtos p ON ee.produto_id = p.id
      WHERE ee.escola_id = 5
      ORDER BY p.nome
      LIMIT 10
    `);
    
    if (estoqueEscola.rows.length > 0) {
      console.log(`✅ ${estoqueEscola.rows.length} itens de estoque encontrados:`);
      estoqueEscola.rows.forEach(item => {
        console.log(`  - ${item.produto_nome}: ${item.quantidade_atual} ${item.unidade} (Min: ${item.quantidade_minima})`);
      });
    } else {
      console.log('❌ Nenhum item de estoque encontrado para a escola 5');
    }
    
    // 4. Verificar se há tabelas relacionadas que podem estar causando erro
    console.log('\n📋 Verificando tabelas relacionadas:');
    const tabelasRelacionadas = [
      'estoque_lotes',
      'estoque_movimentacoes',
      'estoque_alertas',
      'estoque_escolas_historico'
    ];
    
    for (const tabela of tabelasRelacionadas) {
      try {
        const count = await pool.query(`SELECT COUNT(*) as total FROM ${tabela} WHERE escola_id = 5`);
        console.log(`  ✅ ${tabela}: ${count.rows[0].total} registros`);
      } catch (error) {
        console.log(`  ❌ ${tabela}: Erro - ${error.message}`);
      }
    }
    
    // 5. Testar query típica da página de estoque
    console.log('\n🧪 Testando query típica da página de estoque:');
    try {
      const queryTeste = await pool.query(`
        SELECT 
          ee.id,
          ee.produto_id,
          ee.quantidade_atual,
          ee.quantidade_minima,
          ee.updated_at,
          p.nome as produto_nome,
          p.unidade,
          p.categoria,
          CASE 
            WHEN ee.quantidade_atual <= ee.quantidade_minima THEN 'CRITICO'
            WHEN ee.quantidade_atual <= (ee.quantidade_minima * 1.5) THEN 'BAIXO'
            ELSE 'NORMAL'
          END as status_estoque
        FROM estoque_escolas ee
        LEFT JOIN produtos p ON ee.produto_id = p.id
        WHERE ee.escola_id = $1
        ORDER BY p.nome
      `, [5]);
      
      console.log(`✅ Query executada com sucesso: ${queryTeste.rows.length} resultados`);
    } catch (error) {
      console.log(`❌ Erro na query: ${error.message}`);
      console.log(`   Detalhes: ${error.detail || 'N/A'}`);
      console.log(`   Código: ${error.code || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await pool.end();
  }
}

verificarErroEstoque();