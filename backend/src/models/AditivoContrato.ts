const db = require("../database");

export interface AditivoContrato {
  id: number;
  contrato_id: number;
  numero_aditivo: string;
  tipo: 'PRAZO' | 'QUANTIDADE' | 'VALOR' | 'MISTO';
  data_assinatura: string;
  data_inicio_vigencia: string;
  data_fim_vigencia?: string;
  
  // Aditivo de Prazo
  prazo_adicional_dias?: number;
  nova_data_fim?: string;
  
  // Aditivo de Quantidade/Valor (para aditivos globais)
  percentual_acrescimo?: number;
  valor_original?: number;
  valor_aditivo?: number;
  valor_total_atualizado?: number;
  
  // Justificativas e documentação
  justificativa: string;
  fundamentacao_legal: string;
  numero_processo?: string;
  
  // Controle
  ativo: boolean;
  criado_por: number;
  aprovado_por?: number;
  data_aprovacao?: string;
  observacoes?: string;
  
  // Itens do aditivo (para aditivos de quantidade)
  itens?: AditivoContratoItem[];
}

export interface AditivoContratoItem {
  id: number;
  aditivo_id: number;
  contrato_produto_id: number;
  quantidade_original: number;
  percentual_acrescimo: number;
  quantidade_adicional: number;
  quantidade_nova: number;
  valor_unitario: number;
  valor_adicional: number;
  
  // Campos adicionais do JOIN
  produto_nome?: string;
  produto_unidade?: string;
}

export async function createAditivoContratoTable() {
  
  // Tabela principal de aditivos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS aditivos_contratos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contrato_id INTEGER NOT NULL,
      numero_aditivo TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK (tipo IN ('PRAZO', 'QUANTIDADE', 'VALOR', 'MISTO')),
      data_assinatura TEXT NOT NULL,
      data_inicio_vigencia TEXT NOT NULL,
      data_fim_vigencia TEXT,
      
      -- Aditivo de Prazo
      prazo_adicional_dias INTEGER,
      nova_data_fim TEXT,
      
      -- Aditivo de Quantidade/Valor (para aditivos globais)
      percentual_acrescimo DECIMAL(5,2),
      valor_original DECIMAL(12,2),
      valor_aditivo DECIMAL(12,2),
      valor_total_atualizado DECIMAL(12,2),
      
      -- Justificativas
      justificativa TEXT NOT NULL,
      fundamentacao_legal TEXT NOT NULL,
      numero_processo TEXT,
      
      -- Controle
      ativo BOOLEAN NOT NULL DEFAULT 1,
      criado_por INTEGER NOT NULL,
      aprovado_por INTEGER,
      data_aprovacao TEXT,
      observacoes TEXT,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (contrato_id) REFERENCES contratos(id),
      FOREIGN KEY (criado_por) REFERENCES usuarios(id),
      FOREIGN KEY (aprovado_por) REFERENCES usuarios(id)
    )
  `);

  // Tabela para aditivos de quantidade por item
  await db.exec(`
    CREATE TABLE IF NOT EXISTS aditivos_contratos_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aditivo_id INTEGER NOT NULL,
      contrato_produto_id INTEGER NOT NULL,
      quantidade_original DECIMAL(10,3) NOT NULL,
      percentual_acrescimo DECIMAL(5,2) NOT NULL,
      quantidade_adicional DECIMAL(10,3) NOT NULL,
      quantidade_nova DECIMAL(10,3) NOT NULL,
      valor_unitario DECIMAL(10,2) NOT NULL,
      valor_adicional DECIMAL(12,2) NOT NULL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (aditivo_id) REFERENCES aditivos_contratos(id) ON DELETE CASCADE,
      FOREIGN KEY (contrato_produto_id) REFERENCES contrato_produtos(id)
    )
  `);

  // Índices para performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_aditivos_contratos_contrato 
    ON aditivos_contratos(contrato_id, ativo);
  `);
  
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_aditivos_itens_aditivo 
    ON aditivos_contratos_itens(aditivo_id);
  `);
}

export async function insertAditivoContrato(aditivo: Omit<AditivoContrato, "id">) {
  const result = await db.query(
    `INSERT INTO aditivos_contratos (
      contrato_id, numero_aditivo, tipo, data_assinatura, data_inicio_vigencia,
      data_fim_vigencia, prazo_adicional_dias, nova_data_fim, percentual_acrescimo,
      valor_original, valor_aditivo, valor_total_atualizado, justificativa,
      fundamentacao_legal, numero_processo, ativo, criado_por, aprovado_por,
      data_aprovacao, observacoes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    RETURNING *`,
    [
      aditivo.contrato_id,
      aditivo.numero_aditivo,
      aditivo.tipo,
      aditivo.data_assinatura,
      aditivo.data_inicio_vigencia,
      aditivo.data_fim_vigencia || null,
      aditivo.prazo_adicional_dias || null,
      aditivo.nova_data_fim || null,
      aditivo.percentual_acrescimo || null,
      aditivo.valor_original || null,
      aditivo.valor_aditivo || null,
      aditivo.valor_total_atualizado || null,
      aditivo.justificativa,
      aditivo.fundamentacao_legal,
      aditivo.numero_processo || null,
      aditivo.ativo,
      aditivo.criado_por,
      aditivo.aprovado_por || null,
      aditivo.data_aprovacao || null,
      aditivo.observacoes || null,
    ]
  );
  return result.rows[0];
}

export async function getAditivosByContrato(contrato_id: number) {
  const result = await db.query(
    `SELECT a.*, 
            u1.nome as criado_por_nome,
            u2.nome as aprovado_por_nome
     FROM aditivos_contratos a
     LEFT JOIN usuarios u1 ON a.criado_por = u1.id
     LEFT JOIN usuarios u2 ON a.aprovado_por = u2.id
     WHERE a.contrato_id = $1
     ORDER BY a.data_assinatura DESC`,
    [contrato_id]
  );
  return result.rows;
}

export async function getAditivoById(id: number) {
  const result = await db.query(
    `SELECT a.*, 
            u1.nome as criado_por_nome,
            u2.nome as aprovado_por_nome
     FROM aditivos_contratos a
     LEFT JOIN usuarios u1 ON a.criado_por = u1.id
     LEFT JOIN usuarios u2 ON a.aprovado_por = u2.id
     WHERE a.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) return null;
  
  const aditivo = result.rows[0];
  
  // Se for aditivo de quantidade, buscar os itens
  if (aditivo.tipo === 'QUANTIDADE' || aditivo.tipo === 'MISTO') {
    aditivo.itens = await obterItensAditivo(id);
  }
  
  return aditivo;
}

export async function updateAditivoContrato(id: number, aditivo: Partial<AditivoContrato>) {
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  if (aditivo.numero_aditivo !== undefined) {
    fields.push(`numero_aditivo = $${paramIndex++}`);
    values.push(aditivo.numero_aditivo);
  }
  if (aditivo.tipo !== undefined) {
    fields.push(`tipo = $${paramIndex++}`);
    values.push(aditivo.tipo);
  }
  if (aditivo.data_assinatura !== undefined) {
    fields.push(`data_assinatura = $${paramIndex++}`);
    values.push(aditivo.data_assinatura);
  }
  if (aditivo.data_inicio_vigencia !== undefined) {
    fields.push(`data_inicio_vigencia = $${paramIndex++}`);
    values.push(aditivo.data_inicio_vigencia);
  }
  if (aditivo.data_fim_vigencia !== undefined) {
    fields.push(`data_fim_vigencia = $${paramIndex++}`);
    values.push(aditivo.data_fim_vigencia || null);
  }
  if (aditivo.prazo_adicional_dias !== undefined) {
    fields.push(`prazo_adicional_dias = $${paramIndex++}`);
    values.push(aditivo.prazo_adicional_dias || null);
  }
  if (aditivo.nova_data_fim !== undefined) {
    fields.push(`nova_data_fim = $${paramIndex++}`);
    values.push(aditivo.nova_data_fim || null);
  }
  if (aditivo.percentual_acrescimo !== undefined) {
    fields.push(`percentual_acrescimo = $${paramIndex++}`);
    values.push(aditivo.percentual_acrescimo || null);
  }
  if (aditivo.valor_original !== undefined) {
    fields.push(`valor_original = $${paramIndex++}`);
    values.push(aditivo.valor_original || null);
  }
  if (aditivo.valor_aditivo !== undefined) {
    fields.push(`valor_aditivo = $${paramIndex++}`);
    values.push(aditivo.valor_aditivo || null);
  }
  if (aditivo.valor_total_atualizado !== undefined) {
    fields.push(`valor_total_atualizado = $${paramIndex++}`);
    values.push(aditivo.valor_total_atualizado || null);
  }
  if (aditivo.justificativa !== undefined) {
    fields.push(`justificativa = $${paramIndex++}`);
    values.push(aditivo.justificativa);
  }
  if (aditivo.fundamentacao_legal !== undefined) {
    fields.push(`fundamentacao_legal = $${paramIndex++}`);
    values.push(aditivo.fundamentacao_legal);
  }
  if (aditivo.numero_processo !== undefined) {
    fields.push(`numero_processo = $${paramIndex++}`);
    values.push(aditivo.numero_processo || null);
  }
  if (aditivo.ativo !== undefined) {
    fields.push(`ativo = $${paramIndex++}`);
    values.push(aditivo.ativo);
  }
  if (aditivo.aprovado_por !== undefined) {
    fields.push(`aprovado_por = $${paramIndex++}`);
    values.push(aditivo.aprovado_por || null);
  }
  if (aditivo.data_aprovacao !== undefined) {
    fields.push(`data_aprovacao = $${paramIndex++}`);
    values.push(aditivo.data_aprovacao || null);
  }
  if (aditivo.observacoes !== undefined) {
    fields.push(`observacoes = $${paramIndex++}`);
    values.push(aditivo.observacoes || null);
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  if (fields.length === 1) { // Apenas o updated_at
    throw new Error('Nenhum campo para atualizar');
  }
  
  values.push(id);
  
  const query = `UPDATE aditivos_contratos SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
  await db.query(query, values);
}

export async function deleteAditivoContrato(id: number) {
  let retries = 3;
  while (retries > 0) {
    try {
      await db.query('BEGIN');
      
      // 1. Buscar os itens do aditivo antes de remover para reverter as quantidades
      const itensResult = await db.query(`
        SELECT aci.*, cp.limite as quantidade_atual
        FROM aditivos_contratos_itens aci
        JOIN contrato_produtos cp ON aci.contrato_produto_id = cp.id
        WHERE aci.aditivo_id = $1
      `, [id]);
      const itensAditivo = itensResult.rows;
      
      // 2. Reverter as quantidades nos produtos do contrato
      for (const item of itensAditivo) {
        const quantidadeOriginal = item.quantidade_original;
        const quantidadeAdicional = item.quantidade_adicional;
        
        // Restaurar a quantidade original e reduzir o saldo
        await db.query(`
          UPDATE contrato_produtos 
          SET limite = $1, saldo = saldo - $2
          WHERE id = $3
        `, [quantidadeOriginal, quantidadeAdicional, item.contrato_produto_id]);
        
        console.log(`✅ Revertido produto ${item.contrato_produto_id}: ${item.quantidade_nova} → ${quantidadeOriginal}`);
      }
      
      // 3. Remover itens do aditivo
      await db.query(`DELETE FROM aditivos_contratos_itens WHERE aditivo_id = $1`, [id]);
      
      // 4. Remover o aditivo
      await db.query(`DELETE FROM aditivos_contratos WHERE id = $1`, [id]);
      
      await db.query('COMMIT');
      console.log(`✅ Aditivo ${id} removido e quantidades revertidas com sucesso`);
      
      return;
    } catch (error: any) {
      console.error('❌ Erro na remoção do aditivo:', error.message);
      
      try {
        await db.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Erro no rollback:', rollbackError);
      }
      
      if (retries > 1) {
        retries--;
        console.log(`Erro no banco, tentando novamente... (${retries} tentativas restantes)`);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Falha ao remover aditivo após múltiplas tentativas');
}

// Funções para gerenciar itens dos aditivos
export async function inserirItensAditivo(aditivo_id: number, itens: Omit<AditivoContratoItem, 'id' | 'aditivo_id'>[]) {
  for (const item of itens) {
    await db.query(
      `INSERT INTO aditivos_contratos_itens (
        aditivo_id, contrato_produto_id, quantidade_original, percentual_acrescimo,
        quantidade_adicional, quantidade_nova, valor_unitario, valor_adicional
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        aditivo_id,
        item.contrato_produto_id,
        item.quantidade_original,
        item.percentual_acrescimo,
        item.quantidade_adicional,
        item.quantidade_nova,
        item.valor_unitario,
        item.valor_adicional
      ]
    );
  }
}

export async function obterItensAditivo(aditivo_id: number): Promise<AditivoContratoItem[]> {
  const result = await db.query(`
    SELECT 
      aci.*,
      p.nome as produto_nome,
      p.unidade as produto_unidade
    FROM aditivos_contratos_itens aci
    JOIN contrato_produtos cp ON aci.contrato_produto_id = cp.id
    JOIN produtos p ON cp.produto_id = p.id
    WHERE aci.aditivo_id = $1
    ORDER BY p.nome
  `, [aditivo_id]);
  return result.rows;
}

export async function calcularQuantidadesComAditivos(contrato_id: number) {
  // Buscar produtos do contrato com suas quantidades originais
  const produtosOriginaisResult = await db.query(`
    SELECT 
      cp.id as contrato_produto_id,
      cp.produto_id,
      cp.limite as quantidade_original,
      cp.preco,
      p.nome as produto_nome,
      p.unidade
    FROM contrato_produtos cp
    JOIN produtos p ON cp.produto_id = p.id
    WHERE cp.contrato_id = $1
  `, [contrato_id]);
  const produtosOriginais = produtosOriginaisResult.rows;
  
  // Buscar todos os aditivos de quantidade ativos para este contrato
  const aditivosQuantidadeResult = await db.query(`
    SELECT 
      a.id as aditivo_id,
      a.percentual_acrescimo,
      aci.contrato_produto_id,
      aci.quantidade_adicional,
      aci.quantidade_nova
    FROM aditivos_contratos a
    LEFT JOIN aditivos_contratos_itens aci ON a.id = aci.aditivo_id
    WHERE a.contrato_id = $1 
      AND a.tipo IN ('QUANTIDADE', 'MISTO')
      AND a.ativo = true
      AND a.aprovado_por IS NOT NULL
    ORDER BY a.data_assinatura
  `, [contrato_id]);
  const aditivosQuantidade = aditivosQuantidadeResult.rows;
  
  // Calcular quantidades finais para cada produto
  const quantidadesFinais = produtosOriginais.map((produto: any) => {
    let quantidadeFinal = produto.quantidade_original;
    let aditivosAplicados = [];
    
    // Aplicar aditivos específicos por item
    const aditivosItem = aditivosQuantidade.filter((a: any) => a.contrato_produto_id === produto.contrato_produto_id);
    
    for (const aditivo of aditivosItem) {
      quantidadeFinal = aditivo.quantidade_nova;
      aditivosAplicados.push({
        aditivo_id: aditivo.aditivo_id,
        quantidade_adicional: aditivo.quantidade_adicional
      });
    }
    
    return {
      ...produto,
      quantidade_final: quantidadeFinal,
      quantidade_adicional_total: quantidadeFinal - produto.quantidade_original,
      aditivos_aplicados: aditivosAplicados
    };
  });
  
  return quantidadesFinais;
}

// Função para obter a quantidade original real de um produto do contrato
export async function obterQuantidadeOriginalProduto(contrato_produto_id: number): Promise<number> {
  // Buscar a quantidade original do primeiro aditivo aplicado a este produto
  // Se não houver aditivos, usar a quantidade atual do contrato
  const primeiroAditivoResult = await db.query(`
    SELECT quantidade_original 
    FROM aditivos_contratos_itens 
    WHERE contrato_produto_id = $1 
    ORDER BY aditivo_id ASC 
    LIMIT 1
  `, [contrato_produto_id]);
  
  if (primeiroAditivoResult.rows.length > 0) {
    return parseFloat(primeiroAditivoResult.rows[0].quantidade_original);
  }
  
  // Se não há aditivos, a quantidade atual é a original
  const produtoResult = await db.query(`
    SELECT limite FROM contrato_produtos WHERE id = $1
  `, [contrato_produto_id]);
  
  return parseFloat(produtoResult.rows[0].limite);
}

export async function aplicarAditivoQuantidadeGlobal(aditivo_id: number, percentual_acrescimo: number) {
  try {
    // Buscar o contrato_id do aditivo
    const aditivo = await db.get(`
      SELECT contrato_id FROM aditivos_contratos WHERE id = $1
    `, [aditivo_id]);
    
    if (!aditivo) {
      throw new Error('Aditivo não encontrado');
    }
    
    const contrato_id = aditivo.contrato_id;
    
    // Usar transação PostgreSQL
    await db.query('BEGIN');
    
    try {
      // Buscar todos os produtos do contrato
      const produtosResult = await db.query(`
        SELECT 
          cp.id as contrato_produto_id,
          cp.limite as quantidade_atual,
          cp.preco,
          p.nome as produto_nome
        FROM contrato_produtos cp
        JOIN produtos p ON cp.produto_id = p.id
        WHERE cp.contrato_id = $1
      `, [contrato_id]);
      
      const produtos = produtosResult.rows;
      
      if (produtos.length === 0) {
        throw new Error('Nenhum produto encontrado para o contrato');
      }
      
      const itensAditivo = [];
      
      for (const produto of produtos) {
        // Obter a quantidade original real (não modificada por aditivos anteriores)
        const quantidade_original = await obterQuantidadeOriginalProduto(produto.contrato_produto_id);
        const quantidade_adicional = (quantidade_original * percentual_acrescimo) / 100;
        const quantidade_nova = produto.quantidade_atual + quantidade_adicional;
        const valor_adicional = quantidade_adicional * parseFloat(produto.preco);
        
        itensAditivo.push({
          contrato_produto_id: produto.contrato_produto_id,
          quantidade_original,
          percentual_acrescimo,
          quantidade_adicional,
          quantidade_nova,
          valor_unitario: produto.preco,
          valor_adicional
        });
      }
      
      // Inserir itens do aditivo
      for (const item of itensAditivo) {
        await db.query(
          `INSERT INTO aditivos_contratos_itens (
            aditivo_id, contrato_produto_id, quantidade_original, percentual_acrescimo,
            quantidade_adicional, quantidade_nova, valor_unitario, valor_adicional
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            aditivo_id,
            item.contrato_produto_id,
            item.quantidade_original,
            item.percentual_acrescimo,
            item.quantidade_adicional,
            item.quantidade_nova,
            item.valor_unitario,
            item.valor_adicional
          ]
        );
      }
      
      // Atualizar as quantidades nos contratos
      for (const item of itensAditivo) {
        await db.query(`
          UPDATE contrato_produtos 
          SET limite = $1, saldo = saldo + $2
          WHERE id = $3
        `, [item.quantidade_nova, item.quantidade_adicional, item.contrato_produto_id]);
      }
      
      await db.query('COMMIT');
      console.log(`✅ Aditivo global aplicado com sucesso: ${itensAditivo.length} itens`);
      
      return itensAditivo;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Erro na aplicação do aditivo global:', error.message);
    throw error;
  }
}

export async function aplicarAditivoQuantidadeEspecifica(
  aditivo_id: number, 
  itensEspecificos: {
    contrato_produto_id: number;
    percentual_acrescimo: number;
  }[]
) {
  try {
    // Buscar o contrato_id do aditivo
    const aditivo = await db.get(`
      SELECT contrato_id FROM aditivos_contratos WHERE id = $1
    `, [aditivo_id]);
    
    if (!aditivo) {
      throw new Error('Aditivo não encontrado');
    }
    
    const contrato_id = aditivo.contrato_id;
    
    // Usar transação PostgreSQL
    await db.query('BEGIN');
    
    try {
      const itensAditivo = [];
      
      for (const itemEspecifico of itensEspecificos) {
        // Buscar dados do produto específico
        const produtoResult = await db.query(`
          SELECT 
            cp.id as contrato_produto_id,
            cp.limite as quantidade_atual,
            cp.preco,
            p.nome as produto_nome
          FROM contrato_produtos cp
          JOIN produtos p ON cp.produto_id = p.id
          WHERE cp.id = $1 AND cp.contrato_id = $2
        `, [itemEspecifico.contrato_produto_id, contrato_id]);
        
        if (produtoResult.rows.length === 0) {
          throw new Error(`Produto não encontrado: ${itemEspecifico.contrato_produto_id}`);
        }
        
        const produto = produtoResult.rows[0];
        // Obter a quantidade original real (não modificada por aditivos anteriores)
        const quantidade_original = await obterQuantidadeOriginalProduto(produto.contrato_produto_id);
        const quantidade_adicional = (quantidade_original * itemEspecifico.percentual_acrescimo) / 100;
        const quantidade_nova = produto.quantidade_atual + quantidade_adicional;
        const valor_adicional = quantidade_adicional * parseFloat(produto.preco);
        
        itensAditivo.push({
          contrato_produto_id: produto.contrato_produto_id,
          quantidade_original,
          percentual_acrescimo: itemEspecifico.percentual_acrescimo,
          quantidade_adicional,
          quantidade_nova,
          valor_unitario: produto.preco,
          valor_adicional
        });
      }
      
      // Inserir itens do aditivo
      for (const item of itensAditivo) {
        await db.query(
          `INSERT INTO aditivos_contratos_itens (
            aditivo_id, contrato_produto_id, quantidade_original, percentual_acrescimo,
            quantidade_adicional, quantidade_nova, valor_unitario, valor_adicional
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            aditivo_id,
            item.contrato_produto_id,
            item.quantidade_original,
            item.percentual_acrescimo,
            item.quantidade_adicional,
            item.quantidade_nova,
            item.valor_unitario,
            item.valor_adicional
          ]
        );
      }
      
      // Atualizar as quantidades nos contratos
      for (const item of itensAditivo) {
        await db.query(`
          UPDATE contrato_produtos 
          SET limite = $1, saldo = saldo + $2
          WHERE id = $3
        `, [item.quantidade_nova, item.quantidade_adicional, item.contrato_produto_id]);
      }
      
      await db.query('COMMIT');
      console.log(`✅ Aditivo específico aplicado com sucesso: ${itensAditivo.length} itens`);
      
      return itensAditivo;
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error('❌ Erro na aplicação do aditivo específico:', error.message);
    throw error;
  }
}

// Função para validar limites legais dos aditivos
export async function obterProdutosContratoParaAditivo(contrato_id: number) {
  const result = await db.query(`
    SELECT 
      cp.id as contrato_produto_id,
      cp.produto_id,
      cp.limite as quantidade_atual,
      cp.preco,
      p.nome as produto_nome,
      p.unidade as produto_unidade,
      (cp.limite * cp.preco) as valor_total
    FROM contrato_produtos cp
    JOIN produtos p ON cp.produto_id = p.id
    WHERE cp.contrato_id = $1
    ORDER BY p.nome
  `, [contrato_id]);
  return result.rows;
}

export async function validarLimitesAditivo(contrato_id: number, tipo: string, percentual_acrescimo?: number, aditivo_id_excluir?: number) {
  // Buscar aditivos existentes do contrato
  let query = `SELECT tipo, percentual_acrescimo FROM aditivos_contratos 
               WHERE contrato_id = $1 AND ativo = true AND tipo IN ('QUANTIDADE', 'VALOR', 'MISTO')`;
  let params = [contrato_id];
  
  // Se estiver editando um aditivo, excluir ele da consulta
  if (aditivo_id_excluir) {
    query += ` AND id != $2`;
    params.push(aditivo_id_excluir);
  }
  
  const result = await db.query(query, params);
  const aditivosExistentes = result.rows;
  
  // Calcular percentual acumulado
  let percentualAcumulado = 0;
  aditivosExistentes.forEach((aditivo: any) => {
    if (aditivo.percentual_acrescimo) {
      percentualAcumulado += parseFloat(aditivo.percentual_acrescimo);
    }
  });
  
  // Adicionar o novo percentual
  if (percentual_acrescimo) {
    percentualAcumulado += parseFloat(percentual_acrescimo.toString());
  }
  
  // Validar limites conforme Lei 14.133/21
  // Art. 124: até 25% para acréscimos e 25% para supressões
  if (percentualAcumulado > 25) {
    return {
      valido: false,
      erro: `O percentual acumulado de aditivos (${percentualAcumulado.toFixed(2)}%) excede o limite legal de 25% estabelecido pela Lei 14.133/21, Art. 124.`,
      percentualAcumulado,
      percentualDisponivel: 25 - (percentualAcumulado - (percentual_acrescimo || 0))
    };
  }
  
  return {
    valido: true,
    percentualAcumulado,
    percentualDisponivel: 25 - percentualAcumulado
  };
}

// Função para reaplicar aditivo quando editado
export async function reaplicarAditivo(aditivo_id: number) {
  try {
    console.log(`🔄 Reaplicando aditivo ID: ${aditivo_id}`);
    
    // Buscar dados do aditivo
    const aditivo = await db.get(`
      SELECT * FROM aditivos_contratos WHERE id = $1
    `, [aditivo_id]);
    
    if (!aditivo) {
      throw new Error('Aditivo não encontrado');
    }
    
    // Verificar se o aditivo foi aprovado e é de quantidade
    if (!aditivo.aprovado_por || (aditivo.tipo !== 'QUANTIDADE' && aditivo.tipo !== 'MISTO')) {
      console.log(`ℹ️ Aditivo ${aditivo_id} não precisa ser reaplicado (não aprovado ou não é de quantidade)`);
      return;
    }
    
    // Usar transação
    await db.query('BEGIN');
    
    try {
      // 1. Reverter aplicação anterior
      console.log(`📤 Revertendo aplicação anterior do aditivo ${aditivo_id}`);
      
      // Buscar itens aplicados anteriormente
      const itensAnteriores = await db.query(`
        SELECT * FROM aditivos_contratos_itens WHERE aditivo_id = $1
      `, [aditivo_id]);
      
      // Reverter quantidades nos produtos
      for (const item of itensAnteriores.rows) {
        await db.query(`
          UPDATE contrato_produtos 
          SET limite = limite - $1, saldo = saldo - $2
          WHERE id = $3
        `, [item.quantidade_adicional, item.quantidade_adicional, item.contrato_produto_id]);
      }
      
      // Remover itens antigos
      await db.query(`
        DELETE FROM aditivos_contratos_itens WHERE aditivo_id = $1
      `, [aditivo_id]);
      
      // 2. Reaplicar com novos valores
      console.log(`📥 Reaplicando aditivo ${aditivo_id} com novos valores`);
      
      // Buscar itens específicos se existirem (para aditivos específicos)
      // Por enquanto, vamos assumir que é global e usar o percentual do aditivo
      await aplicarAditivoQuantidadeGlobal(aditivo_id, aditivo.percentual_acrescimo);
      
      await db.query('COMMIT');
      console.log(`✅ Aditivo ${aditivo_id} reaplicado com sucesso`);
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error: any) {
    console.error(`❌ Erro ao reaplicar aditivo ${aditivo_id}:`, error.message);
    throw error;
  }
}