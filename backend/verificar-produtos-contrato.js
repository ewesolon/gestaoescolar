const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verificarProdutosContrato() {
  try {
    console.log('🔍 Verificando estrutura das tabelas...');
    
    // Verificar estrutura da tabela produtos
    const estruturaProdutos = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'produtos' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela produtos:');
    estruturaProdutos.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar estrutura da tabela contrato_produtos
    const estruturaContratoP = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'contrato_produtos' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Estrutura da tabela contrato_produtos:');
    estruturaContratoP.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar contratos existentes
    const contratos = await pool.query(`
      SELECT id, numero, fornecedor_id 
      FROM contratos 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log('\n📋 Contratos recentes:');
    contratos.rows.forEach(contrato => {
      console.log(`  - ID: ${contrato.id}, Número: ${contrato.numero}, Fornecedor: ${contrato.fornecedor_id}`);
    });
    
    // Para cada contrato, verificar produtos
    for (const contrato of contratos.rows) {
      console.log(`\n🔍 Verificando produtos do contrato ${contrato.numero} (ID: ${contrato.id}):`);
      
      const produtosContrato = await pool.query(`
        SELECT 
          cp.id as contrato_produto_id,
          cp.produto_id,
          cp.quantidade_contratada as quantidade_atual,
          cp.preco_unitario as preco,
          p.nome as produto_nome,
          p.unidade as produto_unidade
        FROM contrato_produtos cp
        LEFT JOIN produtos p ON cp.produto_id = p.id
        WHERE cp.contrato_id = $1
        ORDER BY p.nome
      `, [contrato.id]);
      
      if (produtosContrato.rows.length > 0) {
        console.log(`  ✅ ${produtosContrato.rows.length} produtos encontrados:`);
        produtosContrato.rows.forEach(produto => {
          console.log(`    - ${produto.produto_nome} (${produto.produto_unidade}) - Qtd: ${produto.quantidade_atual} - Preço: R$ ${produto.preco}`);
        });
      } else {
        console.log(`  ❌ Nenhum produto encontrado`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

verificarProdutosContrato();