-- Schema simplificado para Supabase - Sistema de Alimentação Escolar
-- Execute este script no SQL Editor do Supabase

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: modalidades
CREATE TABLE IF NOT EXISTS public.modalidades (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: escolas
CREATE TABLE IF NOT EXISTS public.escolas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    diretor VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: escola_modalidades
CREATE TABLE IF NOT EXISTS public.escola_modalidades (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER REFERENCES public.escolas(id),
    modalidade_id INTEGER REFERENCES public.modalidades(id),
    alunos_matriculados INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: fornecedores
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    endereco TEXT,
    telefone VARCHAR(20),
    email VARCHAR(255),
    contato VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: produtos
CREATE TABLE IF NOT EXISTS public.produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    unidade_medida VARCHAR(20),
    categoria VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: produto_modalidades
CREATE TABLE IF NOT EXISTS public.produto_modalidades (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES public.produtos(id),
    modalidade_id INTEGER REFERENCES public.modalidades(id),
    quantidade_por_aluno NUMERIC(10,3),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: contratos
CREATE TABLE IF NOT EXISTS public.contratos (
    id SERIAL PRIMARY KEY,
    fornecedor_id INTEGER REFERENCES public.fornecedores(id),
    numero VARCHAR(100) NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    valor_total NUMERIC(15,2),
    status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: contrato_produtos
CREATE TABLE IF NOT EXISTS public.contrato_produtos (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES public.contratos(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    preco_unitario NUMERIC(10,2),
    quantidade_contratada NUMERIC(15,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: refeicoes
CREATE TABLE IF NOT EXISTS public.refeicoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: refeicao_produtos
CREATE TABLE IF NOT EXISTS public.refeicao_produtos (
    id SERIAL PRIMARY KEY,
    refeicao_id INTEGER REFERENCES public.refeicoes(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    quantidade NUMERIC(10,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: cardapios
CREATE TABLE IF NOT EXISTS public.cardapios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: cardapio_refeicoes
CREATE TABLE IF NOT EXISTS public.cardapio_refeicoes (
    id SERIAL PRIMARY KEY,
    cardapio_id INTEGER REFERENCES public.cardapios(id),
    refeicao_id INTEGER REFERENCES public.refeicoes(id),
    dia_semana INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(100),
    data_pedido DATE,
    data_entrega DATE,
    status VARCHAR(50) DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedidos_fornecedores
CREATE TABLE IF NOT EXISTS public.pedidos_fornecedores (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES public.pedidos(id),
    fornecedor_id INTEGER REFERENCES public.fornecedores(id),
    valor_total NUMERIC(15,2),
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedidos_itens
CREATE TABLE IF NOT EXISTS public.pedidos_itens (
    id SERIAL PRIMARY KEY,
    pedido_fornecedor_id INTEGER REFERENCES public.pedidos_fornecedores(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    quantidade NUMERIC(15,3),
    preco_unitario NUMERIC(10,2),
    valor_total NUMERIC(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: estoque_escolas
CREATE TABLE IF NOT EXISTS public.estoque_escolas (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER REFERENCES public.escolas(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    quantidade_atual NUMERIC(15,3) DEFAULT 0,
    quantidade_minima NUMERIC(15,3) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: estoque_escolas_historico
CREATE TABLE IF NOT EXISTS public.estoque_escolas_historico (
    id SERIAL PRIMARY KEY,
    estoque_escola_id INTEGER REFERENCES public.estoque_escolas(id),
    tipo_movimentacao VARCHAR(50),
    quantidade NUMERIC(15,3),
    quantidade_anterior NUMERIC(15,3),
    quantidade_nova NUMERIC(15,3),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: estoque_lotes
CREATE TABLE IF NOT EXISTS public.estoque_lotes (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER REFERENCES public.escolas(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    lote VARCHAR(100),
    data_validade DATE,
    quantidade NUMERIC(15,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: estoque_movimentacoes
CREATE TABLE IF NOT EXISTS public.estoque_movimentacoes (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER REFERENCES public.escolas(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    tipo VARCHAR(50),
    quantidade NUMERIC(15,3),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: recebimentos_simples
CREATE TABLE IF NOT EXISTS public.recebimentos_simples (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER REFERENCES public.escolas(id),
    produto_id INTEGER REFERENCES public.produtos(id),
    quantidade NUMERIC(15,3),
    data_recebimento DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: presets_rotas
CREATE TABLE IF NOT EXISTS public.presets_rotas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    escolas_ids TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: schema_migrations (para controle de versão)
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir versão inicial
INSERT INTO public.schema_migrations (version) VALUES ('20250830_initial_schema') ON CONFLICT DO NOTHING;

-- Comentários nas tabelas
COMMENT ON TABLE public.usuarios IS 'Usuários do sistema';
COMMENT ON TABLE public.escolas IS 'Escolas cadastradas';
COMMENT ON TABLE public.modalidades IS 'Modalidades de ensino';
COMMENT ON TABLE public.produtos IS 'Produtos alimentícios';
COMMENT ON TABLE public.fornecedores IS 'Fornecedores de produtos';
COMMENT ON TABLE public.contratos IS 'Contratos com fornecedores';
COMMENT ON TABLE public.pedidos IS 'Pedidos de produtos';
COMMENT ON TABLE public.estoque_escolas IS 'Estoque atual das escolas';

-- Configurações de segurança (opcional)
-- ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Usuários podem ver próprios dados" ON public.usuarios FOR SELECT USING (auth.uid() = id::text);

COMMIT;