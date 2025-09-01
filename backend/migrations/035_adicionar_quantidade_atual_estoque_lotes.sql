-- Migração 035: Adicionar colunas faltantes na tabela estoque_lotes
-- Data: 2025-09-01
-- Descrição: Adicionar quantidade_atual, quantidade_inicial e outras colunas necessárias

-- Adicionar coluna quantidade_atual na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'quantidade_atual') THEN
        ALTER TABLE estoque_lotes ADD COLUMN quantidade_atual DECIMAL(10,3) DEFAULT 0;
        -- Copiar valor de quantidade para quantidade_atual
        UPDATE estoque_lotes SET quantidade_atual = quantidade WHERE quantidade_atual IS NULL;
    END IF;
END $$;

-- Adicionar coluna quantidade_inicial na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'quantidade_inicial') THEN
        ALTER TABLE estoque_lotes ADD COLUMN quantidade_inicial DECIMAL(10,3) DEFAULT 0;
        -- Copiar valor de quantidade para quantidade_inicial
        UPDATE estoque_lotes SET quantidade_inicial = quantidade WHERE quantidade_inicial IS NULL;
    END IF;
END $$;

-- Adicionar coluna data_fabricacao na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'data_fabricacao') THEN
        ALTER TABLE estoque_lotes ADD COLUMN data_fabricacao DATE;
    END IF;
END $$;

-- Adicionar coluna fornecedor_id na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'fornecedor_id') THEN
        ALTER TABLE estoque_lotes ADD COLUMN fornecedor_id INTEGER REFERENCES fornecedores(id);
    END IF;
END $$;

-- Adicionar coluna recebimento_id na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'recebimento_id') THEN
        ALTER TABLE estoque_lotes ADD COLUMN recebimento_id INTEGER;
    END IF;
END $$;

-- Adicionar coluna observacoes na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'observacoes') THEN
        ALTER TABLE estoque_lotes ADD COLUMN observacoes TEXT;
    END IF;
END $$;

-- Adicionar coluna updated_at na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'updated_at') THEN
        ALTER TABLE estoque_lotes ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_estoque_lotes_quantidade_atual ON estoque_lotes(quantidade_atual);
CREATE INDEX IF NOT EXISTS idx_estoque_lotes_status ON estoque_lotes(status);
CREATE INDEX IF NOT EXISTS idx_estoque_lotes_data_validade ON estoque_lotes(data_validade);
CREATE INDEX IF NOT EXISTS idx_estoque_lotes_fornecedor_id ON estoque_lotes(fornecedor_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_estoque_lotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_estoque_lotes_updated_at ON estoque_lotes;
CREATE TRIGGER trigger_update_estoque_lotes_updated_at
    BEFORE UPDATE ON estoque_lotes
    FOR EACH ROW
    EXECUTE FUNCTION update_estoque_lotes_updated_at();