-- Migração 025: Corrigir todas as colunas faltantes

-- Adicionar coluna lote_id na tabela estoque_movimentacoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_movimentacoes' AND column_name = 'lote_id') THEN
        ALTER TABLE estoque_movimentacoes ADD COLUMN lote_id INTEGER REFERENCES estoque_lotes(id);
    END IF;
END $$;

-- Adicionar coluna data_validade na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'data_validade') THEN
        ALTER TABLE estoque_lotes ADD COLUMN data_validade DATE;
    END IF;
END $$;

-- Adicionar coluna data_movimentacao na tabela estoque_movimentacoes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_movimentacoes' AND column_name = 'data_movimentacao') THEN
        ALTER TABLE estoque_movimentacoes ADD COLUMN data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Criar tabela escola_modalidades se não existir
CREATE TABLE IF NOT EXISTS escola_modalidades (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER REFERENCES escolas(id),
    modalidade_id INTEGER REFERENCES modalidades(id),
    quantidade_alunos INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela modalidades se não existir
CREATE TABLE IF NOT EXISTS modalidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir modalidades padrão se não existirem
INSERT INTO modalidades (nome, descricao) 
SELECT 'Educação Infantil', 'Creche e Pré-escola'
WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nome = 'Educação Infantil');

INSERT INTO modalidades (nome, descricao) 
SELECT 'Ensino Fundamental I', '1º ao 5º ano'
WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nome = 'Ensino Fundamental I');

INSERT INTO modalidades (nome, descricao) 
SELECT 'Ensino Fundamental II', '6º ao 9º ano'
WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nome = 'Ensino Fundamental II');

INSERT INTO modalidades (nome, descricao) 
SELECT 'Ensino Médio', '1º ao 3º ano do Ensino Médio'
WHERE NOT EXISTS (SELECT 1 FROM modalidades WHERE nome = 'Ensino Médio');

-- Adicionar coluna numero_pedido na tabela pedidos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'numero_pedido') THEN
        ALTER TABLE pedidos ADD COLUMN numero_pedido VARCHAR(50);
    END IF;
END $$;

-- Adicionar coluna valor_total na tabela pedidos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'valor_total') THEN
        ALTER TABLE pedidos ADD COLUMN valor_total DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Adicionar coluna usuario_id na tabela pedidos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'usuario_id') THEN
        ALTER TABLE pedidos ADD COLUMN usuario_id INTEGER REFERENCES usuarios(id);
    END IF;
END $$;

-- Criar view para alertas de monitoramento se não existir
CREATE OR REPLACE VIEW vw_alertas_monitoramento AS
SELECT 
    'ESTOQUE_BAIXO' as tipo,
    'ATIVO' as status,
    'MEDIA' as classificacao_urgencia,
    CURRENT_TIMESTAMP as data_criacao,
    'Produto com estoque baixo' as descricao
WHERE EXISTS (SELECT 1 FROM produtos LIMIT 1);

-- Migração 025 concluída