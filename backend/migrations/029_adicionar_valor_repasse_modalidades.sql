-- Migração 029: Adicionar coluna valor_repasse na tabela modalidades

-- Adicionar coluna valor_repasse se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modalidades' AND column_name = 'valor_repasse') THEN
        ALTER TABLE modalidades ADD COLUMN valor_repasse DECIMAL(10,2) DEFAULT 0.00;
    END IF;
END $$;

-- Atualizar valores padrão para as modalidades existentes
UPDATE modalidades SET valor_repasse = 0.30 WHERE nome = 'Educação Infantil' AND valor_repasse = 0;
UPDATE modalidades SET valor_repasse = 0.25 WHERE nome = 'Ensino Fundamental I' AND valor_repasse = 0;
UPDATE modalidades SET valor_repasse = 0.20 WHERE nome = 'Ensino Fundamental II' AND valor_repasse = 0;
UPDATE modalidades SET valor_repasse = 0.15 WHERE nome = 'Ensino Médio' AND valor_repasse = 0;

-- Migração 029 concluída