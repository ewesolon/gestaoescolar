-- Migração: Adicionar coluna tipo_medida na tabela refeicao_produtos
-- Data: 2025-01-26
-- Descrição: Adiciona campo tipo_medida para especificar se a medida é em gramas ou unidades

-- Adicionar coluna tipo_medida
ALTER TABLE refeicao_produtos 
ADD COLUMN IF NOT EXISTS tipo_medida VARCHAR(20) DEFAULT 'gramas' CHECK (tipo_medida IN ('gramas', 'unidades'));

-- Comentário
COMMENT ON COLUMN refeicao_produtos.tipo_medida IS 'Tipo de medida: gramas ou unidades';

-- Atualizar registros existentes para ter valor padrão
UPDATE refeicao_produtos 
SET tipo_medida = 'gramas' 
WHERE tipo_medida IS NULL;