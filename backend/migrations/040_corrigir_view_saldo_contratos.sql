-- Migração para corrigir a view view_saldo_contratos_itens
-- Substituir quantidade_contratada por quantidade

-- Remover a view existente
DROP VIEW IF EXISTS view_saldo_contratos_itens;

-- Recriar a view com a coluna correta (versão simplificada)
CREATE VIEW view_saldo_contratos_itens AS
SELECT 
    -- Identificadores
    c.id as contrato_id,
    c.numero as contrato_numero,
    cp.id as contrato_produto_id,
    cp.produto_id,
    p.nome as produto_nome,
    p.unidade as produto_unidade,
    
    -- Valores do contrato
    cp.preco_unitario,
    cp.quantidade as quantidade_total,
    cp.preco_unitario * cp.quantidade as valor_total_contratado,
    
    -- Quantidades utilizadas (zeradas por enquanto)
    0 as quantidade_utilizada,
    0 as valor_utilizado,
    
    -- Quantidades reservadas (zeradas por enquanto)
    0 as quantidade_reservada,
    0 as valor_reservado,
    
    -- Saldos disponíveis (igual ao total por enquanto)
    cp.quantidade as quantidade_disponivel_real,
    cp.quantidade * cp.preco_unitario as valor_total_disponivel,
    
    -- Status do saldo
    'DISPONIVEL' as status,
    
    -- Percentual utilizado
    0 as percentual_utilizado,
    
    -- Informações do fornecedor
    f.id as fornecedor_id,
    f.nome as fornecedor_nome,
    f.cnpj as fornecedor_cnpj,
    
    -- Datas do contrato
    c.data_inicio,
    c.data_fim,
    c.status as contrato_status
    
FROM contratos c
INNER JOIN contrato_produtos cp ON c.id = cp.contrato_id
INNER JOIN produtos p ON cp.produto_id = p.id
INNER JOIN fornecedores f ON c.fornecedor_id = f.id

WHERE c.ativo = true
ORDER BY c.numero, p.nome;

-- Comentários da view
COMMENT ON VIEW view_saldo_contratos_itens IS 'View que calcula os saldos disponíveis de cada item de contrato (versão simplificada)';