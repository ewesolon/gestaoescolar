-- Criar view para saldos de contratos
-- Esta view calcula os saldos disponíveis de cada item de contrato

CREATE OR REPLACE VIEW view_saldo_contratos_itens AS
SELECT 
    -- Identificadores
    cp.id as item_id,
    cp.contrato_id,
    c.numero as contrato_numero,
    cp.produto_id,
    p.nome as produto_nome,
    p.descricao as produto_descricao,
    p.unidade,
    p.categoria,
    
    -- Valores do contrato
    cp.preco_unitario,
    cp.quantidade_contratada as quantidade_total,
    cp.preco_unitario * cp.quantidade_contratada as valor_total_contratado,
    
    -- Quantidades utilizadas (calculadas dos pedidos)
    COALESCE(pedidos_utilizados.quantidade_utilizada, 0) as quantidade_utilizada,
    COALESCE(pedidos_utilizados.valor_utilizado, 0) as valor_utilizado,
    
    -- Quantidades reservadas (pedidos em andamento)
    COALESCE(pedidos_reservados.quantidade_reservada, 0) as quantidade_reservada,
    COALESCE(pedidos_reservados.valor_reservado, 0) as valor_reservado,
    
    -- Saldos disponíveis
    cp.quantidade_contratada - COALESCE(pedidos_utilizados.quantidade_utilizada, 0) - COALESCE(pedidos_reservados.quantidade_reservada, 0) as quantidade_disponivel_real,
    (cp.quantidade_contratada - COALESCE(pedidos_utilizados.quantidade_utilizada, 0) - COALESCE(pedidos_reservados.quantidade_reservada, 0)) * cp.preco_unitario as valor_total_disponivel,
    
    -- Status do saldo
    CASE 
        WHEN (cp.quantidade_contratada - COALESCE(pedidos_utilizados.quantidade_utilizada, 0) - COALESCE(pedidos_reservados.quantidade_reservada, 0)) <= 0 THEN 'ESGOTADO'
        WHEN (cp.quantidade_contratada - COALESCE(pedidos_utilizados.quantidade_utilizada, 0) - COALESCE(pedidos_reservados.quantidade_reservada, 0)) <= (cp.quantidade_contratada * 0.1) THEN 'BAIXO_ESTOQUE'
        ELSE 'DISPONIVEL'
    END as status,
    
    -- Percentual utilizado
    CASE 
        WHEN cp.quantidade_contratada > 0 THEN 
            ROUND((COALESCE(pedidos_utilizados.quantidade_utilizada, 0) / cp.quantidade_contratada) * 100, 2)
        ELSE 0
    END as percentual_utilizado,
    
    -- Datas
    c.data_inicio,
    c.data_fim,
    c.status as contrato_status,
    cp.created_at,
    
    -- Informações do fornecedor (será adicionada via JOIN na query principal)
    c.fornecedor_id

FROM contrato_produtos cp
JOIN contratos c ON cp.contrato_id = c.id
JOIN produtos p ON cp.produto_id = p.id

-- Subquery para calcular quantidades utilizadas (pedidos entregues/finalizados)
LEFT JOIN (
    SELECT 
        cp_sub.id as contrato_produto_id,
        SUM(pi.quantidade) as quantidade_utilizada,
        SUM(pi.valor_total) as valor_utilizado
    FROM contrato_produtos cp_sub
    JOIN pedidos_fornecedores pf ON pf.fornecedor_id = (
        SELECT fornecedor_id FROM contratos WHERE id = cp_sub.contrato_id
    )
    JOIN pedidos_itens pi ON pi.pedido_fornecedor_id = pf.id AND pi.produto_id = cp_sub.produto_id
    JOIN pedidos ped ON ped.id = pf.pedido_id
    WHERE ped.status IN ('ENTREGUE', 'FINALIZADO', 'CONCLUIDO')
    GROUP BY cp_sub.id
) pedidos_utilizados ON pedidos_utilizados.contrato_produto_id = cp.id

-- Subquery para calcular quantidades reservadas (pedidos em andamento)
LEFT JOIN (
    SELECT 
        cp_sub.id as contrato_produto_id,
        SUM(pi.quantidade) as quantidade_reservada,
        SUM(pi.valor_total) as valor_reservado
    FROM contrato_produtos cp_sub
    JOIN pedidos_fornecedores pf ON pf.fornecedor_id = (
        SELECT fornecedor_id FROM contratos WHERE id = cp_sub.contrato_id
    )
    JOIN pedidos_itens pi ON pi.pedido_fornecedor_id = pf.id AND pi.produto_id = cp_sub.produto_id
    JOIN pedidos ped ON ped.id = pf.pedido_id
    WHERE ped.status IN ('PENDENTE', 'EM_ANDAMENTO', 'PROCESSANDO', 'APROVADO')
    GROUP BY cp_sub.id
) pedidos_reservados ON pedidos_reservados.contrato_produto_id = cp.id

WHERE c.ativo = true
AND p.ativo = true;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_view_saldo_contratos_contrato_id 
ON contrato_produtos(contrato_id);

CREATE INDEX IF NOT EXISTS idx_view_saldo_contratos_produto_id 
ON contrato_produtos(produto_id);

-- Comentários para documentação
COMMENT ON VIEW view_saldo_contratos_itens IS 'View que calcula os saldos disponíveis de cada item de contrato baseado nas quantidades utilizadas nos pedidos';