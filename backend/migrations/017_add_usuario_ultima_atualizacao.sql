-- Migração para adicionar coluna usuario_ultima_atualizacao na tabela estoque_escolas

-- Adicionar a coluna usuario_ultima_atualizacao
ALTER TABLE estoque_escolas 
ADD COLUMN IF NOT EXISTS usuario_ultima_atualizacao INTEGER REFERENCES usuarios(id);

-- Comentário para documentar a coluna
COMMENT ON COLUMN estoque_escolas.usuario_ultima_atualizacao IS 'ID do usuário que fez a última atualização do estoque';

-- Atualizar o trigger para incluir a nova coluna se necessário
CREATE OR REPLACE FUNCTION update_estoque_escolas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.data_ultima_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;