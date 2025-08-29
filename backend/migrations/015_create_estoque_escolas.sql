-- Migration: Criar tabela estoque_escolas
-- Descrição: Tabela para controlar o estoque de produtos por escola

CREATE TABLE IF NOT EXISTS estoque_escolas (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade_atual DECIMAL(10,3) DEFAULT 0 NOT NULL,
    quantidade_minima DECIMAL(10,3) DEFAULT 0,
    quantidade_maxima DECIMAL(10,3) DEFAULT 0,
    data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para evitar duplicatas
    UNIQUE(escola_id, produto_id),
    
    -- Constraints para validar quantidades
    CHECK (quantidade_atual >= 0),
    CHECK (quantidade_minima >= 0),
    CHECK (quantidade_maxima >= 0),
    CHECK (quantidade_maxima >= quantidade_minima OR quantidade_maxima = 0)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_estoque_escolas_escola_id ON estoque_escolas(escola_id);
CREATE INDEX IF NOT EXISTS idx_estoque_escolas_produto_id ON estoque_escolas(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_escolas_ativo ON estoque_escolas(ativo);
CREATE INDEX IF NOT EXISTS idx_estoque_escolas_quantidade_atual ON estoque_escolas(quantidade_atual);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_estoque_escolas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.data_ultima_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_estoque_escolas_updated_at
    BEFORE UPDATE ON estoque_escolas
    FOR EACH ROW
    EXECUTE FUNCTION update_estoque_escolas_updated_at();

-- Comentários para documentação
COMMENT ON TABLE estoque_escolas IS 'Controle de estoque de produtos por escola';
COMMENT ON COLUMN estoque_escolas.escola_id IS 'ID da escola (FK)';
COMMENT ON COLUMN estoque_escolas.produto_id IS 'ID do produto (FK)';
COMMENT ON COLUMN estoque_escolas.quantidade_atual IS 'Quantidade atual em estoque';
COMMENT ON COLUMN estoque_escolas.quantidade_minima IS 'Quantidade mínima para alerta';
COMMENT ON COLUMN estoque_escolas.quantidade_maxima IS 'Quantidade máxima permitida';
COMMENT ON COLUMN estoque_escolas.data_ultima_atualizacao IS 'Data da última atualização do estoque';
COMMENT ON COLUMN estoque_escolas.observacoes IS 'Observações sobre o estoque';
COMMENT ON COLUMN estoque_escolas.ativo IS 'Se o registro está ativo';