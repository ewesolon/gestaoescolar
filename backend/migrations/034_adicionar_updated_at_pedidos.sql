-- Adicionar coluna updated_at na tabela pedidos

ALTER TABLE pedidos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Comentário para documentação
COMMENT ON COLUMN pedidos.updated_at IS 'Data e hora da última atualização do pedido';