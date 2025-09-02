-- Migração para adicionar coluna quantidade_contratada na tabela contrato_produtos
-- se ela não existir

-- Verificar se a coluna existe e adicionar se necessário
DO $$
BEGIN
    -- Verificar se a coluna quantidade_contratada existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contrato_produtos' 
        AND column_name = 'quantidade_contratada'
    ) THEN
        -- Adicionar a coluna quantidade_contratada
        ALTER TABLE contrato_produtos 
        ADD COLUMN quantidade_contratada DECIMAL(10,3) DEFAULT 0;
        
        RAISE NOTICE 'Coluna quantidade_contratada adicionada à tabela contrato_produtos';
    ELSE
        RAISE NOTICE 'Coluna quantidade_contratada já existe na tabela contrato_produtos';
    END IF;
    
    -- Verificar se a coluna preco_unitario existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contrato_produtos' 
        AND column_name = 'preco_unitario'
    ) THEN
        -- Adicionar a coluna preco_unitario
        ALTER TABLE contrato_produtos 
        ADD COLUMN preco_unitario DECIMAL(10,2) DEFAULT 0;
        
        RAISE NOTICE 'Coluna preco_unitario adicionada à tabela contrato_produtos';
    ELSE
        RAISE NOTICE 'Coluna preco_unitario já existe na tabela contrato_produtos';
    END IF;
END $$;