-- Migração 011: Renomear tabela pedidos_modernos para pedidos
-- Data: 2024
-- Descrição: Renomeia a tabela pedidos_modernos para pedidos e atualiza as foreign keys

BEGIN;

-- 1. Remover as foreign keys que referenciam pedidos_modernos
ALTER TABLE pedidos_fornecedores 
DROP CONSTRAINT IF EXISTS pedidos_fornecedores_pedido_id_fkey;

ALTER TABLE pedidos_historico 
DROP CONSTRAINT IF EXISTS pedidos_historico_pedido_id_fkey;

-- 2. Renomear a tabela pedidos_modernos para pedidos
ALTER TABLE pedidos_modernos RENAME TO pedidos;

-- 3. Recriar as foreign keys apontando para a nova tabela pedidos
ALTER TABLE pedidos_fornecedores 
ADD CONSTRAINT pedidos_fornecedores_pedido_id_fkey 
FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;

ALTER TABLE pedidos_historico 
ADD CONSTRAINT pedidos_historico_pedido_id_fkey 
FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;

-- 4. Atualizar sequências se necessário
ALTER SEQUENCE IF EXISTS pedidos_modernos_id_seq RENAME TO pedidos_id_seq;

-- 5. Atualizar a coluna de sequência da tabela
ALTER TABLE pedidos ALTER COLUMN id SET DEFAULT nextval('pedidos_id_seq'::regclass);

COMMIT;

-- Verificação final
SELECT 'Migração 011 concluída: pedidos_modernos renomeada para pedidos!' as status;