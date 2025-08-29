-- Migração 010: Remover tabela pedidos_modernos_itens obsoleta
-- Data: 2025-01-16
-- Descrição: Remove a tabela pedidos_modernos_itens que foi substituída por pedidos_itens

BEGIN;

-- 1. Remover foreign keys que referenciam pedidos_modernos_itens
ALTER TABLE faturamento_itens_modalidades 
DROP CONSTRAINT IF EXISTS fk_faturamento_itens_modalidades_pedido_item;

ALTER TABLE pedido_itens_modalidades_config 
DROP CONSTRAINT IF EXISTS fk_pedido_itens_modalidades_config_pedido_item;

-- 2. Atualizar as foreign keys para referenciar pedidos_itens
-- Nota: Como não há dados nessas tabelas, apenas recriamos as constraints
ALTER TABLE faturamento_itens_modalidades 
ADD CONSTRAINT fk_faturamento_itens_modalidades_pedido_item 
FOREIGN KEY (pedido_item_id) REFERENCES pedidos_itens(id) ON DELETE CASCADE;

ALTER TABLE pedido_itens_modalidades_config 
ADD CONSTRAINT fk_pedido_itens_modalidades_config_pedido_item 
FOREIGN KEY (pedido_item_id) REFERENCES pedidos_itens(id) ON DELETE CASCADE;

-- 3. Remover a tabela pedidos_modernos_itens
DROP TABLE IF EXISTS pedidos_modernos_itens CASCADE;

-- 4. Log da operação
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES ('010_remover_pedidos_modernos_itens', NOW(), 'Removida tabela pedidos_modernos_itens obsoleta e atualizadas foreign keys para pedidos_itens');

COMMIT;

-- Verificação final
SELECT 'Migração 010 concluída com sucesso!' as status;