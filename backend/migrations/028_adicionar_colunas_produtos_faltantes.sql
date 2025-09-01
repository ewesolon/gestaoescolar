-- Migração 028: Adicionar colunas faltantes na tabela produtos

-- Adicionar coluna peso se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'peso') THEN
        ALTER TABLE produtos ADD COLUMN peso DECIMAL(10,3);
    END IF;
END $$;

-- Adicionar coluna validade_minima se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'validade_minima') THEN
        ALTER TABLE produtos ADD COLUMN validade_minima INTEGER;
    END IF;
END $$;

-- Adicionar coluna estoque_minimo se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'estoque_minimo') THEN
        ALTER TABLE produtos ADD COLUMN estoque_minimo DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Adicionar coluna fator_divisao se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'fator_divisao') THEN
        ALTER TABLE produtos ADD COLUMN fator_divisao DECIMAL(10,2) DEFAULT 1;
    END IF;
END $$;

-- Adicionar coluna preco_referencia se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'preco_referencia') THEN
        ALTER TABLE produtos ADD COLUMN preco_referencia DECIMAL(10,2);
    END IF;
END $$;

-- Adicionar coluna imagem_url se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'imagem_url') THEN
        ALTER TABLE produtos ADD COLUMN imagem_url TEXT;
    END IF;
END $$;

-- Adicionar coluna tipo_processamento se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'tipo_processamento') THEN
        ALTER TABLE produtos ADD COLUMN tipo_processamento VARCHAR(50);
    END IF;
END $$;

-- Adicionar coluna perecivel se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'produtos' AND column_name = 'perecivel') THEN
        ALTER TABLE produtos ADD COLUMN perecivel BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Migração 028 concluída