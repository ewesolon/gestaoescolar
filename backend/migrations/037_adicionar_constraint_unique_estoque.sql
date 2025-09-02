-- Adicionar constraint UNIQUE para escola_id + produto_id na tabela estoque_escolas
-- Isso permite usar ON CONFLICT nas queries

-- Primeiro, remover possíveis duplicatas
DELETE FROM estoque_escolas 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM estoque_escolas 
    GROUP BY escola_id, produto_id
);

-- Adicionar a constraint UNIQUE
ALTER TABLE estoque_escolas 
ADD CONSTRAINT uk_estoque_escola_produto 
UNIQUE (escola_id, produto_id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_estoque_escola_produto 
ON estoque_escolas(escola_id, produto_id);

-- Comentário para documentação
COMMENT ON CONSTRAINT uk_estoque_escola_produto ON estoque_escolas 
IS 'Garante que cada produto só pode ter um registro por escola';