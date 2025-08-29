-- Migração: Criar tabela refeicao_produtos
-- Data: 2024-01-20
-- Descrição: Tabela para associar produtos às refeições com quantidade per capita

-- Criar tabela refeicao_produtos se não existir
CREATE TABLE IF NOT EXISTS refeicao_produtos (
    id SERIAL PRIMARY KEY,
    refeicao_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    per_capita DECIMAL(10,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_refeicao_produtos_refeicao 
        FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_refeicao_produtos_produto 
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    
    -- Evitar duplicatas
    CONSTRAINT uk_refeicao_produto UNIQUE (refeicao_id, produto_id),
    
    -- Validações
    CONSTRAINT ck_per_capita_positivo CHECK (per_capita >= 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_refeicao_produtos_refeicao_id ON refeicao_produtos(refeicao_id);
CREATE INDEX IF NOT EXISTS idx_refeicao_produtos_produto_id ON refeicao_produtos(produto_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_refeicao_produtos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_refeicao_produtos_updated_at ON refeicao_produtos;
CREATE TRIGGER trigger_update_refeicao_produtos_updated_at
    BEFORE UPDATE ON refeicao_produtos
    FOR EACH ROW
    EXECUTE FUNCTION update_refeicao_produtos_updated_at();

-- Comentários
COMMENT ON TABLE refeicao_produtos IS 'Associação entre refeições e produtos com quantidade per capita';
COMMENT ON COLUMN refeicao_produtos.per_capita IS 'Quantidade do produto por pessoa (em gramas ou unidade do produto)';
COMMENT ON COLUMN refeicao_produtos.refeicao_id IS 'ID da refeição';
COMMENT ON COLUMN refeicao_produtos.produto_id IS 'ID do produto';