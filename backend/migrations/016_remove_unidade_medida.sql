-- Migração para remover a coluna unidade_medida da tabela produtos
-- Mantendo apenas a coluna unidade

-- Primeiro, vamos verificar se há dados em unidade_medida que não estão em unidade
-- e copiar se necessário
UPDATE produtos 
SET unidade = COALESCE(NULLIF(unidade, ''), unidade_medida, 'UN')
WHERE unidade IS NULL OR unidade = '';

-- Agora podemos remover a coluna unidade_medida
ALTER TABLE produtos DROP COLUMN IF EXISTS unidade_medida;

-- Garantir que a coluna unidade não seja nula
ALTER TABLE produtos ALTER COLUMN unidade SET NOT NULL;

-- Adicionar um valor padrão se não existir
ALTER TABLE produtos ALTER COLUMN unidade SET DEFAULT 'UN';

-- Comentário para documentar a mudança
COMMENT ON COLUMN produtos.unidade IS 'Unidade de medida do produto (ex: KG, L, UN, etc.)';