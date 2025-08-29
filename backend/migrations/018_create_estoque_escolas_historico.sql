-- Migration: Create estoque_escolas_historico table
-- Description: Creates table to track stock movement history

CREATE TABLE IF NOT EXISTS estoque_escolas_historico (
    id SERIAL PRIMARY KEY,
    estoque_escola_id INTEGER REFERENCES estoque_escolas(id) ON DELETE CASCADE,
    escola_id INTEGER NOT NULL REFERENCES escolas(id),
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    tipo_movimentacao VARCHAR(20) NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste')),
    quantidade_anterior DECIMAL(10,3) NOT NULL DEFAULT 0,
    quantidade_movimentada DECIMAL(10,3) NOT NULL,
    quantidade_posterior DECIMAL(10,3) NOT NULL DEFAULT 0,
    motivo TEXT,
    documento_referencia TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_estoque_historico_escola_produto ON estoque_escolas_historico(escola_id, produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_historico_data ON estoque_escolas_historico(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_estoque_historico_tipo ON estoque_escolas_historico(tipo_movimentacao);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_estoque_historico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_estoque_historico_updated_at
    BEFORE UPDATE ON estoque_escolas_historico
    FOR EACH ROW
    EXECUTE FUNCTION update_estoque_historico_updated_at();-- Migration: Criar tabela estoque_escolas_historico
-- Descrição: Tabela para registrar histórico de movimentações de estoque por escola

CREATE TABLE IF NOT EXISTS estoque_escolas_historico (
    id SERIAL PRIMARY KEY,
    estoque_escola_id INTEGER REFERENCES estoque_escolas(id) ON DELETE CASCADE,
    escola_id INTEGER NOT NULL REFERENCES escolas(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
    tipo_movimentacao VARCHAR(20) NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'ajuste')),
    quantidade_anterior DECIMAL(10,3) NOT NULL DEFAULT 0,
    quantidade_movimentada DECIMAL(10,3) NOT NULL,
    quantidade_posterior DECIMAL(10,3) NOT NULL DEFAULT 0,
    motivo TEXT,
    documento_referencia VARCHAR(100),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_historico_escola_id ON estoque_escolas_historico(escola_id);
CREATE INDEX IF NOT EXISTS idx_historico_produto_id ON estoque_escolas_historico(produto_id);
CREATE INDEX IF NOT EXISTS idx_historico_data_movimentacao ON estoque_escolas_historico(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_historico_tipo_movimentacao ON estoque_escolas_historico(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_historico_usuario_id ON estoque_escolas_historico(usuario_id);

-- Índice único para prevenir movimentações duplicadas (double-click)
CREATE UNIQUE INDEX IF NOT EXISTS idx_historico_prevent_exact_duplicates 
ON estoque_escolas_historico (
    escola_id, 
    produto_id, 
    tipo_movimentacao, 
    quantidade_movimentada, 
    DATE_TRUNC('second', data_movimentacao),
    COALESCE(motivo, ''),
    usuario_id
);

-- Comentários para documentação
COMMENT ON TABLE estoque_escolas_historico IS 'Histórico de movimentações de estoque por escola';
COMMENT ON COLUMN estoque_escolas_historico.estoque_escola_id IS 'ID do registro de estoque (FK)';
COMMENT ON COLUMN estoque_escolas_historico.escola_id IS 'ID da escola (FK)';
COMMENT ON COLUMN estoque_escolas_historico.produto_id IS 'ID do produto (FK)';
COMMENT ON COLUMN estoque_escolas_historico.tipo_movimentacao IS 'Tipo: entrada, saida ou ajuste';
COMMENT ON COLUMN estoque_escolas_historico.quantidade_anterior IS 'Quantidade antes da movimentação';
COMMENT ON COLUMN estoque_escolas_historico.quantidade_movimentada IS 'Quantidade da movimentação';
COMMENT ON COLUMN estoque_escolas_historico.quantidade_posterior IS 'Quantidade após a movimentação';
COMMENT ON COLUMN estoque_escolas_historico.motivo IS 'Motivo da movimentação';
COMMENT ON COLUMN estoque_escolas_historico.documento_referencia IS 'Documento de referência (nota fiscal, etc)';
COMMENT ON COLUMN estoque_escolas_historico.usuario_id IS 'Usuário que fez a movimentação';
COMMENT ON COLUMN estoque_escolas_historico.data_movimentacao IS 'Data e hora da movimentação';