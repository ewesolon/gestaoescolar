-- Adicionar constraints UNIQUE necessárias para ON CONFLICT

-- Tabela escolas: adicionar UNIQUE constraint no nome
ALTER TABLE escolas 
ADD CONSTRAINT escolas_nome_unique UNIQUE (nome);

-- Tabela produtos: adicionar UNIQUE constraint no nome (se não existir)
ALTER TABLE produtos 
ADD CONSTRAINT produtos_nome_unique UNIQUE (nome);

-- Comentários para documentação
COMMENT ON CONSTRAINT escolas_nome_unique ON escolas IS 'Garante que não existam escolas com nomes duplicados';
COMMENT ON CONSTRAINT produtos_nome_unique ON produtos IS 'Garante que não existam produtos com nomes duplicados';