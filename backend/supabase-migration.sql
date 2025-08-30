-- Migração para Supabase
-- Sistema de Alimentação Escolar
-- Gerado em: 2025-08-30T20:32:50.750Z

-- Configurações Supabase
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Tabela: aditivos_contratos
DROP TABLE IF EXISTS public.aditivos_contratos CASCADE;
CREATE TABLE public.aditivos_contratos (
    id INTEGER NOT NULL DEFAULT nextval('aditivos_contratos_id_seq'::regclass),
    contrato_id INTEGER NOT NULL,
    numero_aditivo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    data_assinatura DATE NOT NULL,
    data_inicio_vigencia DATE NOT NULL,
    data_fim_vigencia DATE,
    prazo_adicional_dias INTEGER,
    nova_data_fim DATE,
    percentual_acrescimo NUMERIC(5,2),
    valor_original NUMERIC(15,2),
    valor_aditivo NUMERIC(15,2),
    valor_total_atualizado NUMERIC(15,2),
    justificativa TEXT NOT NULL,
    fundamentacao_legal TEXT NOT NULL,
    numero_processo VARCHAR(100),
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_por INTEGER NOT NULL,
    aprovado_por INTEGER,
    data_aprovacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: aditivos_contratos_itens
DROP TABLE IF EXISTS public.aditivos_contratos_itens CASCADE;
CREATE TABLE public.aditivos_contratos_itens (
    id INTEGER NOT NULL DEFAULT nextval('aditivos_contratos_itens_id_seq'::regclass),
    aditivo_id INTEGER NOT NULL,
    contrato_produto_id INTEGER NOT NULL,
    quantidade_original NUMERIC(15,3) NOT NULL,
    percentual_acrescimo NUMERIC(5,2) NOT NULL,
    quantidade_adicional NUMERIC(15,3) NOT NULL,
    quantidade_nova NUMERIC(15,3) NOT NULL,
    valor_unitario NUMERIC(10,2) NOT NULL,
    valor_adicional NUMERIC(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: agrupamentos_faturamentos
DROP TABLE IF EXISTS public.agrupamentos_faturamentos CASCADE;
CREATE TABLE public.agrupamentos_faturamentos (
    id INTEGER NOT NULL DEFAULT nextval('agrupamentos_faturamentos_id_seq'::regclass),
    agrupamento_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDENTE'::character varying,
    valor_total NUMERIC(15,2) DEFAULT 0,
    valor_faturado NUMERIC(15,2) DEFAULT 0,
    total_pedidos INTEGER DEFAULT 0,
    pedidos_faturados INTEGER DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: agrupamentos_mensais
DROP TABLE IF EXISTS public.agrupamentos_mensais CASCADE;
CREATE TABLE public.agrupamentos_mensais (
    id INTEGER NOT NULL DEFAULT nextval('agrupamentos_mensais_id_seq'::regclass),
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL,
    descricao VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ATIVO'::character varying,
    total_pedidos INTEGER DEFAULT 0,
    valor_total NUMERIC(15,2) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER
);

-- Tabela: agrupamentos_pedidos
DROP TABLE IF EXISTS public.agrupamentos_pedidos CASCADE;
CREATE TABLE public.agrupamentos_pedidos (
    id INTEGER NOT NULL DEFAULT nextval('agrupamentos_pedidos_id_seq'::regclass),
    agrupamento_id INTEGER NOT NULL,
    pedido_id INTEGER NOT NULL,
    data_vinculacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: alertas
DROP TABLE IF EXISTS public.alertas CASCADE;
CREATE TABLE public.alertas (
    id INTEGER NOT NULL DEFAULT nextval('alertas_id_seq'::regclass),
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    nivel VARCHAR(20) NOT NULL DEFAULT 'INFO'::character varying,
    ativo BOOLEAN DEFAULT true,
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP,
    usuario_criacao INTEGER,
    dados_extras JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: calculos_entrega
DROP TABLE IF EXISTS public.calculos_entrega CASCADE;
CREATE TABLE public.calculos_entrega (
    id INTEGER NOT NULL DEFAULT nextval('calculos_entrega_id_seq'::regclass),
    nome_calculo VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    periodo_inicio DATE,
    periodo_fim DATE,
    status VARCHAR(50) DEFAULT 'calculado'::character varying,
    observacoes TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: calculos_resultados
DROP TABLE IF EXISTS public.calculos_resultados CASCADE;
CREATE TABLE public.calculos_resultados (
    id INTEGER NOT NULL DEFAULT nextval('calculos_resultados_id_seq'::regclass),
    calculo_id INTEGER NOT NULL,
    escola_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade_calculada NUMERIC(12,4) NOT NULL,
    quantidade_ajustada NUMERIC(12,4),
    observacoes_ajuste TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: cardapio_refeicoes
DROP TABLE IF EXISTS public.cardapio_refeicoes CASCADE;
CREATE TABLE public.cardapio_refeicoes (
    id INTEGER NOT NULL DEFAULT nextval('cardapio_refeicoes_id_seq'::regclass),
    cardapio_id INTEGER NOT NULL,
    refeicao_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    frequencia_mensal INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela cardapio_refeicoes (2 registros)
INSERT INTO public.cardapio_refeicoes (id, cardapio_id, refeicao_id, modalidade_id, frequencia_mensal, created_at, updated_at) VALUES (30, 14, 1, 5, 1, '2025-08-23T18:04:20.401Z', '2025-08-23T18:04:20.401Z');
INSERT INTO public.cardapio_refeicoes (id, cardapio_id, refeicao_id, modalidade_id, frequencia_mensal, created_at, updated_at) VALUES (32, 15, 1, 3, 5, '2025-08-26T00:20:35.270Z', '2025-08-26T00:27:45.352Z');

-- Tabela: cardapios
DROP TABLE IF EXISTS public.cardapios CASCADE;
CREATE TABLE public.cardapios (
    id INTEGER NOT NULL DEFAULT nextval('cardapios_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    periodo_dias INTEGER NOT NULL DEFAULT 30,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modalidade_id INTEGER
);

-- Dados da tabela cardapios (2 registros)
INSERT INTO public.cardapios (id, nome, descricao, periodo_dias, data_inicio, data_fim, ativo, created_at, updated_at, modalidade_id) VALUES (14, 'EJA', NULL, 22, '2025-08-23T03:00:00.000Z', '2025-08-31T03:00:00.000Z', TRUE, '2025-08-23T18:04:15.305Z', '2025-08-23T18:04:15.305Z', 5);
INSERT INTO public.cardapios (id, nome, descricao, periodo_dias, data_inicio, data_fim, ativo, created_at, updated_at, modalidade_id) VALUES (15, 'Fund', NULL, 22, '2025-08-25T03:00:00.000Z', '2025-08-31T03:00:00.000Z', TRUE, '2025-08-26T00:20:33.487Z', '2025-08-26T00:27:29.969Z', 3);

-- Tabela: carrinho_itens
DROP TABLE IF EXISTS public.carrinho_itens CASCADE;
CREATE TABLE public.carrinho_itens (
    id INTEGER NOT NULL DEFAULT nextval('carrinho_itens_id_seq'::regclass),
    usuario_id INTEGER DEFAULT 1,
    produto_id INTEGER NOT NULL,
    contrato_id INTEGER,
    fornecedor_id INTEGER,
    quantidade NUMERIC NOT NULL,
    preco_unitario NUMERIC NOT NULL,
    subtotal NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: contrato_produtos
DROP TABLE IF EXISTS public.contrato_produtos CASCADE;
CREATE TABLE public.contrato_produtos (
    id INTEGER NOT NULL DEFAULT nextval('contrato_produtos_id_seq'::regclass),
    contrato_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    quantidade_maxima NUMERIC(15,3),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    limite NUMERIC(15,2),
    preco NUMERIC(10,2),
    saldo NUMERIC(15,2)
);

-- Dados da tabela contrato_produtos (3 registros)
INSERT INTO public.contrato_produtos (id, contrato_id, produto_id, preco_unitario, quantidade_maxima, ativo, created_at, limite, preco, saldo) VALUES (11, 1, 1, '5.03', NULL, TRUE, '2025-08-25T23:40:13.187Z', '1000.00', '5.03', '1000.00');
INSERT INTO public.contrato_produtos (id, contrato_id, produto_id, preco_unitario, quantidade_maxima, ativo, created_at, limite, preco, saldo) VALUES (12, 1, 5, '15.15', NULL, TRUE, '2025-08-25T23:40:25.029Z', '1000.00', '15.15', '1000.00');
INSERT INTO public.contrato_produtos (id, contrato_id, produto_id, preco_unitario, quantidade_maxima, ativo, created_at, limite, preco, saldo) VALUES (13, 1, 2, '4.93', NULL, TRUE, '2025-08-25T23:40:56.027Z', '3000.00', '4.93', '3000.00');

-- Tabela: contratos
DROP TABLE IF EXISTS public.contratos CASCADE;
CREATE TABLE public.contratos (
    id INTEGER NOT NULL DEFAULT nextval('contratos_id_seq'::regclass),
    numero VARCHAR(100) NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_total NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ATIVO'::character varying,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    descricao TEXT,
    objeto TEXT,
    modalidade VARCHAR(100),
    numero_processo VARCHAR(50)
);

-- Dados da tabela contratos (1 registros)
INSERT INTO public.contratos (id, numero, fornecedor_id, data_inicio, data_fim, valor_total, status, observacoes, created_at, updated_at, ativo, descricao, objeto, modalidade, numero_processo) VALUES (1, 'CONTRATO-2024-001', 1, '2025-08-13T03:00:00.000Z', '2025-08-27T03:00:00.000Z', '268525.00', 'ATIVO', NULL, '2025-08-13T23:55:02.399Z', '2025-08-25T23:21:50.870Z', TRUE, 'Descrição detalhada do CONTRATO-2024-001', 'Fornecimento de gêneros alimentícios', 'Pregão Eletrônico', 'PROC-2025-0001');

-- Tabela: escola_modalidades
DROP TABLE IF EXISTS public.escola_modalidades CASCADE;
CREATE TABLE public.escola_modalidades (
    id INTEGER NOT NULL DEFAULT nextval('escola_modalidades_id_seq'::regclass),
    escola_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    quantidade_alunos INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela escola_modalidades (3 registros)
INSERT INTO public.escola_modalidades (id, escola_id, modalidade_id, quantidade_alunos, created_at, updated_at) VALUES (10, 84, 5, 10, '2025-08-23T18:47:28.746Z', '2025-08-23T18:47:28.746Z');
INSERT INTO public.escola_modalidades (id, escola_id, modalidade_id, quantidade_alunos, created_at, updated_at) VALUES (11, 80, 1, 411, '2025-08-23T18:47:41.709Z', '2025-08-23T18:47:41.709Z');
INSERT INTO public.escola_modalidades (id, escola_id, modalidade_id, quantidade_alunos, created_at, updated_at) VALUES (12, 84, 3, 200, '2025-08-26T00:03:17.282Z', '2025-08-26T00:22:19.421Z');

-- Tabela: escolas
DROP TABLE IF EXISTS public.escolas CASCADE;
CREATE TABLE public.escolas (
    id INTEGER NOT NULL DEFAULT nextval('escolas_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    municipio VARCHAR(100),
    endereco_maps TEXT,
    telefone VARCHAR(20),
    nome_gestor VARCHAR(255),
    administracao VARCHAR(20),
    rota INTEGER DEFAULT 1,
    posicao_rota INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo VARCHAR(50),
    email VARCHAR(255),
    codigo_acesso VARCHAR(20) NOT NULL
);

-- Dados da tabela escolas (54 registros)
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (108, 'EMEIF Alacid Nunes', 'Rod. Augusto Meira Filho, Km 07, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470073');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (109, 'EMEIF Janete Lopes', 'Rua 10 de Novembro, sn.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470196');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (110, 'EEEF Canutama', 'Rua Brás de Aguiar, s/n.', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470319');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (111, 'EMEIF Maria Romualda', 'Rua da Campestre', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470442');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (112, 'CMEI Profª Izaura Queiroz', 'Av. Deoclécio Gurjão, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470565');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (72, 'EMEI JARDIM DAS FLORES', 'RUA DAS FLORES, 123', 'SÃO PAULO', NULL, '(11) 3456-7890', 'MARIA DA SILVA', 'municipal', 1, 1, TRUE, '2025-08-23T18:43:28.633Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '465645');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (81, 'EMEF José Salomão Solon', 'Rua Waldemar Henrique, sn.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '466752');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (82, 'EMEIF Martinho Domiense Pinto Braga', 'Rua Itaipora', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '466875');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (83, 'EEEFM Profª Deusarina', 'Avenida Visconde Maracaju, s/n,', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '466998');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (85, 'EMEF Prof. Didi', 'Rua Otilia Begot, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '467244');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (86, 'EMEF Alice Fanjas', 'Rua Miranda Mateus, sn.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '467367');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (87, 'UPEIF Sagrado coração de Jesus', 'Rua 5 de julho, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '467490');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (89, 'UPEIF Nossa senhora do Carmo', 'Rua das Acácias, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '467736');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (90, 'EMEIF Dep. Gerson Perez', 'Vila do Taiassui - km 04, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '467859');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (91, 'EMEIF Maria Amelia', 'Estrada do Taiassui, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '467982');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (92, 'EMEF Madre Tereza de Calcutá', 'Rua das Acácias, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468105');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (93, 'EMEF Santa Luzia', 'Av. Perimetral Sul, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468228');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (94, 'EMEIF Mara Begot', 'Primeira Rua Agrinespe, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468351');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (95, 'EMEF Pirilampo', 'Rua Senador Antônio Lemos, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468474');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (96, 'EEEFM Profª Ana Teles', 'Avenida das Nações Unidas, s/n.', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468597');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (97, 'EEEF Francois Paul Begot', 'Rua Paul Begot, s/n.', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468720');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (98, 'EEEFM Drº Otavio Meira', 'Rua Paul Begot, nº180.', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468843');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (99, 'EMEF Eng. Ronaldo Rossi', 'Conjunto COHAB, Rua We 03, 15.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '468966');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (100, 'CMEI Jardim Juritis', 'Conjunto COHAB, Rua We 03, 15.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469089');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (101, 'EEEF Terceira Traversa', 'BR. 316, Luiz Gonzaga, Km 29,', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469212');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (102, 'EMEF José Leôncio', 'Rua 04 de Janeiro, 01.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469335');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (103, 'EMEIF José do Patrocínio', 'Av. Joaquim Pereira de Queiroz, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469458');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (104, 'EMEF Rafael Fernandes Gomes', 'Av. Joaquim Pereira de Queiroz', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469581');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (105, 'UPEIF Núcleo Educacional Fiore', 'Rua Visconde de Pirajás, 186.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469704');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (106, 'EEEF Santa Maria Bertilla', 'Avenia Joaquim Pereira de Queiroz, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469827');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (107, 'EMEIF Pr. Francisco Pereira do Nascimento', 'Rua Sebastião Pontes de Carvalho', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '469950');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (113, 'EMEIF Angélica Sales', 'Av. Camilo Pinto, s/n.', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470688');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (114, 'EMEF Profª Paulina Ramos', 'Ac. Deoclecio Gurjão, s/n - Santa Maria', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '470811');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (116, 'EMEIF Eunice Santos', 'Rua Santa Lúcia. Trav. Santa Luzia, nº 100 - Bairro Emilia - Benfica', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471057');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (117, 'EMEIF Antonina Garcia', 'Rua Jose Rodrigues dos Santos, s/n - Benfica', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471180');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (118, 'EMEIF Madressilva', 'Av. Madressilva, Trav. Santa Maria, s/n - Benfica', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471303');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (119, 'EMEIF Profº Raimundo Gilson', 'Rua da Oriza, 89 - Juquiri', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471426');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (120, 'UMEIF Melquíades Lima', 'Rua Santa Cararina - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471549');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (122, 'EMEF São Francisco de Assis', 'Av. Martinho Monteiro - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471795');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (123, 'EMEF Pr. Manuel Trajano', 'Av. Martinho Monteiro, 267 - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '471918');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (124, 'EMEIF Paraiso do Murinin', 'Av. Martinho Monteiro - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472041');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (125, 'CMEI profª Katia Simony Borralho de Lira', 'Av. Martinho Monteiro - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472164');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (126, 'EMEIF Abelardo Cruz', 'Rua 10 de Agosto, s/n - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472287');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (127, 'EEEF Padre Josimo Tavares', 'Estrada da Itaquara, s/n - Murinin', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472410');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (128, 'EEEF Murinin', 'Av. Martinho Monteiro, 1015 - Murinin', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472533');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (115, 'Anexo - Leão Irineu Delgado', 'Av. Deoclécio Gurjão, s/n - Santa Maria', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T03:31:40.247Z', NULL, NULL, '123457');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (121, 'Anexo - UMEIF Melquíades Lima', 'Rua Santa Catarina - Murinin', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T03:31:40.250Z', NULL, NULL, '123458');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (80, 'CMEI Berço da Liberdade', 'Av. Joaquim Pereira de Queiroz', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T03:31:40.252Z', NULL, NULL, '123459');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (88, 'CMEI Florescer', 'Rua Leão Delgado', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T03:31:40.254Z', NULL, NULL, '123460');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (129, 'EEEFM Profª Ruth Guimarães', 'Av. Martinho Monteiro, s/n - Murinin', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472656');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (130, 'EEEF João Batista de Moura', 'Rua José Rodrigues do Santos, s/n - benfica', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.453Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472779');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (131, 'EEEF Leão Irineu Delgado', 'Av. Dionísio Bentes, 510 - Benfica', 'Benevides', '', NULL, NULL, 'estadual', 1, 1, TRUE, '2025-08-23T18:44:43.453Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '472902');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (132, 'EMEIF 30 de Março', 'Rua terceira travessa - Marata', 'Benevides', '', NULL, NULL, 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.453Z', '2025-08-27T01:58:32.902Z', NULL, NULL, '473025');
INSERT INTO public.escolas (id, nome, endereco, municipio, endereco_maps, telefone, nome_gestor, administracao, rota, posicao_rota, ativo, created_at, updated_at, codigo, email, codigo_acesso) VALUES (84, 'Anexo - Didi', 'Rua 7 de setembro', 'Benevides', '', '', '', 'municipal', 1, 1, TRUE, '2025-08-23T18:44:43.322Z', '2025-08-27T03:31:40.240Z', NULL, NULL, '123456');

-- Tabela: escolas_modalidades
DROP TABLE IF EXISTS public.escolas_modalidades CASCADE;
CREATE TABLE public.escolas_modalidades (
    id INTEGER NOT NULL DEFAULT nextval('escolas_modalidades_id_seq'::regclass),
    escola_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    quantidade_alunos INTEGER NOT NULL DEFAULT 0,
    ano_letivo INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: estoque_alertas
DROP TABLE IF EXISTS public.estoque_alertas CASCADE;
CREATE TABLE public.estoque_alertas (
    id INTEGER NOT NULL DEFAULT nextval('estoque_alertas_id_seq'::regclass),
    produto_id INTEGER NOT NULL,
    lote_id INTEGER,
    tipo VARCHAR(30) NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visualizado BOOLEAN DEFAULT false,
    resolvido BOOLEAN DEFAULT false
);

-- Tabela: estoque_escolas
DROP TABLE IF EXISTS public.estoque_escolas CASCADE;
CREATE TABLE public.estoque_escolas (
    id INTEGER NOT NULL DEFAULT nextval('estoque_escolas_id_seq'::regclass),
    escola_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade_atual NUMERIC(10,3) NOT NULL DEFAULT 0,
    quantidade_minima NUMERIC(10,3) DEFAULT 0,
    quantidade_maxima NUMERIC(10,3) DEFAULT 0,
    data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_ultima_atualizacao INTEGER
);

-- Dados da tabela estoque_escolas (62 registros)
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (1, 108, 1, '97.000', '22.000', '73.000', '2025-08-27T01:19:58.326Z', 'Estoque inicial para EMEIF Alacid Nunes - Arroz Branco', TRUE, '2025-08-27T01:19:58.326Z', '2025-08-27T01:19:58.326Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (2, 108, 8, '30.000', '19.000', '67.000', '2025-08-27T01:19:58.331Z', 'Estoque inicial para EMEIF Alacid Nunes - Banana', TRUE, '2025-08-27T01:19:58.331Z', '2025-08-27T01:19:58.331Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (3, 108, 2, '26.000', '14.000', '78.000', '2025-08-27T01:19:58.333Z', 'Estoque inicial para EMEIF Alacid Nunes - Feijão Carioca', TRUE, '2025-08-27T01:19:58.333Z', '2025-08-27T01:19:58.333Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (4, 108, 6, '71.000', '5.000', '37.000', '2025-08-27T01:19:58.336Z', 'Estoque inicial para EMEIF Alacid Nunes - Frango', TRUE, '2025-08-27T01:19:58.336Z', '2025-08-27T01:19:58.336Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (5, 108, 4, '51.000', '16.000', '45.000', '2025-08-27T01:19:58.340Z', 'Estoque inicial para EMEIF Alacid Nunes - Leite Integral', TRUE, '2025-08-27T01:19:58.340Z', '2025-08-27T01:19:58.340Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (6, 108, 3, '87.000', '9.000', '60.000', '2025-08-27T01:19:58.342Z', 'Estoque inicial para EMEIF Alacid Nunes - Óleo de Soja', TRUE, '2025-08-27T01:19:58.342Z', '2025-08-27T01:19:58.342Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (7, 108, 7, '95.000', '8.000', '28.000', '2025-08-27T01:19:58.346Z', 'Estoque inicial para EMEIF Alacid Nunes - Ovos', TRUE, '2025-08-27T01:19:58.346Z', '2025-08-27T01:19:58.346Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (8, 108, 10, '86.000', '12.000', '50.000', '2025-08-27T01:19:58.348Z', 'Estoque inicial para EMEIF Alacid Nunes - Pão Francês', TRUE, '2025-08-27T01:19:58.348Z', '2025-08-27T01:19:58.348Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (9, 108, 9, '94.000', '6.000', '31.000', '2025-08-27T01:19:58.350Z', 'Estoque inicial para EMEIF Alacid Nunes - Tomate', TRUE, '2025-08-27T01:19:58.350Z', '2025-08-27T01:19:58.350Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (10, 108, 5, '32.000', '14.000', '63.000', '2025-08-27T01:19:58.352Z', 'Estoque inicial para EMEIF Alacid Nunes - Carne Bovina Moída', TRUE, '2025-08-27T01:19:58.352Z', '2025-08-27T01:19:58.352Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (11, 109, 1, '80.000', '12.000', '41.000', '2025-08-27T01:19:58.354Z', 'Estoque inicial para EMEIF Janete Lopes - Arroz Branco', TRUE, '2025-08-27T01:19:58.354Z', '2025-08-27T01:19:58.354Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (12, 109, 8, '32.000', '14.000', '71.000', '2025-08-27T01:19:58.356Z', 'Estoque inicial para EMEIF Janete Lopes - Banana', TRUE, '2025-08-27T01:19:58.356Z', '2025-08-27T01:19:58.356Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (13, 109, 2, '31.000', '18.000', '48.000', '2025-08-27T01:19:58.359Z', 'Estoque inicial para EMEIF Janete Lopes - Feijão Carioca', TRUE, '2025-08-27T01:19:58.359Z', '2025-08-27T01:19:58.359Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (14, 109, 6, '48.000', '9.000', '55.000', '2025-08-27T01:19:58.360Z', 'Estoque inicial para EMEIF Janete Lopes - Frango', TRUE, '2025-08-27T01:19:58.360Z', '2025-08-27T01:19:58.360Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (15, 109, 4, '5.000', '9.000', '30.000', '2025-08-27T01:19:58.362Z', 'Estoque inicial para EMEIF Janete Lopes - Leite Integral', TRUE, '2025-08-27T01:19:58.362Z', '2025-08-27T01:19:58.362Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (16, 109, 3, '62.000', '16.000', '59.000', '2025-08-27T01:19:58.363Z', 'Estoque inicial para EMEIF Janete Lopes - Óleo de Soja', TRUE, '2025-08-27T01:19:58.363Z', '2025-08-27T01:19:58.363Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (17, 109, 7, '5.000', '23.000', '56.000', '2025-08-27T01:19:58.364Z', 'Estoque inicial para EMEIF Janete Lopes - Ovos', TRUE, '2025-08-27T01:19:58.364Z', '2025-08-27T01:19:58.364Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (18, 109, 10, '91.000', '11.000', '34.000', '2025-08-27T01:19:58.365Z', 'Estoque inicial para EMEIF Janete Lopes - Pão Francês', TRUE, '2025-08-27T01:19:58.365Z', '2025-08-27T01:19:58.365Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (19, 109, 9, '44.000', '15.000', '78.000', '2025-08-27T01:19:58.367Z', 'Estoque inicial para EMEIF Janete Lopes - Tomate', TRUE, '2025-08-27T01:19:58.367Z', '2025-08-27T01:19:58.367Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (20, 109, 5, '9.000', '10.000', '37.000', '2025-08-27T01:19:58.368Z', 'Estoque inicial para EMEIF Janete Lopes - Carne Bovina Moída', TRUE, '2025-08-27T01:19:58.368Z', '2025-08-27T01:19:58.368Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (21, 110, 1, '98.000', '22.000', '75.000', '2025-08-27T01:19:58.369Z', 'Estoque inicial para EEEF Canutama - Arroz Branco', TRUE, '2025-08-27T01:19:58.369Z', '2025-08-27T01:19:58.369Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (22, 110, 8, '2.000', '14.000', '39.000', '2025-08-27T01:19:58.371Z', 'Estoque inicial para EEEF Canutama - Banana', TRUE, '2025-08-27T01:19:58.371Z', '2025-08-27T01:19:58.371Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (23, 110, 2, '69.000', '23.000', '75.000', '2025-08-27T01:19:58.372Z', 'Estoque inicial para EEEF Canutama - Feijão Carioca', TRUE, '2025-08-27T01:19:58.372Z', '2025-08-27T01:19:58.372Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (24, 110, 6, '24.000', '20.000', '46.000', '2025-08-27T01:19:58.374Z', 'Estoque inicial para EEEF Canutama - Frango', TRUE, '2025-08-27T01:19:58.374Z', '2025-08-27T01:19:58.374Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (25, 110, 4, '62.000', '17.000', '76.000', '2025-08-27T01:19:58.376Z', 'Estoque inicial para EEEF Canutama - Leite Integral', TRUE, '2025-08-27T01:19:58.376Z', '2025-08-27T01:19:58.376Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (26, 110, 3, '54.000', '13.000', '70.000', '2025-08-27T01:19:58.377Z', 'Estoque inicial para EEEF Canutama - Óleo de Soja', TRUE, '2025-08-27T01:19:58.377Z', '2025-08-27T01:19:58.377Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (27, 110, 7, '9.000', '11.000', '68.000', '2025-08-27T01:19:58.378Z', 'Estoque inicial para EEEF Canutama - Ovos', TRUE, '2025-08-27T01:19:58.378Z', '2025-08-27T01:19:58.378Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (28, 110, 10, '72.000', '9.000', '50.000', '2025-08-27T01:19:58.379Z', 'Estoque inicial para EEEF Canutama - Pão Francês', TRUE, '2025-08-27T01:19:58.379Z', '2025-08-27T01:19:58.379Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (29, 110, 9, '82.000', '10.000', '62.000', '2025-08-27T01:19:58.381Z', 'Estoque inicial para EEEF Canutama - Tomate', TRUE, '2025-08-27T01:19:58.381Z', '2025-08-27T01:19:58.381Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (30, 110, 5, '71.000', '19.000', '82.000', '2025-08-27T01:19:58.382Z', 'Estoque inicial para EEEF Canutama - Carne Bovina Moída', TRUE, '2025-08-27T01:19:58.382Z', '2025-08-27T01:19:58.382Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (31, 111, 1, '14.000', '22.000', '88.000', '2025-08-27T01:19:58.383Z', 'Estoque inicial para EMEIF Maria Romualda - Arroz Branco', TRUE, '2025-08-27T01:19:58.383Z', '2025-08-27T01:19:58.383Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (32, 111, 8, '10.000', '20.000', '88.000', '2025-08-27T01:19:58.384Z', 'Estoque inicial para EMEIF Maria Romualda - Banana', TRUE, '2025-08-27T01:19:58.384Z', '2025-08-27T01:19:58.384Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (33, 111, 2, '10.000', '10.000', '51.000', '2025-08-27T01:19:58.385Z', 'Estoque inicial para EMEIF Maria Romualda - Feijão Carioca', TRUE, '2025-08-27T01:19:58.385Z', '2025-08-27T01:19:58.385Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (34, 111, 6, '19.000', '20.000', '64.000', '2025-08-27T01:19:58.386Z', 'Estoque inicial para EMEIF Maria Romualda - Frango', TRUE, '2025-08-27T01:19:58.386Z', '2025-08-27T01:19:58.386Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (35, 111, 4, '52.000', '20.000', '87.000', '2025-08-27T01:19:58.388Z', 'Estoque inicial para EMEIF Maria Romualda - Leite Integral', TRUE, '2025-08-27T01:19:58.388Z', '2025-08-27T01:19:58.388Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (36, 111, 3, '24.000', '6.000', '43.000', '2025-08-27T01:19:58.389Z', 'Estoque inicial para EMEIF Maria Romualda - Óleo de Soja', TRUE, '2025-08-27T01:19:58.389Z', '2025-08-27T01:19:58.389Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (37, 111, 7, '0.000', '17.000', '80.000', '2025-08-27T01:19:58.392Z', 'Estoque inicial para EMEIF Maria Romualda - Ovos', TRUE, '2025-08-27T01:19:58.392Z', '2025-08-27T01:19:58.392Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (38, 111, 10, '64.000', '23.000', '73.000', '2025-08-27T01:19:58.393Z', 'Estoque inicial para EMEIF Maria Romualda - Pão Francês', TRUE, '2025-08-27T01:19:58.393Z', '2025-08-27T01:19:58.393Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (39, 111, 9, '51.000', '5.000', '62.000', '2025-08-27T01:19:58.395Z', 'Estoque inicial para EMEIF Maria Romualda - Tomate', TRUE, '2025-08-27T01:19:58.395Z', '2025-08-27T01:19:58.395Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (40, 111, 5, '21.000', '12.000', '80.000', '2025-08-27T01:19:58.396Z', 'Estoque inicial para EMEIF Maria Romualda - Carne Bovina Moída', TRUE, '2025-08-27T01:19:58.396Z', '2025-08-27T01:19:58.396Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (41, 112, 1, '11.000', '20.000', '83.000', '2025-08-27T01:19:58.397Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Arroz Branco', TRUE, '2025-08-27T01:19:58.397Z', '2025-08-27T01:19:58.397Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (42, 112, 8, '72.000', '11.000', '50.000', '2025-08-27T01:19:58.398Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Banana', TRUE, '2025-08-27T01:19:58.398Z', '2025-08-27T01:19:58.398Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (43, 112, 2, '18.000', '20.000', '43.000', '2025-08-27T01:19:58.399Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Feijão Carioca', TRUE, '2025-08-27T01:19:58.399Z', '2025-08-27T01:19:58.399Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (44, 112, 6, '60.000', '17.000', '73.000', '2025-08-27T01:19:58.401Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Frango', TRUE, '2025-08-27T01:19:58.401Z', '2025-08-27T01:19:58.401Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (45, 112, 4, '95.000', '9.000', '77.000', '2025-08-27T01:19:58.402Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Leite Integral', TRUE, '2025-08-27T01:19:58.402Z', '2025-08-27T01:19:58.402Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (46, 112, 3, '41.000', '17.000', '75.000', '2025-08-27T01:19:58.404Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Óleo de Soja', TRUE, '2025-08-27T01:19:58.404Z', '2025-08-27T01:19:58.404Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (47, 112, 7, '82.000', '9.000', '51.000', '2025-08-27T01:19:58.405Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Ovos', TRUE, '2025-08-27T01:19:58.405Z', '2025-08-27T01:19:58.405Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (48, 112, 10, '67.000', '24.000', '46.000', '2025-08-27T01:19:58.407Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Pão Francês', TRUE, '2025-08-27T01:19:58.407Z', '2025-08-27T01:19:58.407Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (49, 112, 9, '49.000', '17.000', '37.000', '2025-08-27T01:19:58.409Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Tomate', TRUE, '2025-08-27T01:19:58.409Z', '2025-08-27T01:19:58.409Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (50, 112, 5, '89.000', '14.000', '65.000', '2025-08-27T01:19:58.410Z', 'Estoque inicial para CMEI Profª Izaura Queiroz - Carne Bovina Moída', TRUE, '2025-08-27T01:19:58.410Z', '2025-08-27T01:19:58.410Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (53, 84, 2, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (55, 84, 4, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (56, 84, 3, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (57, 84, 7, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (58, 84, 10, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (59, 84, 9, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (60, 84, 5, '0.000', '0.000', '0.000', '2025-08-27T01:21:51.868Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T01:21:51.868Z', NULL);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (54, 84, 6, '60.000', '0.000', '0.000', '2025-08-27T03:53:03.476Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T03:53:03.476Z', 1);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (52, 84, 8, '20.000', '0.000', '0.000', '2025-08-27T04:27:29.611Z', NULL, TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T04:27:29.611Z', 1);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (61, 84, 31, '0.000', '0.000', '0.000', '2025-08-27T02:08:03.904Z', NULL, TRUE, '2025-08-27T01:29:11.818Z', '2025-08-27T02:08:03.904Z', 1);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (51, 84, 1, '50.000', '0.000', '0.000', '2025-08-27T03:46:40.668Z', '', TRUE, '2025-08-27T01:21:51.868Z', '2025-08-27T03:46:40.668Z', 1);
INSERT INTO public.estoque_escolas (id, escola_id, produto_id, quantidade_atual, quantidade_minima, quantidade_maxima, data_ultima_atualizacao, observacoes, ativo, created_at, updated_at, usuario_ultima_atualizacao) VALUES (64, 84, 33, '5.000', '0.000', '0.000', '2025-08-27T04:30:31.970Z', NULL, TRUE, '2025-08-27T03:31:14.304Z', '2025-08-27T04:30:31.970Z', 1);

-- Tabela: estoque_escolas_historico
DROP TABLE IF EXISTS public.estoque_escolas_historico CASCADE;
CREATE TABLE public.estoque_escolas_historico (
    id INTEGER NOT NULL DEFAULT nextval('estoque_escolas_historico_id_seq'::regclass),
    estoque_escola_id INTEGER,
    escola_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    tipo_movimentacao VARCHAR(20) NOT NULL,
    quantidade_anterior NUMERIC(10,3) NOT NULL DEFAULT 0,
    quantidade_movimentada NUMERIC(10,3) NOT NULL,
    quantidade_posterior NUMERIC(10,3) NOT NULL DEFAULT 0,
    motivo TEXT,
    documento_referencia TEXT,
    usuario_id INTEGER,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela estoque_escolas_historico (13 registros)
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (1, 51, 84, 1, 'entrada', '0.000', '10.000', '10.000', '', '', 1, '2025-08-27T01:48:20.955Z', '2025-08-27T01:48:20.955Z', '2025-08-27T01:48:20.955Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (2, 51, 84, 1, 'saida', '10.000', '10.000', '0.000', '', '', 1, '2025-08-27T01:48:43.001Z', '2025-08-27T01:48:43.001Z', '2025-08-27T01:48:43.001Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (3, 51, 84, 1, 'entrada', '0.000', '10.000', '10.000', '', '', 1, '2025-08-27T01:49:03.190Z', '2025-08-27T01:49:03.190Z', '2025-08-27T01:49:03.190Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (4, 51, 84, 1, 'ajuste', '10.000', '20.000', '20.000', '', '', 1, '2025-08-27T01:49:30.637Z', '2025-08-27T01:49:30.637Z', '2025-08-27T01:49:30.637Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (5, 51, 84, 1, 'entrada', '20.000', '50.000', '70.000', '', '', 1, '2025-08-27T02:05:53.054Z', '2025-08-27T02:05:53.054Z', '2025-08-27T02:05:53.054Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (6, 61, 84, 31, 'saida', '10.000', '10.000', '0.000', '', '', 1, '2025-08-27T02:08:03.904Z', '2025-08-27T02:08:03.904Z', '2025-08-27T02:08:03.904Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (7, 51, 84, 1, 'entrada', '70.000', '30.000', '100.000', '', '', 1, '2025-08-27T02:59:07.434Z', '2025-08-27T02:59:07.434Z', '2025-08-27T02:59:07.434Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (8, 51, 84, 1, 'saida', '100.000', '50.000', '50.000', '', '', 1, '2025-08-27T03:46:40.668Z', '2025-08-27T03:46:40.668Z', '2025-08-27T03:46:40.668Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (9, 54, 84, 6, 'entrada', '0.000', '80.000', '80.000', 'Recebimento', '', 1, '2025-08-27T03:52:29.799Z', '2025-08-27T03:52:29.799Z', '2025-08-27T03:52:29.799Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (10, 54, 84, 6, 'saida', '80.000', '20.000', '60.000', 'Saiu', '', 1, '2025-08-27T03:53:03.476Z', '2025-08-27T03:53:03.476Z', '2025-08-27T03:53:03.476Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (11, 64, 84, 33, 'entrada', '0.000', '10.000', '10.000', '', '', 1, '2025-08-27T03:54:18.725Z', '2025-08-27T03:54:18.725Z', '2025-08-27T03:54:18.725Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (12, 52, 84, 8, 'entrada', '0.000', '20.000', '20.000', 'entrada via mobile', '', 1, '2025-08-27T04:27:29.611Z', '2025-08-27T04:27:29.611Z', '2025-08-27T04:27:29.611Z');
INSERT INTO public.estoque_escolas_historico (id, estoque_escola_id, escola_id, produto_id, tipo_movimentacao, quantidade_anterior, quantidade_movimentada, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, created_at, updated_at) VALUES (13, 64, 84, 33, 'saida', '10.000', '5.000', '5.000', 'saida via mobile', '', 1, '2025-08-27T04:30:31.970Z', '2025-08-27T04:30:31.970Z', '2025-08-27T04:30:31.970Z');

-- Tabela: estoque_lotes
DROP TABLE IF EXISTS public.estoque_lotes CASCADE;
CREATE TABLE public.estoque_lotes (
    id INTEGER NOT NULL DEFAULT nextval('estoque_lotes_id_seq'::regclass),
    produto_id INTEGER NOT NULL,
    lote TEXT NOT NULL,
    quantidade_inicial NUMERIC(10,3) NOT NULL DEFAULT 0,
    quantidade_atual NUMERIC(10,3) NOT NULL DEFAULT 0,
    data_fabricacao DATE,
    data_validade DATE,
    fornecedor_id INTEGER,
    recebimento_id INTEGER,
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo'::character varying,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela estoque_lotes (6 registros)
INSERT INTO public.estoque_lotes (id, produto_id, lote, quantidade_inicial, quantidade_atual, data_fabricacao, data_validade, fornecedor_id, recebimento_id, observacoes, status, created_at, updated_at) VALUES (14, 8, 'LOTE-1755461091919', '250.000', '250.000', NULL, '2025-08-30T03:00:00.000Z', NULL, NULL, 'Recebimento - PARCIAL', 'ativo', '2025-08-17T20:04:51.969Z', '2025-08-17T20:04:51.969Z');
INSERT INTO public.estoque_lotes (id, produto_id, lote, quantidade_inicial, quantidade_atual, data_fabricacao, data_validade, fornecedor_id, recebimento_id, observacoes, status, created_at, updated_at) VALUES (15, 8, 'LOTE-1755461361342', '250.000', '250.000', NULL, '2025-08-30T03:00:00.000Z', NULL, NULL, 'Recebimento - RECEBIDO', 'ativo', '2025-08-17T20:09:21.434Z', '2025-08-17T20:09:21.434Z');
INSERT INTO public.estoque_lotes (id, produto_id, lote, quantidade_inicial, quantidade_atual, data_fabricacao, data_validade, fornecedor_id, recebimento_id, observacoes, status, created_at, updated_at) VALUES (16, 8, 'LOTE-1755569707877', '500.000', '500.000', NULL, '2025-08-30T03:00:00.000Z', NULL, NULL, 'Recebimento - RECEBIDO', 'ativo', '2025-08-19T02:15:08.398Z', '2025-08-19T02:15:08.398Z');
INSERT INTO public.estoque_lotes (id, produto_id, lote, quantidade_inicial, quantidade_atual, data_fabricacao, data_validade, fornecedor_id, recebimento_id, observacoes, status, created_at, updated_at) VALUES (17, 5, 'LOTE-1755570294234', '5.000', '5.000', NULL, '2025-08-27T03:00:00.000Z', NULL, NULL, 'Recebimento - RECEBIDO', 'ativo', '2025-08-19T02:24:54.412Z', '2025-08-19T02:24:54.412Z');
INSERT INTO public.estoque_lotes (id, produto_id, lote, quantidade_inicial, quantidade_atual, data_fabricacao, data_validade, fornecedor_id, recebimento_id, observacoes, status, created_at, updated_at) VALUES (18, 8, 'LOTE-1755573120123', '30.000', '30.000', NULL, '2025-08-30T03:00:00.000Z', NULL, NULL, 'Recebimento - RECEBIDO', 'ativo', '2025-08-19T03:12:00.163Z', '2025-08-19T03:12:00.163Z');
INSERT INTO public.estoque_lotes (id, produto_id, lote, quantidade_inicial, quantidade_atual, data_fabricacao, data_validade, fornecedor_id, recebimento_id, observacoes, status, created_at, updated_at) VALUES (19, 5, 'LOTE-1755573671576', '500.000', '500.000', NULL, '2025-08-30T03:00:00.000Z', NULL, NULL, 'Recebimento - PARCIAL', 'ativo', '2025-08-19T03:21:11.798Z', '2025-08-19T03:21:11.798Z');

-- Tabela: estoque_movimentacoes
DROP TABLE IF EXISTS public.estoque_movimentacoes CASCADE;
CREATE TABLE public.estoque_movimentacoes (
    id INTEGER NOT NULL DEFAULT nextval('estoque_movimentacoes_id_seq'::regclass),
    lote_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    quantidade NUMERIC(10,3) NOT NULL,
    quantidade_anterior NUMERIC(10,3) NOT NULL,
    quantidade_posterior NUMERIC(10,3) NOT NULL,
    motivo TEXT NOT NULL,
    documento_referencia TEXT,
    usuario_id INTEGER NOT NULL,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT
);

-- Dados da tabela estoque_movimentacoes (6 registros)
INSERT INTO public.estoque_movimentacoes (id, lote_id, produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, observacoes) VALUES (14, 14, 8, 'entrada', '250.000', '0.000', '250.000', 'Entrada manual', NULL, 1, '2025-08-17T20:04:51.971Z', 'Recebimento - PARCIAL');
INSERT INTO public.estoque_movimentacoes (id, lote_id, produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, observacoes) VALUES (15, 15, 8, 'entrada', '250.000', '0.000', '250.000', 'Entrada manual', NULL, 1, '2025-08-17T20:09:21.439Z', 'Recebimento - RECEBIDO');
INSERT INTO public.estoque_movimentacoes (id, lote_id, produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, observacoes) VALUES (16, 16, 8, 'entrada', '500.000', '0.000', '500.000', 'Entrada manual', NULL, 1, '2025-08-19T02:15:08.404Z', 'Recebimento - RECEBIDO');
INSERT INTO public.estoque_movimentacoes (id, lote_id, produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, observacoes) VALUES (17, 17, 5, 'entrada', '5.000', '0.000', '5.000', 'Entrada manual', NULL, 1, '2025-08-19T02:24:54.421Z', 'Recebimento - RECEBIDO');
INSERT INTO public.estoque_movimentacoes (id, lote_id, produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, observacoes) VALUES (18, 18, 8, 'entrada', '30.000', '0.000', '30.000', 'Entrada manual', NULL, 1, '2025-08-19T03:12:00.168Z', 'Recebimento - RECEBIDO');
INSERT INTO public.estoque_movimentacoes (id, lote_id, produto_id, tipo, quantidade, quantidade_anterior, quantidade_posterior, motivo, documento_referencia, usuario_id, data_movimentacao, observacoes) VALUES (19, 19, 5, 'entrada', '500.000', '0.000', '500.000', 'Entrada manual', NULL, 1, '2025-08-19T03:21:11.802Z', 'Recebimento - PARCIAL');

-- Tabela: faturamento_itens
DROP TABLE IF EXISTS public.faturamento_itens CASCADE;
CREATE TABLE public.faturamento_itens (
    id INTEGER NOT NULL DEFAULT nextval('faturamento_itens_id_seq'::regclass),
    faturamento_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    quantidade_recebida NUMERIC(15,3) NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    valor_total NUMERIC(15,2) NOT NULL,
    data_recebimento TIMESTAMP NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: faturamento_itens_modalidades
DROP TABLE IF EXISTS public.faturamento_itens_modalidades CASCADE;
CREATE TABLE public.faturamento_itens_modalidades (
    id INTEGER NOT NULL DEFAULT nextval('faturamento_itens_modalidades_id_seq'::regclass),
    faturamento_id INTEGER NOT NULL,
    pedido_item_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    quantidade_original NUMERIC(10,3) NOT NULL,
    quantidade_modalidade NUMERIC(10,3) NOT NULL,
    percentual_modalidade NUMERIC(5,2) NOT NULL,
    valor_unitario NUMERIC(10,2) NOT NULL,
    valor_total_modalidade NUMERIC(12,2) NOT NULL,
    valor_repasse_modalidade NUMERIC(10,2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: faturamentos
DROP TABLE IF EXISTS public.faturamentos CASCADE;
CREATE TABLE public.faturamentos (
    id INTEGER NOT NULL DEFAULT nextval('faturamentos_id_seq'::regclass),
    numero_faturamento VARCHAR(100) NOT NULL,
    pedido_id INTEGER NOT NULL,
    fornecedor_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'RASCUNHO'::character varying,
    data_inicio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_finalizacao TIMESTAMP,
    usuario_criador_id INTEGER NOT NULL,
    observacoes TEXT,
    valor_total_faturado NUMERIC(15,2) DEFAULT 0,
    total_itens_faturados INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contrato_id INTEGER,
    is_parcial BOOLEAN DEFAULT false
);

-- Tabela: fornecedores
DROP TABLE IF EXISTS public.fornecedores CASCADE;
CREATE TABLE public.fornecedores (
    id INTEGER NOT NULL DEFAULT nextval('fornecedores_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10)
);

-- Dados da tabela fornecedores (1 registros)
INSERT INTO public.fornecedores (id, nome, cnpj, email, telefone, endereco, ativo, created_at, updated_at, cidade, estado, cep) VALUES (1, 'Fornecedor Exemplo LTDA', '12.345.678/0001-90', 'contato@fornecedor.com', '(11) 99999-9999', NULL, TRUE, '2025-08-13T23:49:41.369Z', '2025-08-13T23:49:41.369Z', 'São Paulo', 'SP', '01000-000');

-- Tabela: modalidades
DROP TABLE IF EXISTS public.modalidades CASCADE;
CREATE TABLE public.modalidades (
    id INTEGER NOT NULL DEFAULT nextval('modalidades_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    valor_repasse NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela modalidades (6 registros)
INSERT INTO public.modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (1, 'Creche', 'Educação Infantil - Creche (0 a 3 anos)', TRUE, '0.32', '2025-08-13T23:35:17.399Z', '2025-08-13T23:35:17.399Z');
INSERT INTO public.modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (3, 'Ensino Fundamental', 'Ensino Fundamental (6 a 14 anos)', TRUE, '0.36', '2025-08-13T23:35:17.407Z', '2025-08-13T23:35:17.407Z');
INSERT INTO public.modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (4, 'Ensino Médio', 'Ensino Médio (15 a 17 anos)', TRUE, '0.40', '2025-08-13T23:35:17.410Z', '2025-08-13T23:35:17.410Z');
INSERT INTO public.modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (5, 'EJA', 'Educação de Jovens e Adultos', TRUE, '0.32', '2025-08-13T23:35:17.415Z', '2025-08-13T23:35:17.415Z');
INSERT INTO public.modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (6, 'Ensino Integral', 'Ensino em Tempo Integral', TRUE, '1.07', '2025-08-13T23:35:17.417Z', '2025-08-13T23:35:17.417Z');
INSERT INTO public.modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (2, 'Pré-escola', 'Educação Infantil - Pré-escola (4 a 5 anos)', TRUE, '320.00', '2025-08-13T23:35:17.404Z', '2025-08-15T17:13:27.745Z');

-- Tabela: movimentacoes_consumo_contratos
DROP TABLE IF EXISTS public.movimentacoes_consumo_contratos CASCADE;
CREATE TABLE public.movimentacoes_consumo_contratos (
    id INTEGER NOT NULL DEFAULT nextval('movimentacoes_consumo_contratos_id_seq'::regclass),
    contrato_produto_id INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    quantidade_utilizada NUMERIC(10,3) NOT NULL,
    valor_utilizado NUMERIC(12,2),
    justificativa TEXT NOT NULL,
    data_movimentacao DATE NOT NULL,
    usuario_id INTEGER NOT NULL,
    observacoes TEXT,
    documento_referencia TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: notificacoes_sistema
DROP TABLE IF EXISTS public.notificacoes_sistema CASCADE;
CREATE TABLE public.notificacoes_sistema (
    id INTEGER NOT NULL DEFAULT nextval('notificacoes_sistema_id_seq'::regclass),
    usuario_id INTEGER,
    tipo VARCHAR(20) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    dados_extras JSONB DEFAULT '{}'::jsonb,
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedido_itens_modalidades_config
DROP TABLE IF EXISTS public.pedido_itens_modalidades_config CASCADE;
CREATE TABLE public.pedido_itens_modalidades_config (
    id INTEGER NOT NULL DEFAULT nextval('pedido_itens_modalidades_config_id_seq'::regclass),
    pedido_item_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    percentual_configurado NUMERIC(5,2),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedidos
DROP TABLE IF EXISTS public.pedidos CASCADE;
CREATE TABLE public.pedidos (
    id INTEGER NOT NULL DEFAULT nextval('pedidos_id_seq'::regclass),
    usuario_id INTEGER NOT NULL,
    escola_id INTEGER,
    contrato_id INTEGER,
    fornecedor_id INTEGER,
    status VARCHAR(50) DEFAULT 'pendente'::character varying,
    valor_total NUMERIC(10,2) DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_pedido VARCHAR(50)
);

-- Dados da tabela pedidos (4 registros)
INSERT INTO public.pedidos (id, usuario_id, escola_id, contrato_id, fornecedor_id, status, valor_total, observacoes, created_at, updated_at, numero_pedido) VALUES (1, 1, NULL, NULL, 1, 'CONFIRMADO', '500.00', 'Pedido com 1 itens do carrinho', '2025-08-19T02:51:28.541Z', '2025-08-19T02:51:32.572Z', 'PED-1755571888540');
INSERT INTO public.pedidos (id, usuario_id, escola_id, contrato_id, fornecedor_id, status, valor_total, observacoes, created_at, updated_at, numero_pedido) VALUES (2, 1, NULL, NULL, 1, 'CONFIRMADO', '100.00', 'Pedido com 1 itens do carrinho', '2025-08-19T02:52:01.785Z', '2025-08-19T03:10:33.160Z', 'PED-1755571921785');
INSERT INTO public.pedidos (id, usuario_id, escola_id, contrato_id, fornecedor_id, status, valor_total, observacoes, created_at, updated_at, numero_pedido) VALUES (3, 1, NULL, NULL, 1, 'PENDENTE', '100.00', 'Pedido com 1 itens do carrinho', '2025-08-19T03:13:16.290Z', '2025-08-19T03:13:16.290Z', 'PED-1755573196289');
INSERT INTO public.pedidos (id, usuario_id, escola_id, contrato_id, fornecedor_id, status, valor_total, observacoes, created_at, updated_at, numero_pedido) VALUES (4, 1, NULL, NULL, 1, 'CONFIRMADO', '25000.00', 'Pedido com 1 itens do carrinho', '2025-08-19T03:20:53.426Z', '2025-08-19T03:20:57.803Z', 'PED-1755573653425');

-- Tabela: pedidos_faturamentos_controle
DROP TABLE IF EXISTS public.pedidos_faturamentos_controle CASCADE;
CREATE TABLE public.pedidos_faturamentos_controle (
    id INTEGER NOT NULL DEFAULT nextval('pedidos_faturamentos_controle_id_seq'::regclass),
    pedido_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    agrupamento_faturamento_id INTEGER,
    faturamento_id INTEGER,
    status VARCHAR(50) DEFAULT 'PENDENTE'::character varying,
    valor_pedido NUMERIC(15,2) DEFAULT 0,
    data_faturamento TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: pedidos_fornecedores
DROP TABLE IF EXISTS public.pedidos_fornecedores CASCADE;
CREATE TABLE public.pedidos_fornecedores (
    id INTEGER NOT NULL DEFAULT nextval('pedidos_fornecedores_id_seq'::regclass),
    pedido_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente'::character varying,
    valor_subtotal NUMERIC(10,2) DEFAULT 0,
    observacoes_fornecedor TEXT,
    data_confirmacao TIMESTAMP,
    data_envio TIMESTAMP,
    data_entrega TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela pedidos_fornecedores (4 registros)
INSERT INTO public.pedidos_fornecedores (id, pedido_id, fornecedor_id, status, valor_subtotal, observacoes_fornecedor, data_confirmacao, data_envio, data_entrega, created_at, updated_at) VALUES (27, 1, 1, 'PENDENTE', '500.00', NULL, NULL, NULL, NULL, '2025-08-19T02:51:28.545Z', '2025-08-19T02:51:28.545Z');
INSERT INTO public.pedidos_fornecedores (id, pedido_id, fornecedor_id, status, valor_subtotal, observacoes_fornecedor, data_confirmacao, data_envio, data_entrega, created_at, updated_at) VALUES (28, 2, 1, 'PENDENTE', '100.00', NULL, NULL, NULL, NULL, '2025-08-19T02:52:01.824Z', '2025-08-19T02:52:01.824Z');
INSERT INTO public.pedidos_fornecedores (id, pedido_id, fornecedor_id, status, valor_subtotal, observacoes_fornecedor, data_confirmacao, data_envio, data_entrega, created_at, updated_at) VALUES (29, 3, 1, 'PENDENTE', '100.00', NULL, NULL, NULL, NULL, '2025-08-19T03:13:16.294Z', '2025-08-19T03:13:16.294Z');
INSERT INTO public.pedidos_fornecedores (id, pedido_id, fornecedor_id, status, valor_subtotal, observacoes_fornecedor, data_confirmacao, data_envio, data_entrega, created_at, updated_at) VALUES (30, 4, 1, 'PENDENTE', '25000.00', NULL, NULL, NULL, NULL, '2025-08-19T03:20:53.465Z', '2025-08-19T03:20:53.465Z');

-- Tabela: pedidos_historico
DROP TABLE IF EXISTS public.pedidos_historico CASCADE;
CREATE TABLE public.pedidos_historico (
    id INTEGER NOT NULL DEFAULT nextval('pedidos_historico_id_seq'::regclass),
    pedido_id INTEGER NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    observacoes TEXT,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alterado_por INTEGER
);

-- Tabela: pedidos_itens
DROP TABLE IF EXISTS public.pedidos_itens CASCADE;
CREATE TABLE public.pedidos_itens (
    id INTEGER NOT NULL DEFAULT nextval('pedidos_itens_id_seq'::regclass),
    pedido_fornecedor_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    contrato_id INTEGER,
    quantidade NUMERIC(10,3) NOT NULL,
    preco_unitario NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    observacoes_item TEXT,
    data_entrega_prevista DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela pedidos_itens (4 registros)
INSERT INTO public.pedidos_itens (id, pedido_fornecedor_id, produto_id, contrato_id, quantidade, preco_unitario, subtotal, observacoes_item, data_entrega_prevista, created_at, updated_at) VALUES (1, 27, 8, 1, '500.000', '1.00', '500.00', NULL, NULL, '2025-08-19T02:51:28.550Z', '2025-08-19T02:51:28.550Z');
INSERT INTO public.pedidos_itens (id, pedido_fornecedor_id, produto_id, contrato_id, quantidade, preco_unitario, subtotal, observacoes_item, data_entrega_prevista, created_at, updated_at) VALUES (2, 28, 8, 1, '100.000', '1.00', '100.00', NULL, NULL, '2025-08-19T02:52:01.825Z', '2025-08-19T02:52:01.825Z');
INSERT INTO public.pedidos_itens (id, pedido_fornecedor_id, produto_id, contrato_id, quantidade, preco_unitario, subtotal, observacoes_item, data_entrega_prevista, created_at, updated_at) VALUES (3, 29, 8, 1, '100.000', '1.00', '100.00', NULL, NULL, '2025-08-19T03:13:16.304Z', '2025-08-19T03:13:16.304Z');
INSERT INTO public.pedidos_itens (id, pedido_fornecedor_id, produto_id, contrato_id, quantidade, preco_unitario, subtotal, observacoes_item, data_entrega_prevista, created_at, updated_at) VALUES (4, 30, 5, 1, '1000.000', '25.00', '25000.00', NULL, NULL, '2025-08-19T03:20:53.468Z', '2025-08-19T03:20:53.468Z');

-- Tabela: presets_rotas
DROP TABLE IF EXISTS public.presets_rotas CASCADE;
CREATE TABLE public.presets_rotas (
    id INTEGER NOT NULL DEFAULT nextval('presets_rotas_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor_padrao VARCHAR(7) NOT NULL DEFAULT '#1976d2'::character varying,
    icone_padrao VARCHAR(10) NOT NULL DEFAULT '🚌'::character varying,
    configuracao_padrao TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_por INTEGER NOT NULL DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela presets_rotas (4 registros)
INSERT INTO public.presets_rotas (id, nome, descricao, cor_padrao, icone_padrao, configuracao_padrao, ativo, criado_por, data_criacao) VALUES (1, 'Rota Urbana', 'Preset para rotas dentro da cidade', '#1976d2', '🚌', '{"tempo_estimado_por_escola":15,"distancia_maxima_entre_escolas":10,"horario_inicio_padrao":"07:00","tipo_veiculo":"onibus"}', TRUE, 1, '2025-08-13T23:39:28.416Z');
INSERT INTO public.presets_rotas (id, nome, descricao, cor_padrao, icone_padrao, configuracao_padrao, ativo, criado_por, data_criacao) VALUES (2, 'Rota Rural', 'Preset para rotas em áreas rurais', '#388e3c', '🚐', '{"tempo_estimado_por_escola":25,"distancia_maxima_entre_escolas":25,"horario_inicio_padrao":"06:30","tipo_veiculo":"van"}', TRUE, 1, '2025-08-13T23:39:28.418Z');
INSERT INTO public.presets_rotas (id, nome, descricao, cor_padrao, icone_padrao, configuracao_padrao, ativo, criado_por, data_criacao) VALUES (3, 'Rota Expressa', 'Preset para rotas rápidas com poucas paradas', '#f57c00', '🚛', '{"tempo_estimado_por_escola":10,"distancia_maxima_entre_escolas":15,"horario_inicio_padrao":"08:00","tipo_veiculo":"caminhao"}', TRUE, 1, '2025-08-13T23:39:28.420Z');
INSERT INTO public.presets_rotas (id, nome, descricao, cor_padrao, icone_padrao, configuracao_padrao, ativo, criado_por, data_criacao) VALUES (4, 'Rota Especial', 'Preset para rotas com necessidades especiais', '#7b1fa2', '🚑', '{"tempo_estimado_por_escola":20,"distancia_maxima_entre_escolas":12,"horario_inicio_padrao":"07:30","tipo_veiculo":"especial","acessibilidade":true}', TRUE, 1, '2025-08-13T23:39:28.422Z');

-- Tabela: produto_modalidades
DROP TABLE IF EXISTS public.produto_modalidades CASCADE;
CREATE TABLE public.produto_modalidades (
    id INTEGER NOT NULL DEFAULT nextval('produto_modalidades_id_seq'::regclass),
    produto_id INTEGER NOT NULL,
    modalidade_id INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela produto_modalidades (66 registros)
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (1, 2, 1, TRUE, '2025-08-15T18:05:14.954Z', '2025-08-15T18:05:14.954Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (2, 2, 2, TRUE, '2025-08-15T18:05:14.965Z', '2025-08-15T18:05:14.965Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (3, 2, 3, TRUE, '2025-08-15T18:05:14.966Z', '2025-08-15T18:05:14.966Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (4, 2, 4, TRUE, '2025-08-15T18:05:14.967Z', '2025-08-15T18:05:14.967Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (5, 2, 6, TRUE, '2025-08-15T18:05:14.968Z', '2025-08-15T18:05:14.968Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (6, 2, 7, TRUE, '2025-08-15T18:05:14.970Z', '2025-08-15T18:05:14.970Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (7, 2, 9, TRUE, '2025-08-15T18:05:14.971Z', '2025-08-15T18:05:14.971Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (8, 2, 10, TRUE, '2025-08-15T18:05:14.972Z', '2025-08-15T18:05:14.972Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (9, 3, 1, TRUE, '2025-08-15T18:05:14.973Z', '2025-08-15T18:05:14.973Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (10, 3, 2, TRUE, '2025-08-15T18:05:14.974Z', '2025-08-15T18:05:14.974Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (11, 3, 3, TRUE, '2025-08-15T18:05:14.975Z', '2025-08-15T18:05:14.975Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (12, 3, 4, TRUE, '2025-08-15T18:05:14.976Z', '2025-08-15T18:05:14.976Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (13, 3, 6, TRUE, '2025-08-15T18:05:14.978Z', '2025-08-15T18:05:14.978Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (14, 3, 7, TRUE, '2025-08-15T18:05:14.979Z', '2025-08-15T18:05:14.979Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (15, 3, 9, TRUE, '2025-08-15T18:05:14.980Z', '2025-08-15T18:05:14.980Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (16, 3, 10, TRUE, '2025-08-15T18:05:14.981Z', '2025-08-15T18:05:14.981Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (17, 4, 10, TRUE, '2025-08-15T18:05:14.982Z', '2025-08-15T18:05:14.982Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (18, 4, 11, TRUE, '2025-08-15T18:05:14.983Z', '2025-08-15T18:05:14.983Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (19, 5, 1, TRUE, '2025-08-15T18:05:14.985Z', '2025-08-15T18:05:14.985Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (20, 5, 2, TRUE, '2025-08-15T18:05:14.986Z', '2025-08-15T18:05:14.986Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (21, 5, 3, TRUE, '2025-08-15T18:05:14.987Z', '2025-08-15T18:05:14.987Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (22, 5, 4, TRUE, '2025-08-15T18:05:14.988Z', '2025-08-15T18:05:14.988Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (23, 5, 6, TRUE, '2025-08-15T18:05:14.989Z', '2025-08-15T18:05:14.989Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (24, 5, 7, TRUE, '2025-08-15T18:05:14.990Z', '2025-08-15T18:05:14.990Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (25, 5, 9, TRUE, '2025-08-15T18:05:14.991Z', '2025-08-15T18:05:14.991Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (26, 5, 10, TRUE, '2025-08-15T18:05:14.992Z', '2025-08-15T18:05:14.992Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (27, 6, 1, TRUE, '2025-08-15T18:05:14.993Z', '2025-08-15T18:05:14.993Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (28, 6, 2, TRUE, '2025-08-15T18:05:14.995Z', '2025-08-15T18:05:14.995Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (29, 6, 3, TRUE, '2025-08-15T18:05:14.996Z', '2025-08-15T18:05:14.996Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (30, 6, 4, TRUE, '2025-08-15T18:05:14.997Z', '2025-08-15T18:05:14.997Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (31, 6, 6, TRUE, '2025-08-15T18:05:14.999Z', '2025-08-15T18:05:14.999Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (32, 6, 7, TRUE, '2025-08-15T18:05:15.000Z', '2025-08-15T18:05:15.000Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (33, 6, 9, TRUE, '2025-08-15T18:05:15.001Z', '2025-08-15T18:05:15.001Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (34, 6, 10, TRUE, '2025-08-15T18:05:15.002Z', '2025-08-15T18:05:15.002Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (35, 7, 1, TRUE, '2025-08-15T18:05:15.003Z', '2025-08-15T18:05:15.003Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (36, 7, 2, TRUE, '2025-08-15T18:05:15.004Z', '2025-08-15T18:05:15.004Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (37, 7, 3, TRUE, '2025-08-15T18:05:15.005Z', '2025-08-15T18:05:15.005Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (38, 7, 4, TRUE, '2025-08-15T18:05:15.007Z', '2025-08-15T18:05:15.007Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (39, 7, 6, TRUE, '2025-08-15T18:05:15.008Z', '2025-08-15T18:05:15.008Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (40, 7, 7, TRUE, '2025-08-15T18:05:15.009Z', '2025-08-15T18:05:15.009Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (41, 7, 9, TRUE, '2025-08-15T18:05:15.010Z', '2025-08-15T18:05:15.010Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (42, 7, 10, TRUE, '2025-08-15T18:05:15.012Z', '2025-08-15T18:05:15.012Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (43, 8, 1, TRUE, '2025-08-15T18:05:15.014Z', '2025-08-15T18:05:15.014Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (44, 8, 2, TRUE, '2025-08-15T18:05:15.015Z', '2025-08-15T18:05:15.015Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (45, 8, 3, TRUE, '2025-08-15T18:05:15.016Z', '2025-08-15T18:05:15.016Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (46, 8, 4, TRUE, '2025-08-15T18:05:15.017Z', '2025-08-15T18:05:15.017Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (47, 8, 6, TRUE, '2025-08-15T18:05:15.018Z', '2025-08-15T18:05:15.018Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (48, 8, 7, TRUE, '2025-08-15T18:05:15.020Z', '2025-08-15T18:05:15.020Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (49, 8, 9, TRUE, '2025-08-15T18:05:15.021Z', '2025-08-15T18:05:15.021Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (50, 8, 10, TRUE, '2025-08-15T18:05:15.022Z', '2025-08-15T18:05:15.022Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (51, 9, 1, TRUE, '2025-08-15T18:05:15.023Z', '2025-08-15T18:05:15.023Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (52, 9, 2, TRUE, '2025-08-15T18:05:15.025Z', '2025-08-15T18:05:15.025Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (53, 9, 3, TRUE, '2025-08-15T18:05:15.026Z', '2025-08-15T18:05:15.026Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (54, 9, 4, TRUE, '2025-08-15T18:05:15.027Z', '2025-08-15T18:05:15.027Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (55, 9, 6, TRUE, '2025-08-15T18:05:15.029Z', '2025-08-15T18:05:15.029Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (56, 9, 7, TRUE, '2025-08-15T18:05:15.030Z', '2025-08-15T18:05:15.030Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (57, 9, 9, TRUE, '2025-08-15T18:05:15.031Z', '2025-08-15T18:05:15.031Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (58, 9, 10, TRUE, '2025-08-15T18:05:15.032Z', '2025-08-15T18:05:15.032Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (59, 10, 1, TRUE, '2025-08-15T18:05:15.033Z', '2025-08-15T18:05:15.033Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (60, 10, 2, TRUE, '2025-08-15T18:05:15.034Z', '2025-08-15T18:05:15.034Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (61, 10, 3, TRUE, '2025-08-15T18:05:15.035Z', '2025-08-15T18:05:15.035Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (62, 10, 4, TRUE, '2025-08-15T18:05:15.036Z', '2025-08-15T18:05:15.036Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (63, 10, 6, TRUE, '2025-08-15T18:05:15.037Z', '2025-08-15T18:05:15.037Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (64, 10, 7, TRUE, '2025-08-15T18:05:15.038Z', '2025-08-15T18:05:15.038Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (65, 10, 9, TRUE, '2025-08-15T18:05:15.040Z', '2025-08-15T18:05:15.040Z');
INSERT INTO public.produto_modalidades (id, produto_id, modalidade_id, ativo, created_at, updated_at) VALUES (66, 10, 10, TRUE, '2025-08-15T18:05:15.042Z', '2025-08-15T18:05:15.042Z');

-- Tabela: produtos
DROP TABLE IF EXISTS public.produtos CASCADE;
CREATE TABLE public.produtos (
    id INTEGER NOT NULL DEFAULT nextval('produtos_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    unidade VARCHAR(50) NOT NULL DEFAULT 'UN'::character varying,
    fator_divisao NUMERIC(10,4) DEFAULT 1.0000,
    tipo_processamento VARCHAR(100),
    categoria VARCHAR(100),
    marca VARCHAR(100),
    codigo_barras VARCHAR(100),
    peso NUMERIC(10,3),
    validade_minima INTEGER,
    imagem_url TEXT,
    perecivel BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preco_referencia NUMERIC(10,2) DEFAULT NULL::numeric,
    estoque_minimo INTEGER DEFAULT 0
);

-- Dados da tabela produtos (12 registros)
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (7, 'Ovos', '', 'unidade', '0.0500', '', 'Proteínas', 'GAASA', '', '0.050', NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.315Z', '2025-08-13T23:38:13.315Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (10, 'Pão Francês', '', 'unidade', '1.0000', '', 'Panificados', '', '', NULL, NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.321Z', '2025-08-13T23:38:13.321Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (9, 'Tomate', '', 'kg', '1.0000', '', 'Hortaliças', '', '', NULL, NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.319Z', '2025-08-13T23:38:13.319Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (31, 'Uva', '', 'kg', '1.0000', '', 'Hortaliças', '', '', NULL, NULL, '', FALSE, TRUE, '2025-08-27T01:23:06.171Z', '2025-08-27T01:23:06.171Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (33, 'Maçã', 'Maçã vermelha fresca', 'kg', '1.0000', NULL, 'Frutas', NULL, NULL, NULL, NULL, NULL, FALSE, TRUE, '2025-08-27T01:30:37.230Z', '2025-08-27T01:30:37.230Z', NULL, 0);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (1, 'Arroz Branco', '', 'kg', '1.0000', '', 'Cereais', 'ACOSTUMADO', '', NULL, NULL, '', FALSE, TRUE, '2025-08-17T21:07:07.528Z', '2025-08-17T21:07:07.528Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (8, 'Banana', '', 'kg', '1.0000', '', 'Frutas', 'In natura', '', NULL, NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.317Z', '2025-08-13T23:38:13.317Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (5, 'Carne Bovina Moída', '', 'Pacote 500g', '0.5000', '', 'Carnes', 'Mafrinorte', '', '0.500', NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.312Z', '2025-08-18T01:34:46.607Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (2, 'Feijão Carioca', '', 'kg', '1.0000', '', 'Leguminosas', '', '', NULL, NULL, '', FALSE, TRUE, '2025-08-13T23:38:13.307Z', '2025-08-13T23:38:13.307Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (6, 'Frango', '', 'kg', '1.0000', '', 'Carnes', '', '', NULL, NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.313Z', '2025-08-13T23:38:13.313Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (4, 'Leite Integral', '', 'litro', '1.0000', '', 'Laticínios', '', '', NULL, NULL, '', TRUE, TRUE, '2025-08-13T23:38:13.310Z', '2025-08-13T23:38:13.310Z', NULL, 10);
INSERT INTO public.produtos (id, nome, descricao, unidade, fator_divisao, tipo_processamento, categoria, marca, codigo_barras, peso, validade_minima, imagem_url, perecivel, ativo, created_at, updated_at, preco_referencia, estoque_minimo) VALUES (3, 'Óleo de Soja', '', 'litro', '1.0000', '', 'Óleos', '', '', NULL, NULL, '', FALSE, TRUE, '2025-08-13T23:38:13.308Z', '2025-08-13T23:38:13.308Z', NULL, 10);

-- Tabela: recebimentos_simples
DROP TABLE IF EXISTS public.recebimentos_simples CASCADE;
CREATE TABLE public.recebimentos_simples (
    id INTEGER NOT NULL DEFAULT nextval('recebimentos_simples_id_seq'::regclass),
    pedido_item_id INTEGER NOT NULL,
    quantidade_recebida NUMERIC NOT NULL,
    numero_lote VARCHAR(100),
    data_validade DATE,
    observacoes TEXT,
    usuario_id INTEGER DEFAULT 1,
    data_recebimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela recebimentos_simples (11 registros)
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (47, 8, '250', 'LOTE-1755461091919', '2025-08-30T03:00:00.000Z', NULL, 1, '2025-08-17T20:04:51.932Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (48, 8, '250', 'LOTE-1755461361342', '2025-08-30T03:00:00.000Z', NULL, 1, '2025-08-17T20:09:21.375Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (49, 1, '500', 'LOTE-1755569707877', '2025-08-30T03:00:00.000Z', NULL, 1, '2025-08-19T02:15:08.204Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (50, 7, '5', 'LOTE-1755570294234', '2025-08-27T03:00:00.000Z', NULL, 1, '2025-08-19T02:24:54.249Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (51, 8, '5', NULL, NULL, 'Teste de recebimento do fluxo completo', 1, '2025-08-19T02:26:50.443Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (52, 9, '5', NULL, NULL, 'Teste de recebimento do fluxo completo', 1, '2025-08-19T02:27:11.368Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (53, 10, '5', NULL, NULL, 'Teste de recebimento do fluxo completo', 1, '2025-08-19T02:27:33.023Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (54, 11, '5', NULL, NULL, 'Teste de recebimento do fluxo completo', 1, '2025-08-19T02:28:07.962Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (55, 2, '70', NULL, NULL, 'Recebimento parcial de demonstração - 70/100.000 kg', 1, '2025-08-19T03:11:07.219Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (56, 2, '30', 'LOTE-1755573120123', '2025-08-30T03:00:00.000Z', NULL, 1, '2025-08-19T03:12:00.135Z');
INSERT INTO public.recebimentos_simples (id, pedido_item_id, quantidade_recebida, numero_lote, data_validade, observacoes, usuario_id, data_recebimento) VALUES (57, 4, '500', 'LOTE-1755573671576', '2025-08-30T03:00:00.000Z', NULL, 1, '2025-08-19T03:21:11.588Z');

-- Tabela: refeicao_produtos
DROP TABLE IF EXISTS public.refeicao_produtos CASCADE;
CREATE TABLE public.refeicao_produtos (
    id INTEGER NOT NULL DEFAULT nextval('refeicao_produtos_id_seq'::regclass),
    refeicao_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    per_capita NUMERIC(10,3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_medida VARCHAR(20) DEFAULT 'gramas'::character varying,
    observacoes TEXT
);

-- Dados da tabela refeicao_produtos (3 registros)
INSERT INTO public.refeicao_produtos (id, refeicao_id, produto_id, per_capita, created_at, updated_at, tipo_medida, observacoes) VALUES (30, 1, 2, '30.000', '2025-08-23T18:01:12.572Z', '2025-08-23T18:02:00.718Z', 'gramas', NULL);
INSERT INTO public.refeicao_produtos (id, refeicao_id, produto_id, per_capita, created_at, updated_at, tipo_medida, observacoes) VALUES (28, 1, 1, '4.001', '2025-08-23T18:01:02.873Z', '2025-08-25T03:22:16.440Z', 'gramas', NULL);
INSERT INTO public.refeicao_produtos (id, refeicao_id, produto_id, per_capita, created_at, updated_at, tipo_medida, observacoes) VALUES (31, 1, 5, '4.000', '2025-08-23T19:39:29.680Z', '2025-08-23T19:48:25.822Z', 'gramas', NULL);

-- Tabela: refeicoes
DROP TABLE IF EXISTS public.refeicoes CASCADE;
CREATE TABLE public.refeicoes (
    id INTEGER NOT NULL DEFAULT nextval('refeicoes_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela refeicoes (1 registros)
INSERT INTO public.refeicoes (id, nome, descricao, tipo, ativo, created_at, updated_at) VALUES (1, 'Baião de dois', NULL, 'almoco', TRUE, '2025-08-20T19:40:06.735Z', '2025-08-22T19:50:22.176Z');

-- Tabela: rotas
DROP TABLE IF EXISTS public.rotas CASCADE;
CREATE TABLE public.rotas (
    id INTEGER NOT NULL DEFAULT nextval('rotas_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) NOT NULL DEFAULT '#1976d2'::character varying,
    cor_secundaria VARCHAR(7),
    icone VARCHAR(10) NOT NULL DEFAULT '🚌'::character varying,
    ativa BOOLEAN DEFAULT true,
    tipo VARCHAR(20) NOT NULL DEFAULT 'personalizada'::character varying,
    preset_id INTEGER,
    configuracao TEXT,
    criado_por INTEGER NOT NULL DEFAULT 1,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: schema_migrations
DROP TABLE IF EXISTS public.schema_migrations CASCADE;
CREATE TABLE public.schema_migrations (
    id INTEGER NOT NULL DEFAULT nextval('schema_migrations_id_seq'::regclass),
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela schema_migrations (1 registros)
INSERT INTO public.schema_migrations (id, migration_name, executed_at) VALUES (1, '009_consolidar_estrutura_pedidos', '2025-08-17T18:08:36.055Z');

-- Tabela: usuarios
DROP TABLE IF EXISTS public.usuarios CASCADE;
CREATE TABLE public.usuarios (
    id INTEGER NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'USUARIO'::character varying,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dados da tabela usuarios (2 registros)
INSERT INTO public.usuarios (id, nome, email, senha, tipo, ativo, created_at, updated_at) VALUES (1, 'Administrador', 'admin@sistema.com', '$2b$10$rQZ8kHWKtGkVQZ8kHWKtGOuKQZ8kHWKtGkVQZ8kHWKtGkVQZ8kHWKt', 'ADMIN', TRUE, '2025-08-13T23:49:41.366Z', '2025-08-13T23:49:41.366Z');
INSERT INTO public.usuarios (id, nome, email, senha, tipo, ativo, created_at, updated_at) VALUES (2, 'Ewerton Nunes', 'ewenunes0@gmail.com', '$2a$10$KKR/RixGLaGjiRLyYj75t.rbOy1k9WzCP.p//ASdnW0WezRRS95Mm', 'gestor', TRUE, '2025-08-16T01:35:55.346Z', '2025-08-16T01:35:55.346Z');


-- Configurações de segurança Supabase
-- Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de exemplo (descomente se necessário)
-- CREATE POLICY "Usuários podem ver próprios dados" ON public.usuarios
--   FOR SELECT USING (auth.uid() = id::text);

-- Commit das mudanças
COMMIT;
