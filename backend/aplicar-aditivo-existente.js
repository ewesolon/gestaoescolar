const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function aplicarAditivoExistente() {
  try {
    console.log('🔄 Aplicando aditivo existente...');
    
    // Buscar o aditivo pendente
    const aditivo = await pool.query(`
      SELECT * FROM aditivos_contratos 
      WHERE contrato_id = 1 AND ativo = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (aditivo.rows.length === 0) {
      console.log('❌ Nenhum aditivo encontrado');
      return;
    }
    
    const aditivoData = aditivo.rows[0];
    console.log('📋 Aditivo encontrado:', {
      id: aditivoData.id,
      numero: aditivoData.numero_aditivo,
      tipo: aditivoData.tipo,
      percentual: aditivoData.percentual_acrescimo,
      aprovado: aditivoData.aprovado_por ? 'Sim' : 'Não'
    });
    
    // Aplicar o aditivo
    if (aditivoData.tipo === 'QUANTIDADE' && aditivoData.percentual_acrescimo) {
      console.log(`🔄 Aplicando aditivo de ${aditivoData.percentual_acrescimo}%...`);
      
      try {
        const resultado = await aplicarAditivoQuantidadeGlobal(
          aditivoData.id, 
          aditivoData.percentual_acrescimo
        );
        
        console.log('✅ Aditivo aplicado com sucesso!');
        console.log('📊 Itens processados:', resultado.length);
        
        // Verificar os produtos após aplicação
        console.log('\n📦 Produtos APÓS aplicação:');
        const produtosDepois = await pool.query(`
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
        
        produtosDepois.rows.forEach(produto => {
          console.log(`  - ${produto.produto_nome}: ${produto.quantidade_contratada} x R$ ${produto.preco_unitario}`);
        });
        
        // Verificar itens do aditivo
        console.log('\n📋 Itens do aditivo aplicado:');
        const itensAditivo = await pool.query(`
          SELECT 
            aci.*,
            p.nome as produto_nome
          FROM aditivos_contratos_itens aci
          LEFT JOIN contrato_produtos cp ON aci.contrato_produto_id = cp.id
          LEFT JOIN produtos p ON cp.produto_id = p.id
          WHERE aci.aditivo_id = $1
        `, [aditivoData.id]);
        
        itensAditivo.rows.forEach(item => {
          console.log(`  - ${item.produto_nome}:`);
          console.log(`    Original: ${item.quantidade_original}`);
          console.log(`    Adicional: ${item.quantidade_adicional}`);
          console.log(`    Nova: ${item.quantidade_nova}`);
        });
        
      } catch (error) {
        console.error('❌ Erro ao aplicar aditivo:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

aplicarAditivoExistente();