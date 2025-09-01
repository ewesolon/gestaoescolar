-- Adicionar coluna modalidade_id na tabela cardapio_refeicoes
-- Esta coluna é necessária para relacionar as refeições do cardápio com as modalidades de ensino

ALTER TABLE cardapio_refeicoes 
ADD COLUMN IF NOT EXISTS modalidade_id INTEGER REFERENCES modalidades(id);

-- Adicionar coluna frequencia_mensal se não existir
ALTER TABLE cardapio_refeicoes 
ADD COLUMN IF NOT EXISTS frequencia_mensal INTEGER DEFAULT 1;

-- Comentários para documentação
COMMENT ON COLUMN cardapio_refeicoes.modalidade_id IS 'ID da modalidade de ensino relacionada à refeição do cardápio';
COMMENT ON COLUMN cardapio_refeicoes.frequencia_mensal IS 'Frequência mensal da refeição no cardápio';