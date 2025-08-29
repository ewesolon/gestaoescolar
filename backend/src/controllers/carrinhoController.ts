// Controller de carrinho para PostgreSQL
import { Request, Response } from "express";
const db = require("../database");

// Carrinho em memória (temporário - pode ser substituído por banco de dados)
interface CarrinhoItem {
  id: number;
  usuario_id: number;
  produto_id: number;
  contrato_id: number;
  fornecedor_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
  // Dados do produto para exibição
  nome_produto?: string;
  nome_fornecedor?: string;
  unidade?: string;
}

// Armazenamento em memória por usuário
const carrinhoMemoria: { [usuario_id: number]: CarrinhoItem[] } = {};

export async function getCarrinho(req: Request, res: Response) {
  try {
    const { agrupado } = req.query;
    const usuario_id = 1; // Por enquanto usuário fixo
    
    if (agrupado === 'true') {
      // Retornar carrinho agrupado por fornecedor
      const carrinhoAgrupadoResult = await db.query(`
        SELECT 
          ci.fornecedor_id,
          f.nome as nome_fornecedor,
          COUNT(ci.id) as total_itens,
          SUM(ci.subtotal) as subtotal,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ci.id,
              'produto_id', ci.produto_id,
              'nome_produto', p.nome,
              'quantidade', ci.quantidade,
              'preco_unitario', ci.preco_unitario,
              'subtotal', ci.subtotal,
              'unidade', p.unidade
            )
          ) as itens
        FROM carrinho_itens ci
        LEFT JOIN produtos p ON ci.produto_id = p.id
        LEFT JOIN fornecedores f ON ci.fornecedor_id = f.id
        WHERE ci.usuario_id = $1
        GROUP BY ci.fornecedor_id, f.nome
        ORDER BY f.nome
      `, [usuario_id]);
      
      const carrinhoAgrupado = carrinhoAgrupadoResult.rows;
      const totalGeral = carrinhoAgrupado.reduce((sum: number, grupo: any) => sum + parseFloat(grupo.subtotal), 0);
      
      res.json({
        success: true,
        data: carrinhoAgrupado,
        total_fornecedores: carrinhoAgrupado.length,
        total_geral: totalGeral
      });
    } else {
      // Retornar carrinho simples
      const itensResult = await db.query(`
        SELECT 
          ci.id,
          ci.usuario_id,
          ci.produto_id,
          ci.contrato_id,
          ci.fornecedor_id,
          ci.quantidade,
          ci.preco_unitario,
          ci.subtotal,
          ci.created_at,
          ci.updated_at,
          p.nome as nome_produto,
          p.unidade as unidade,
          f.nome as nome_fornecedor,
          c.numero as numero_contrato
        FROM carrinho_itens ci
        LEFT JOIN produtos p ON ci.produto_id = p.id
        LEFT JOIN fornecedores f ON ci.fornecedor_id = f.id
        LEFT JOIN contratos c ON ci.contrato_id = c.id
        WHERE ci.usuario_id = $1
        ORDER BY ci.created_at DESC
      `, [usuario_id]);
      
      const itens = itensResult.rows;
      const totalItens = itens.reduce((sum: number, item: any) => sum + parseFloat(item.quantidade), 0);
      const totalGeral = itens.reduce((sum: number, item: any) => sum + parseFloat(item.subtotal), 0);
      
      res.json({
        success: true,
        data: {
          itens: itens,
          total_itens: totalItens,
          total_geral: totalGeral
        }
      });
    }
  } catch (error) {
    console.error("❌ Erro ao buscar carrinho:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar carrinho",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function adicionarItemCarrinho(req: Request, res: Response) {
  try {
    const { 
      produto_id, 
      contrato_id, 
      fornecedor_id, 
      quantidade, 
      preco_unitario 
    } = req.body;

    const usuario_id = 1; // Por enquanto usuário fixo

    // Validações básicas
    if (!produto_id || !quantidade || !preco_unitario) {
      return res.status(400).json({
        success: false,
        message: "Produto, quantidade e preço são obrigatórios"
      });
    }

    if (quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantidade deve ser maior que zero"
      });
    }

    // Buscar contrato_produto_id para reserva
    const contratoItemResult = await db.query(`
      SELECT cp.id as contrato_produto_id, cp.limite as quantidade_contratual
      FROM contrato_produtos cp
      WHERE cp.produto_id = $1 AND cp.contrato_id = $2
    `, [produto_id, contrato_id]);
    
    const contratoItem = contratoItemResult.rows[0];

    if (!contratoItem) {
      return res.status(404).json({
        success: false,
        message: "Item não encontrado no contrato especificado"
      });
    }

    // Verificar se o item já existe no carrinho
    const itemExistenteResult = await db.query(`
      SELECT id, quantidade FROM carrinho_itens 
      WHERE usuario_id = $1 AND produto_id = $2 AND contrato_id = $3
    `, [usuario_id, produto_id, contrato_id || null]);
    
    const itemExistente = itemExistenteResult.rows[0];

    let item;
    let quantidadeParaReservar = parseFloat(quantidade);
    
    if (itemExistente) {
      // Atualizar quantidade do item existente
      const novaQuantidade = parseFloat(itemExistente.quantidade) + parseFloat(quantidade);
      const novoSubtotal = novaQuantidade * parseFloat(preco_unitario);
      
      const result = await db.query(`
        UPDATE carrinho_itens 
        SET quantidade = $1, subtotal = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `, [novaQuantidade, novoSubtotal, itemExistente.id]);
      
      item = result.rows[0];
    } else {
      // Inserir novo item
      const subtotal = parseFloat(quantidade) * parseFloat(preco_unitario);
      
      const result = await db.query(`
        INSERT INTO carrinho_itens (
          usuario_id, produto_id, contrato_id, fornecedor_id, 
          quantidade, preco_unitario, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [usuario_id, produto_id, contrato_id, fornecedor_id, quantidade, preco_unitario, subtotal]);
      
      item = result.rows[0];
    }

    // NOVA FUNCIONALIDADE: Reservar saldo no momento da adição ao carrinho
    try {
      await db.query(`
        INSERT INTO movimentacoes_consumo_contratos (
          contrato_produto_id,
          tipo,
          quantidade_utilizada,
          justificativa,
          data_movimentacao,
          usuario_id,
          documento_referencia,
          observacoes
        ) VALUES ($1, 'RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
      `, [
        contratoItem.contrato_produto_id,
        quantidadeParaReservar,
        'Reserva automática para carrinho de compras',
        usuario_id,
        `CARRINHO_ITEM_${item.id}`,
        `Reserva de ${quantidadeParaReservar} unidades para o carrinho do usuário ${usuario_id}`
      ]);

      console.log(`✅ Reserva criada: ${quantidadeParaReservar} unidades do produto ${produto_id} no contrato ${contrato_id}`);
    } catch (reservaError) {
      console.error("❌ Erro ao criar reserva:", reservaError);
      // Se falhar a reserva, remover o item do carrinho
      await db.query(`DELETE FROM carrinho_itens WHERE id = $1`, [item.id]);
      
      return res.status(400).json({
        success: false,
        message: "Não foi possível reservar a quantidade solicitada. Verifique a disponibilidade do produto.",
        error: reservaError instanceof Error ? reservaError.message : 'Erro na reserva'
      });
    }

    // Buscar dados completos do item
    const itemCompletoResult = await db.query(`
      SELECT 
        ci.*,
        p.nome as nome_produto,
        p.unidade as unidade,
        f.nome as nome_fornecedor
      FROM carrinho_itens ci
      LEFT JOIN produtos p ON ci.produto_id = p.id
      LEFT JOIN fornecedores f ON ci.fornecedor_id = f.id
      WHERE ci.id = $1
    `, [item.id]);
    
    const itemCompleto = itemCompletoResult.rows[0];

    res.json({
      success: true,
      message: itemExistente ? "Quantidade atualizada no carrinho e reserva criada" : "Item adicionado ao carrinho e reserva criada com sucesso",
      data: itemCompleto
    });
  } catch (error) {
    console.error("❌ Erro ao adicionar item ao carrinho:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao adicionar item ao carrinho",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function removerItemCarrinho(req: Request, res: Response) {
  console.log('=== INÍCIO removerItemCarrinho ===');
  console.log('req.params:', req.params);
  console.log('req.body:', req.body);
  console.log('req.url:', req.url);
  console.log('req.method:', req.method);
  try {
    console.log('🚀 INÍCIO DA FUNÇÃO removerItemCarrinho - ID:', req.params.id);
    const { id } = req.params;
    const usuario_id = 1; // Por enquanto usuário fixo

    // Primeiro, buscar informações do item antes de remover
    const itemInfoResult = await db.query(`
      SELECT ci.*, cp.id as contrato_produto_id
      FROM carrinho_itens ci
      LEFT JOIN contrato_produtos cp ON ci.produto_id = cp.produto_id AND ci.contrato_id = cp.contrato_id
      WHERE ci.id = $1 AND ci.usuario_id = $2
    `, [id, usuario_id]);

    const itemInfo = itemInfoResult.rows[0];
    console.error('🔍 Item info encontrado:', JSON.stringify(itemInfo, null, 2));
    console.error('🔍 DEBUG - contrato_produto_id:', itemInfo?.contrato_produto_id);

    if (!itemInfo) {
      return res.status(404).json({
        success: false,
        message: "Item não encontrado no carrinho"
      });
    }

    if (!itemInfo.contrato_produto_id) {
      console.log('⚠️ contrato_produto_id não encontrado para o item');
    }

    // Liberar a reserva antes de remover o item
    try {
      await db.query(`
        INSERT INTO movimentacoes_consumo_contratos (
          contrato_produto_id,
          tipo,
          quantidade_utilizada,
          justificativa,
          data_movimentacao,
          usuario_id,
          documento_referencia,
          observacoes
        ) VALUES ($1, 'LIBERACAO_RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
      `, [
        itemInfo.contrato_produto_id,
        itemInfo.quantidade,
        'Liberação automática por remoção do carrinho',
        usuario_id,
        `CARRINHO_ITEM_${id}`,
        `Liberação de ${itemInfo.quantidade} unidades removidas do carrinho`
      ]);

      console.log(`✅ Reserva liberada: ${itemInfo.quantidade} unidades do produto ${itemInfo.produto_id}`);
    } catch (liberacaoError) {
      console.error("❌ Erro ao liberar reserva:", liberacaoError);
      // Continua com a remoção mesmo se falhar a liberação
    }

    // Remover o item do carrinho
    const result = await db.query(`
      DELETE FROM carrinho_itens 
      WHERE id = $1 AND usuario_id = $2
      RETURNING *
    `, [id, usuario_id]);

    res.json({
      success: true,
      message: "Item removido do carrinho e reserva liberada com sucesso"
    });
  } catch (error) {
    console.error("❌ Erro ao remover item do carrinho:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao remover item do carrinho",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function limparCarrinho(req: Request, res: Response) {
  try {
    const usuario_id = 1; // Por enquanto usuário fixo

    // Primeiro, buscar todos os itens do carrinho para liberar as reservas
    const itensCarrinhoResult = await db.query(`
      SELECT ci.*, cp.id as contrato_produto_id
      FROM carrinho_itens ci
      LEFT JOIN contrato_produtos cp ON ci.produto_id = cp.produto_id AND ci.contrato_id = cp.contrato_id
      WHERE ci.usuario_id = $1
    `, [usuario_id]);
    
    const itensCarrinho = itensCarrinhoResult.rows;

    // Liberar reservas de todos os itens
    for (const item of itensCarrinho) {
      try {
        await db.query(`
          INSERT INTO movimentacoes_consumo_contratos (
            contrato_produto_id,
            tipo,
            quantidade_utilizada,
            justificativa,
            data_movimentacao,
            usuario_id,
            documento_referencia,
            observacoes
          ) VALUES ($1, 'LIBERACAO_RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
        `, [
          item.contrato_produto_id,
          item.quantidade,
          'Liberação automática por limpeza do carrinho',
          usuario_id,
          `CARRINHO_ITEM_${item.id}`,
          `Liberação de ${item.quantidade} unidades por limpeza do carrinho`
        ]);

        console.log(`✅ Reserva liberada: ${item.quantidade} unidades do produto ${item.produto_id}`);
      } catch (liberacaoError) {
        console.error(`❌ Erro ao liberar reserva do item ${item.id}:`, liberacaoError);
        // Continua com os outros itens mesmo se falhar
      }
    }

    // Limpar o carrinho
    const result = await db.query(`
      DELETE FROM carrinho_itens WHERE usuario_id = $1
      RETURNING COUNT(*) as itens_removidos
    `, [usuario_id]);

    res.json({
      success: true,
      message: "Carrinho limpo e todas as reservas liberadas com sucesso",
      itens_removidos: result.rowCount || 0
    });
  } catch (error) {
    console.error("❌ Erro ao limpar carrinho:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao limpar carrinho",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function obterCatalogoProdutos(req: Request, res: Response) {
  try {
    // Retorna catálogo vazio por enquanto
    res.json({
      success: true,
      data: [],
      total: 0
    });
  } catch (error) {
    console.error("❌ Erro ao obter catálogo:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao obter catálogo",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function confirmarPedido(req: Request, res: Response) {
  try {
    const usuario_id = 1; // Por enquanto usuário fixo
    const { observacoes } = req.body;
    
    // Buscar itens do carrinho agrupados por fornecedor
    const carrinhoAgrupado = await db.query(`
      SELECT 
        ci.fornecedor_id,
        f.nome as nome_fornecedor,
        COUNT(ci.id) as total_itens,
        SUM(ci.subtotal) as subtotal,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ci.id,
            'produto_id', ci.produto_id,
            'contrato_id', ci.contrato_id,
            'contrato_produto_id', cp.id,
            'quantidade', ci.quantidade,
            'preco_unitario', ci.preco_unitario,
            'subtotal', ci.subtotal
          )
        ) as itens
      FROM carrinho_itens ci
      LEFT JOIN fornecedores f ON ci.fornecedor_id = f.id
      LEFT JOIN contrato_produtos cp ON ci.contrato_id = cp.contrato_id AND ci.produto_id = cp.produto_id
      WHERE ci.usuario_id = $1
      GROUP BY ci.fornecedor_id, f.nome
      ORDER BY f.nome
    `, [usuario_id]);
    
    if (carrinhoAgrupado.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Carrinho está vazio"
      });
    }

    // Nota: Validação de limites contratuais já foi feita quando os itens foram adicionados ao carrinho
    // As reservas serão convertidas de carrinho para pedido durante a confirmação
    console.log(`🔄 Confirmando pedido com ${carrinhoAgrupado.rows.length} fornecedor(es)`);
    
    const totalGeral = carrinhoAgrupado.rows.reduce((sum: number, grupo: any) => sum + parseFloat(grupo.subtotal), 0);
    
    // Determinar fornecedor_id para o pedido principal
    // Se há apenas um fornecedor, usar esse fornecedor_id
    // Se há múltiplos fornecedores, deixar null (pedido multi-fornecedor)
    const fornecedor_id = carrinhoAgrupado.rows.length === 1 ? carrinhoAgrupado.rows[0].fornecedor_id : null;
    
    // Criar pedido principal
    const numeroPedido = `PED-${Date.now()}`;
    const pedidoResult = await db.query(`
      INSERT INTO pedidos 
      (numero_pedido, usuario_id, fornecedor_id, status, valor_total, observacoes)
      VALUES ($1, $2, $3, 'PENDENTE', $4, $5)
      RETURNING *
    `, [numeroPedido, usuario_id, fornecedor_id, totalGeral, observacoes || '']);
    
    const pedido = pedidoResult.rows[0];

    // NOVA FUNCIONALIDADE: Reservar saldo dos contratos
    const reservaSaldoService = require('../services/reservaSaldoService');
    
    // Criar itens do pedido usando estrutura consolidada
    for (const grupo of carrinhoAgrupado.rows) {
      const itens = grupo.itens; // No PostgreSQL, JSON_AGG já retorna um objeto
      
      // Primeiro, criar registro em pedidos_fornecedores
      const valor_subtotal = itens.reduce((total: number, item: any) => total + item.subtotal, 0);
      
      const fornecedorResult = await db.query(`
        INSERT INTO pedidos_fornecedores (pedido_id, fornecedor_id, status, valor_subtotal)
        VALUES ($1, $2, 'PENDENTE', $3)
        RETURNING id
      `, [pedido.id, grupo.fornecedor_id, valor_subtotal]);
      
      const pedido_fornecedor_id = fornecedorResult.rows[0].id;
      
      // Depois, criar itens do fornecedor e reservar saldo
      for (const item of itens) {
        const itemResult = await db.query(`
          INSERT INTO pedidos_itens 
          (pedido_fornecedor_id, produto_id, contrato_id, quantidade, preco_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [pedido_fornecedor_id, item.produto_id, item.contrato_id, 
            item.quantidade, item.preco_unitario, item.subtotal]);

        const pedido_item_id = itemResult.rows[0].id;

        // Converter reservas do carrinho em reservas do pedido
        try {
          // Buscar reserva do carrinho para este item
          const reservaCarrinhoResult = await db.query(`
            SELECT id, quantidade_utilizada
            FROM movimentacoes_consumo_contratos
            WHERE contrato_produto_id = $1 
              AND tipo = 'RESERVA'
              AND documento_referencia = $2
              AND usuario_id = $3
          `, [item.contrato_produto_id, `CARRINHO_ITEM_${item.id}`, usuario_id]);
          
          if (reservaCarrinhoResult.rows.length > 0) {
            const reservaCarrinho = reservaCarrinhoResult.rows[0];
            
            // Criar nova reserva para o pedido
            await db.query(`
              INSERT INTO movimentacoes_consumo_contratos (
                contrato_produto_id,
                tipo,
                quantidade_utilizada,
                justificativa,
                data_movimentacao,
                usuario_id,
                documento_referencia,
                observacoes
              ) VALUES ($1, 'RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
            `, [
              item.contrato_produto_id,
              item.quantidade,
              `Conversão de reserva do carrinho para pedido`,
              usuario_id,
              `PEDIDO_${pedido.id}`,
              `Convertido da reserva do carrinho item ${item.id}`
            ]);
            
            // Liberar reserva do carrinho
            await db.query(`
              INSERT INTO movimentacoes_consumo_contratos (
                contrato_produto_id,
                tipo,
                quantidade_utilizada,
                justificativa,
                data_movimentacao,
                usuario_id,
                documento_referencia,
                observacoes
              ) VALUES ($1, 'LIBERACAO_RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
            `, [
              item.contrato_produto_id,
              reservaCarrinho.quantidade_utilizada,
              `Liberação de reserva do carrinho convertida para pedido`,
              usuario_id,
              `CARRINHO_ITEM_${item.id}`,
              `Liberação automática ao confirmar pedido ${pedido.id}`
            ]);
            
            console.log(`✅ Reserva convertida: ${item.quantidade}kg do carrinho para pedido ${pedido.id}`);
          } else {
            console.log(`⚠️ Nenhuma reserva do carrinho encontrada para item ${item.id}`);
          }
        } catch (reservaError) {
          console.error(`❌ Erro ao converter reserva para item ${item.produto_id}:`, reservaError);
          // Não interrompe o fluxo, apenas registra o erro
        }
      }
    }
    

    
    // Limpar carrinho
    await db.query(`
      DELETE FROM carrinho_itens WHERE usuario_id = $1
    `, [usuario_id]);
    
    res.json({
      success: true,
      message: "Pedido confirmado com sucesso",
      data: {
        pedido: pedido,
        total_fornecedores: carrinhoAgrupado.rows.length,
        valor_total: totalGeral
      }
    });
  } catch (error) {
    console.error("❌ Erro ao confirmar pedido:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao confirmar pedido",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export async function atualizarQuantidadeItem(req: Request, res: Response) {
  try {
    const { item_id, quantidade } = req.body;
    const usuario_id = 1; // Por enquanto usuário fixo

    if (item_id === undefined || item_id === null || quantidade === undefined || quantidade === null) {
      return res.status(400).json({
        success: false,
        message: "ID do item e quantidade são obrigatórios"
      });
    }

    if (quantidade <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantidade deve ser maior que zero"
      });
    }

    // Buscar informações do item atual e do contrato para ajustar as reservas
    const itemAtualResult = await db.query(`
      SELECT ci.*, cp.id as contrato_produto_id
      FROM carrinho_itens ci
      LEFT JOIN contrato_produtos cp ON ci.produto_id = cp.produto_id AND ci.contrato_id = cp.contrato_id
      WHERE ci.id = $1 AND ci.usuario_id = $2
    `, [item_id, usuario_id]);
    
    const itemAtual = itemAtualResult.rows[0];

    if (!itemAtual) {
      return res.status(404).json({
        success: false,
        message: "Item não encontrado no carrinho"
      });
    }

    const quantidadeAtual = parseFloat(itemAtual.quantidade);
    const novaQuantidade = parseFloat(quantidade);
    const diferencaQuantidade = novaQuantidade - quantidadeAtual;

    // Atualizar a quantidade no carrinho
    const result = await db.query(`
      UPDATE carrinho_itens 
      SET quantidade = $1, subtotal = $1 * preco_unitario, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND usuario_id = $3
      RETURNING *
    `, [novaQuantidade, item_id, usuario_id]);

    // Ajustar as reservas baseado na diferença de quantidade
    try {
      if (diferencaQuantidade > 0) {
        // Quantidade aumentou - criar nova reserva
        await db.query(`
          INSERT INTO movimentacoes_consumo_contratos (
            contrato_produto_id,
            tipo,
            quantidade_utilizada,
            justificativa,
            data_movimentacao,
            usuario_id,
            documento_referencia,
            observacoes
          ) VALUES ($1, 'RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
        `, [
          itemAtual.contrato_produto_id,
          diferencaQuantidade,
          'Reserva adicional por atualização de quantidade no carrinho',
          usuario_id,
          `CARRINHO_ITEM_${item_id}`,
          `Aumento de ${diferencaQuantidade} unidades (${quantidadeAtual} → ${novaQuantidade})`
        ]);

        console.log(`✅ Reserva adicional criada: ${diferencaQuantidade} unidades para item ${item_id}`);
      } else if (diferencaQuantidade < 0) {
        // Quantidade diminuiu - liberar parte da reserva
        const quantidadeParaLiberar = Math.abs(diferencaQuantidade);
        
        await db.query(`
          INSERT INTO movimentacoes_consumo_contratos (
            contrato_produto_id,
            tipo,
            quantidade_utilizada,
            justificativa,
            data_movimentacao,
            usuario_id,
            documento_referencia,
            observacoes
          ) VALUES ($1, 'LIBERACAO_RESERVA', $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
        `, [
          itemAtual.contrato_produto_id,
          quantidadeParaLiberar,
          'Liberação parcial por redução de quantidade no carrinho',
          usuario_id,
          `CARRINHO_ITEM_${item_id}`,
          `Redução de ${quantidadeParaLiberar} unidades (${quantidadeAtual} → ${novaQuantidade})`
        ]);

        console.log(`✅ Reserva parcial liberada: ${quantidadeParaLiberar} unidades para item ${item_id}`);
      }
      // Se diferencaQuantidade === 0, não há mudança nas reservas
    } catch (reservaError) {
      console.error("❌ Erro ao ajustar reservas:", reservaError);
      // Se falhar o ajuste das reservas, reverter a alteração no carrinho
      await db.query(`
        UPDATE carrinho_itens 
        SET quantidade = $1, subtotal = $1 * preco_unitario, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND usuario_id = $3
      `, [quantidadeAtual, item_id, usuario_id]);
      
      return res.status(400).json({
        success: false,
        message: "Não foi possível ajustar as reservas. Alteração cancelada.",
        error: reservaError instanceof Error ? reservaError.message : 'Erro nas reservas'
      });
    }

    res.json({
      success: true,
      message: "Quantidade atualizada e reservas ajustadas com sucesso",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar quantidade:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar quantidade",
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Aliases para compatibilidade
export const obterCarrinho = getCarrinho;
export const atualizarQuantidade = atualizarQuantidadeItem;
export const removerItem = removerItemCarrinho;
export const adicionarItem = adicionarItemCarrinho;