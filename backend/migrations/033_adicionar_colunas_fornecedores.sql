-- Adicionar colunas faltantes na tabela fornecedores

ALTER TABLE fornecedores 
ADD COLUMN IF NOT EXISTS cidade VARCHAR(100);

ALTER TABLE fornecedores 
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

ALTER TABLE fornecedores 
ADD COLUMN IF NOT EXISTS cep VARCHAR(10);

-- Comentários para documentação
COMMENT ON COLUMN fornecedores.cidade IS 'Cidade do fornecedor';
COMMENT ON COLUMN fornecedores.estado IS 'Estado do fornecedor (sigla UF)';
COMMENT ON COLUMN fornecedores.cep IS 'CEP do fornecedor';