-- Migração 030: Adicionar colunas faltantes na tabela cardápios

-- Adicionar coluna modalidade_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cardapios' AND column_name = 'modalidade_id') THEN
        ALTER TABLE cardapios ADD COLUMN modalidade_id INTEGER REFERENCES modalidades(id);
    END IF;
END $$;

-- Adicionar coluna descricao se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cardapios' AND column_name = 'descricao') THEN
        ALTER TABLE cardapios ADD COLUMN descricao TEXT;
    END IF;
END $$;

-- Adicionar coluna updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cardapios' AND column_name = 'updated_at') THEN
        ALTER TABLE cardapios ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Adicionar coluna periodo_dias se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cardapios' AND column_name = 'periodo_dias') THEN
        ALTER TABLE cardapios ADD COLUMN periodo_dias INTEGER DEFAULT 30;
    END IF;
END $$;

-- Criar tabela cardapio_refeicoes se não existir
CREATE TABLE IF NOT EXISTS cardapio_refeicoes (
    id SERIAL PRIMARY KEY,
    cardapio_id INTEGER REFERENCES cardapios(id) ON DELETE CASCADE,
    refeicao_id INTEGER REFERENCES refeicoes(id) ON DELETE CASCADE,
    frequencia_mensal INTEGER DEFAULT 20,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cardapio_id, refeicao_id)
);

-- Criar trigger para atualizar updated_at na tabela cardapios
CREATE OR REPLACE FUNCTION update_cardapios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_cardapios_updated_at') THEN
        CREATE TRIGGER trigger_cardapios_updated_at
            BEFORE UPDATE ON cardapios
            FOR EACH ROW
            EXECUTE FUNCTION update_cardapios_updated_at();
    END IF;
END $$;

-- Migração 030 concluída