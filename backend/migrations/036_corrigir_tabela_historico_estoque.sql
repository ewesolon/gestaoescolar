-- Migração para corrigir a tabela estoque_escolas_historico
-- Adicionar colunas necessárias para o funcionamento correto

-- Adicionar colunas que estão faltando
ALTER TABLE estoque_escolas_historico 
ADD COLUMN IF NOT EXISTS escola_id INTEGER,
ADD COLUMN IF NOT EXISTS produto_id INTEGER,
ADD COLUMN IF NOT EXISTS quantidade_movimentada NUMERIC(10,3),
ADD COLUMN IF NOT EXISTS quantidade_posterior NUMERIC(10,3),
ADD COLUMN IF NOT EXISTS motivo TEXT,
ADD COLUMN IF NOT EXISTS documento_referencia VARCHAR(255),
ADD COLUMN IF NOT EXISTS usuario_id INTEGER,
ADD COLUMN IF NOT EXISTS data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Renomear colunas existentes para padronizar
ALTER TABLE estoque_escolas_historico 
RENAME COLUMN quantidade TO quantidade_movimentada_old;

ALTER TABLE estoque_escolas_historico 
RENAME COLUMN quantidade_nova TO quantidade_posterior_old;

-- Adicionar foreign keys
ALTER TABLE estoque_escolas_historico 
ADD CONSTRAINT fk_historico_escola 
FOREIGN KEY (escola_id) REFERENCES escolas(id);

ALTER TABLE estoque_escolas_historico 
ADD CONSTRAINT fk_historico_produto 
FOREIGN KEY (produto_id) REFERENCES produtos(id);

ALTER TABLE estoque_escolas_historico 
ADD CONSTRAINT fk_historico_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_escola_produto 
ON estoque_escolas_historico(escola_id, produto_id);

CREATE INDEX IF NOT EXISTS idx_historico_data 
ON estoque_escolas_historico(data_movimentacao);

-- Comentários para documentação
COMMENT ON TABLE estoque_escolas_historico IS 'Histórico de movimentações do estoque das escolas';
COMMENT ON COLUMN estoque_escolas_historico.escola_id IS 'ID da escola';
COMMENT ON COLUMN estoque_escolas_historico.produto_id IS 'ID do produto';
COMMENT ON COLUMN estoque_escolas_historico.tipo_movimentacao IS 'Tipo: entrada, saida, ajuste';
COMMENT ON COLUMN estoque_escolas_historico.quantidade_anterior IS 'Quantidade antes da movimentação';
COMMENT ON COLUMN estoque_escolas_historico.quantidade_movimentada IS 'Quantidade da movimentação';
COMMENT ON COLUMN estoque_escolas_historico.quantidade_posterior IS 'Quantidade após a movimentação';
COMMENT ON COLUMN estoque_escolas_historico.motivo IS 'Motivo da movimentação';
COMMENT ON COLUMN estoque_escolas_historico.documento_referencia IS 'Documento de referência';
COMMENT ON COLUMN estoque_escolas_historico.usuario_id IS 'Usuário que fez a movimentação';
COMMENT ON COLUMN estoque_escolas_historico.data_movimentacao IS 'Data e hora da movimentação';