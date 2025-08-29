-- Migração 009: Consolidar estrutura de pedidos
-- Cria as tabelas pedidos_fornecedores, pedidos_itens e pedidos_historico
-- e migra dados das tabelas existentes

-- 1. Criar tabela pedidos_fornecedores
CREATE TABLE IF NOT EXISTS pedidos_fornecedores (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente',
  valor_subtotal DECIMAL(10,2) DEFAULT 0,
  observacoes_fornecedor TEXT,
  data_confirmacao TIMESTAMP,
  data_envio TIMESTAMP,
  data_entrega TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos_modernos(id) ON DELETE CASCADE,
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

-- 2. Criar tabela pedidos_itens
CREATE TABLE IF NOT EXISTS pedidos_itens (
  id SERIAL PRIMARY KEY,
  pedido_fornecedor_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  contrato_id INTEGER,
  quantidade DECIMAL(10,3) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  observacoes_item TEXT,
  data_entrega_prevista DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_fornecedor_id) REFERENCES pedidos_fornecedores(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

-- 3. Criar tabela pedidos_historico
CREATE TABLE IF NOT EXISTS pedidos_historico (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL,
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50) NOT NULL,
  observacoes TEXT,
  data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alterado_por INTEGER,
  FOREIGN KEY (pedido_id) REFERENCES pedidos_modernos(id) ON DELETE CASCADE,
  FOREIGN KEY (alterado_por) REFERENCES usuarios(id)
);

-- 4. Migrar dados existentes
-- Primeiro, criar registros em pedidos_fornecedores baseados nos pedidos_modernos
INSERT INTO pedidos_fornecedores (pedido_id, fornecedor_id, status, valor_subtotal, created_at)
SELECT 
  pm.id,
  COALESCE(pm.fornecedor_id, 1) as fornecedor_id, -- usar fornecedor padrão se não especificado
  pm.status,
  pm.valor_total,
  pm.created_at
FROM pedidos_modernos pm
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_fornecedores pf WHERE pf.pedido_id = pm.id
);

-- Migrar itens de pedidos_modernos_itens para pedidos_itens
INSERT INTO pedidos_itens (
  pedido_fornecedor_id, produto_id, contrato_id, quantidade, 
  preco_unitario, subtotal, created_at
)
SELECT 
  pf.id as pedido_fornecedor_id,
  pmi.produto_id,
  pmi.contrato_id,
  pmi.quantidade,
  pmi.preco_unitario,
  pmi.subtotal,
  pmi.created_at
FROM pedidos_modernos_itens pmi
JOIN pedidos_fornecedores pf ON pf.pedido_id = pmi.pedido_id
WHERE NOT EXISTS (
  SELECT 1 FROM pedidos_itens pi 
  WHERE pi.pedido_fornecedor_id = pf.id 
  AND pi.produto_id = pmi.produto_id
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedores_pedido ON pedidos_fornecedores(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedores_fornecedor ON pedidos_fornecedores(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fornecedores_status ON pedidos_fornecedores(status);

CREATE INDEX IF NOT EXISTS idx_pedidos_itens_fornecedor ON pedidos_itens(pedido_fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_itens_produto ON pedidos_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_itens_contrato ON pedidos_itens(contrato_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_historico_pedido ON pedidos_historico(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_historico_data ON pedidos_historico(data_alteracao);

-- 6. Criar triggers para manter updated_at atualizado
-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para pedidos_fornecedores
DROP TRIGGER IF EXISTS trigger_update_pedidos_fornecedores_timestamp ON pedidos_fornecedores;
CREATE TRIGGER trigger_update_pedidos_fornecedores_timestamp
  BEFORE UPDATE ON pedidos_fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para pedidos_itens
DROP TRIGGER IF EXISTS trigger_update_pedidos_itens_timestamp ON pedidos_itens;
CREATE TRIGGER trigger_update_pedidos_itens_timestamp
  BEFORE UPDATE ON pedidos_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();