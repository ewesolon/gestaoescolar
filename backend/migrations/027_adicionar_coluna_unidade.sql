-- Migração 027: Adicionar coluna unidade na tabela produtos

-- Adicionar coluna unidade se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'unidade') THEN
        ALTER TABLE produtos ADD COLUMN unidade VARCHAR(20);
    END IF;
END $$;

-- Copiar dados da coluna unidade_medida para unidade
UPDATE produtos SET unidade = unidade_medida WHERE unidade IS NULL;

-- Migração 027 concluída