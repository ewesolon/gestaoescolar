-- Migração: Adicionar constraint UNIQUE na coluna nome da tabela produtos
-- Data: 2025-01-27
-- Descrição: Adiciona constraint única para permitir ON CONFLICT na importação de produtos

-- Adicionar constraint única na coluna nome
ALTER TABLE produtos 
ADD CONSTRAINT produtos_nome_unique UNIQUE (nome);

-- Comentário
COMMENT ON CONSTRAINT produtos_nome_unique ON produtos IS 'Garante que não existam produtos com nomes duplicados';