const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testarAplicacaoAditivo() {
  try {
    console.log('🧪 Testando aplicação de aditivo...');
    
    // 1. Verificar produtos antes do aditivo
    console.log('\n📦 Produtos ANTES do aditivo:');
    const produtosAntes = await pool.query(`
      SELECT 
        cp.id as contrato_produto_id,
        cp.quantidade_contratada,
        cp.preco_unitario,
        p.nome as produto_nome
      FROM contrato_produtos cp
      LEFT JOIN produtos p ON cp.produto_id = p.id
      WHERE cp.contrato_id = 1
      ORDER BY p.nome
    `);
    
    produtosAntes.rows.forEach(produto => {
      console.log(`  - ${produto.produto_nome}: ${produto.quantidade_contratada} x R$ ${produto.preco_unitario}`);
    });
    
    // 2. Verificar se existem aditivos aplicados
    console.log('\n📋 Aditivos existentes:');
    const aditivos = await pool.query(`
      SELECT 
        a.id,
        a.numero_aditivo,
        a.tipo,
        a.percentual_acrescimo,
        a.aprovado_por
      FROM aditivos_contratos a
      WHERE a.contrato_id = 1 AND a.ativo = true
      ORDER BY a.created_at DESC
    `);
    
    if (aditivos.rows.length > 0) {
      aditivos.rows.forEach(aditivo => {
        console.log(`  - ${aditivo.numero_aditivo} (${aditivo.tipo}): ${aditivo.percentual_acrescimo}% - ${aditivo.aprovado_por ? 'Aprovado' : 'Pendente'}`);
      });
      
      // 3. Verificar itens dos aditivos
      console.log('\n🔍 Itens dos aditivos:');
      for (const aditivo of aditivos.rows) {
        const itensAditivo = await pool.query(`
          SELECT 
            aci.*,
            p.nome as produto_nome
          FROM aditivos_contratos_itens aci
          LEFT JOIN contrato_produtos cp ON aci.contrato_produto_id = cp.id
          LEFT JOIN produtos p ON cp.produto_id = p.id
          WHERE aci.aditivo_id = $1
        `, [aditivo.id]);
        
        console.log(`\n  Aditivo ${aditivo.numero_aditivo}:`);
        if (itensAditivo.rows.length > 0) {
          itensAditivo.rows.forEach(item => {
            console.log(`    - ${item.produto_nome}:`);
            console.log(`      Original: ${item.quantidade_original}`);
            console.log(`      Percentual: ${item.percentual_acrescimo}%`);
            console.log(`      Adicional: ${item.quantidade_adicional}`);
            console.log(`      Nova: ${item.quantidade_nova}`);
          });
        } else {
          console.log(`    ❌ Nenhum item encontrado para este aditivo`);
        }
      }
    } else {
      console.log('  ❌ Nenhum aditivo encontrado');
    }
    
    // 4. Simular aplicação de aditivo de 25%
    console.log('\n🔄 Simulando aplicação de aditivo de 25%:');
    produtosAntes.rows.forEach(produto => {
      const quantidadeOriginal = parseFloat(produto.quantidade_contratada);
      const percentual = 25;
      const quantidadeAdicional = (quantidadeOriginal * percentual) / 100;
      const quantidadeNova = quantidadeOriginal + quantidadeAdicional;
      
      console.log(`  - ${produto.produto_nome}:`);
      console.log(`    Original: ${quantidadeOriginal}`);
      console.log(`    Adicional (25%): ${quantidadeAdicional}`);
      console.log(`    Nova: ${quantidadeNova}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

testarAplicacaoAditivo();