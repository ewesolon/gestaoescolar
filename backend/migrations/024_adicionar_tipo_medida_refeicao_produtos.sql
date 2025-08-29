-- Migração: Adicionar campo tipo_medida na tabela refeicao_produtos
-- Data: 2025-01-27
-- Descrição: Adiciona campo para especificar se per_capita é em gramas ou unidades

-- Adicionar coluna tipo_medida
ALTER TABLE refeicao_produtos 
ADD COLUMN IF NOT EXISTS tipo_medida VARCHAR(20) DEFAULT 'gramas' CHECK (tipo_medida IN ('gramas', 'unidades'));

-- Atualizar registros existentes baseado na unidade_medida do produto
UPDATE refeicao_produtos 
SET tipo_medida = CASE 
    WHEN p.unidade_medida = 'unidade' THEN 'unidades'
    ELSE 'gramas'
END
FROM produtos p 
WHERE refeicao_produtos.produto_id = p.id;

-- Adicionar comentário
COMMENT ON COLUMN refeicao_produtos.tipo_medida IS 'Especifica se per_capita é medido em gramas ou unidades por aluno';

-- Criar índice para consultas
CREATE INDEX IF NOT EXISTS idx_refeicao_produtos_tipo_medida ON refeicao_produtos(tipo_medida);