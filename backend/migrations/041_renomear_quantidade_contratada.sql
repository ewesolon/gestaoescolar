-- Migração para renomear coluna quantidade_contratada para quantidade na tabela contrato_produtos

-- Renomear a coluna quantidade_contratada para quantidade
DO $$
BEGIN
    -- Verificar se a coluna quantidade_contratada existe e quantidade não existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contrato_produtos' 
        AND column_name = 'quantidade_contratada'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contrato_produtos' 
        AND column_name = 'quantidade'
    ) THEN
        -- Renomear a coluna
        ALTER TABLE contrato_produtos 
        RENAME COLUMN quantidade_contratada TO quantidade;
        
        RAISE NOTICE 'Coluna quantidade_contratada renomeada para quantidade na tabela contrato_produtos';
    ELSE
        RAISE NOTICE 'Coluna quantidade_contratada não existe ou quantidade já existe na tabela contrato_produtos';
    END IF;
END $$;