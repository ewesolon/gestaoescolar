-- Script de migração completa do banco local para Supabase

-- Tabela: aditivos_contratos
CREATE TABLE IF NOT EXISTS aditivos_contratos (
  id SERIAL NOT NULL,
  contrato_id INTEGER NOT NULL,
  numero_aditivo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  data_assinatura DATE NOT NULL,
  data_inicio_vigencia DATE NOT NULL,
  data_fim_vigencia DATE,
  prazo_adicional_dias INTEGER,
  nova_data_fim DATE,
  percentual_acrescimo DECIMAL(5,2),
  valor_original DECIMAL(15,2),
  valor_aditivo DECIMAL(15,2),
  valor_total_atualizado DECIMAL(15,2),
  justificativa TEXT NOT NULL,
  fundamentacao_legal TEXT NOT NULL,
  numero_processo VARCHAR(100),
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true NOT NULL,
  criado_por INTEGER NOT NULL,
  aprovado_por INTEGER,
  data_aprovacao TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id),
  FOREIGN KEY (aprovado_por) REFERENCES usuarios(id)
);

-- Tabela: aditivos_contratos_itens
CREATE TABLE IF NOT EXISTS aditivos_contratos_itens (
  id SERIAL NOT NULL,
  aditivo_id INTEGER NOT NULL,
  contrato_produto_id INTEGER NOT NULL,
  quantidade_original DECIMAL(15,3) NOT NULL,
  percentual_acrescimo DECIMAL(5,2) NOT NULL,
  quantidade_adicional DECIMAL(15,3) NOT NULL,
  quantidade_nova DECIMAL(15,3) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_adicional DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (aditivo_id) REFERENCES aditivos_contratos(id),
  FOREIGN KEY (contrato_produto_id) REFERENCES contrato_produtos(id),
  UNIQUE (aditivo_id),
  UNIQUE (aditivo_id),
  UNIQUE (contrato_produto_id),
  UNIQUE (contrato_produto_id)
);

-- Tabela: agrupamentos_faturamentos
CREATE TABLE IF NOT EXISTS agrupamentos_faturamentos (
  id SERIAL NOT NULL,
  agrupamento_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDENTE'::character varying,
  valor_total DECIMAL(15,2) DEFAULT 0,
  valor_faturado DECIMAL(15,2) DEFAULT 0,
  total_pedidos INTEGER DEFAULT 0,
  pedidos_faturados INTEGER DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (agrupamento_id) REFERENCES agrupamentos_mensais(id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  UNIQUE (agrupamento_id),
  UNIQUE (agrupamento_id),
  UNIQUE (fornecedor_id),
  UNIQUE (fornecedor_id)
);

-- Tabela: agrupamentos_mensais
CREATE TABLE IF NOT EXISTS agrupamentos_mensais (
  id SERIAL NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  descricao VARCHAR(255),
  status VARCHAR(50) DEFAULT 'ATIVO'::character varying,
  total_pedidos INTEGER DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criado_por INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id),
  UNIQUE (ano),
  UNIQUE (ano),
  UNIQUE (mes),
  UNIQUE (mes)
);

-- Tabela: agrupamentos_pedidos
CREATE TABLE IF NOT EXISTS agrupamentos_pedidos (
  id SERIAL NOT NULL,
  agrupamento_id INTEGER NOT NULL,
  pedido_id INTEGER NOT NULL,
  data_vinculacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (agrupamento_id) REFERENCES agrupamentos_mensais(id),
  UNIQUE (pedido_id)
);

-- Tabela: alertas
CREATE TABLE IF NOT EXISTS alertas (
  id SERIAL NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  nivel VARCHAR(20) DEFAULT 'INFO'::character varying NOT NULL,
  ativo BOOLEAN DEFAULT true,
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_fim TIMESTAMP,
  usuario_criacao INTEGER,
  dados_extras JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_criacao) REFERENCES usuarios(id)
);

-- Tabela: calculos_entrega
CREATE TABLE IF NOT EXISTS calculos_entrega (
  id SERIAL NOT NULL,
  nome_calculo VARCHAR(200) NOT NULL,
  descricao TEXT,
  data_calculo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  periodo_inicio DATE,
  periodo_fim DATE,
  status VARCHAR(50) DEFAULT 'calculado'::character varying,
  observacoes TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Tabela: calculos_resultados
CREATE TABLE IF NOT EXISTS calculos_resultados (
  id SERIAL NOT NULL,
  calculo_id INTEGER NOT NULL,
  escola_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade_calculada DECIMAL(12,4) NOT NULL,
  quantidade_ajustada DECIMAL(12,4),
  observacoes_ajuste TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (calculo_id) REFERENCES calculos_entrega(id),
  FOREIGN KEY (escola_id) REFERENCES escolas(id),
  UNIQUE (calculo_id),
  UNIQUE (calculo_id),
  UNIQUE (calculo_id),
  UNIQUE (escola_id),
  UNIQUE (escola_id),
  UNIQUE (escola_id),
  UNIQUE (produto_id),
  UNIQUE (produto_id),
  UNIQUE (produto_id)
);

-- Tabela: cardapio_refeicoes
CREATE TABLE IF NOT EXISTS cardapio_refeicoes (
  id SERIAL NOT NULL,
  cardapio_id INTEGER NOT NULL,
  refeicao_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  frequencia_mensal INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (cardapio_id) REFERENCES cardapios(id),
  FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id),
  FOREIGN KEY (modalidade_id) REFERENCES modalidades(id),
  UNIQUE (cardapio_id),
  UNIQUE (cardapio_id),
  UNIQUE (cardapio_id),
  UNIQUE (refeicao_id),
  UNIQUE (refeicao_id),
  UNIQUE (refeicao_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id)
);

-- Tabela: cardapios
CREATE TABLE IF NOT EXISTS cardapios (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  periodo_dias INTEGER DEFAULT 30 NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modalidade_id INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (modalidade_id) REFERENCES modalidades(id)
);

-- Tabela: carrinho_itens
CREATE TABLE IF NOT EXISTS carrinho_itens (
  id SERIAL NOT NULL,
  usuario_id INTEGER DEFAULT 1,
  produto_id INTEGER NOT NULL,
  contrato_id INTEGER,
  fornecedor_id INTEGER,
  quantidade DECIMAL NOT NULL,
  preco_unitario DECIMAL NOT NULL,
  subtotal DECIMAL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Tabela: contrato_produtos
CREATE TABLE IF NOT EXISTS contrato_produtos (
  id SERIAL NOT NULL,
  contrato_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  quantidade_maxima DECIMAL(15,3),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  limite DECIMAL(15,2),
  preco DECIMAL(10,2),
  saldo DECIMAL(15,2),
  PRIMARY KEY (id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  UNIQUE (contrato_id),
  UNIQUE (contrato_id),
  UNIQUE (produto_id),
  UNIQUE (produto_id)
);

-- Tabela: contratos
CREATE TABLE IF NOT EXISTS contratos (
  id SERIAL NOT NULL,
  numero VARCHAR(100) NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  valor_total DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ATIVO'::character varying,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT true,
  descricao TEXT,
  objeto TEXT,
  modalidade VARCHAR(100),
  numero_processo VARCHAR(50),
  PRIMARY KEY (id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  UNIQUE (numero)
);

-- Tabela: escola_modalidades
CREATE TABLE IF NOT EXISTS escola_modalidades (
  id SERIAL NOT NULL,
  escola_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  quantidade_alunos INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (escola_id) REFERENCES escolas(id),
  FOREIGN KEY (modalidade_id) REFERENCES modalidades(id),
  UNIQUE (escola_id),
  UNIQUE (escola_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id)
);

-- Tabela: escolas
CREATE TABLE IF NOT EXISTS escolas (
  id SERIAL NOT NULL,
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
  codigo_acesso VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (codigo_acesso)
);

-- Tabela: escolas_modalidades
CREATE TABLE IF NOT EXISTS escolas_modalidades (
  id SERIAL NOT NULL,
  escola_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  quantidade_alunos INTEGER DEFAULT 0 NOT NULL,
  ano_letivo INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (escola_id) REFERENCES escolas(id),
  UNIQUE (escola_id),
  UNIQUE (escola_id),
  UNIQUE (escola_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id),
  UNIQUE (ano_letivo),
  UNIQUE (ano_letivo),
  UNIQUE (ano_letivo)
);

-- Tabela: estoque_alertas
CREATE TABLE IF NOT EXISTS estoque_alertas (
  id SERIAL NOT NULL,
  produto_id INTEGER NOT NULL,
  lote_id INTEGER,
  tipo VARCHAR(30) NOT NULL,
  nivel VARCHAR(20) NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  data_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visualizado BOOLEAN DEFAULT false,
  resolvido BOOLEAN DEFAULT false,
  PRIMARY KEY (id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (lote_id) REFERENCES estoque_lotes(id)
);

-- Tabela: estoque_escolas
CREATE TABLE IF NOT EXISTS estoque_escolas (
  id SERIAL NOT NULL,
  escola_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  quantidade_atual DECIMAL(10,3) DEFAULT 0 NOT NULL,
  quantidade_minima DECIMAL(10,3) DEFAULT 0,
  quantidade_maxima DECIMAL(10,3) DEFAULT 0,
  data_ultima_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_ultima_atualizacao INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (escola_id) REFERENCES escolas(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (usuario_ultima_atualizacao) REFERENCES usuarios(id),
  UNIQUE (escola_id),
  UNIQUE (escola_id),
  UNIQUE (produto_id),
  UNIQUE (produto_id)
);

-- Tabela: estoque_escolas_historico
CREATE TABLE IF NOT EXISTS estoque_escolas_historico (
  id SERIAL NOT NULL,
  estoque_escola_id INTEGER,
  escola_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  tipo_movimentacao VARCHAR(20) NOT NULL,
  quantidade_anterior DECIMAL(10,3) DEFAULT 0 NOT NULL,
  quantidade_movimentada DECIMAL(10,3) NOT NULL,
  quantidade_posterior DECIMAL(10,3) DEFAULT 0 NOT NULL,
  motivo TEXT,
  documento_referencia TEXT,
  usuario_id INTEGER,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (estoque_escola_id) REFERENCES estoque_escolas(id),
  FOREIGN KEY (escola_id) REFERENCES escolas(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela: estoque_lotes
CREATE TABLE IF NOT EXISTS estoque_lotes (
  id SERIAL NOT NULL,
  produto_id INTEGER NOT NULL,
  lote TEXT NOT NULL,
  quantidade_inicial DECIMAL(10,3) DEFAULT 0 NOT NULL,
  quantidade_atual DECIMAL(10,3) DEFAULT 0 NOT NULL,
  data_fabricacao DATE,
  data_validade DATE,
  fornecedor_id INTEGER,
  recebimento_id INTEGER,
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'ativo'::character varying NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  UNIQUE (produto_id),
  UNIQUE (produto_id),
  UNIQUE (lote),
  UNIQUE (lote)
);

-- Tabela: estoque_movimentacoes
CREATE TABLE IF NOT EXISTS estoque_movimentacoes (
  id SERIAL NOT NULL,
  lote_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  quantidade DECIMAL(10,3) NOT NULL,
  quantidade_anterior DECIMAL(10,3) NOT NULL,
  quantidade_posterior DECIMAL(10,3) NOT NULL,
  motivo TEXT NOT NULL,
  documento_referencia TEXT,
  usuario_id INTEGER NOT NULL,
  data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observacoes TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (lote_id) REFERENCES estoque_lotes(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- Tabela: faturamento_itens
CREATE TABLE IF NOT EXISTS faturamento_itens (
  id SERIAL NOT NULL,
  faturamento_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  quantidade_recebida DECIMAL(15,3) NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  data_recebimento TIMESTAMP NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (faturamento_id) REFERENCES faturamentos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  FOREIGN KEY (modalidade_id) REFERENCES modalidades(id)
);

-- Tabela: faturamento_itens_modalidades
CREATE TABLE IF NOT EXISTS faturamento_itens_modalidades (
  id SERIAL NOT NULL,
  faturamento_id INTEGER NOT NULL,
  pedido_item_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  quantidade_original DECIMAL(10,3) NOT NULL,
  quantidade_modalidade DECIMAL(10,3) NOT NULL,
  percentual_modalidade DECIMAL(5,2) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total_modalidade DECIMAL(12,2) NOT NULL,
  valor_repasse_modalidade DECIMAL(10,2) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (faturamento_id) REFERENCES faturamentos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (modalidade_id) REFERENCES modalidades(id),
  FOREIGN KEY (pedido_item_id) REFERENCES pedidos_itens(id)
);

-- Tabela: faturamentos
CREATE TABLE IF NOT EXISTS faturamentos (
  id SERIAL NOT NULL,
  numero_faturamento VARCHAR(100) NOT NULL,
  pedido_id INTEGER NOT NULL,
  fornecedor_id INTEGER,
  status VARCHAR(50) DEFAULT 'RASCUNHO'::character varying NOT NULL,
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  data_finalizacao TIMESTAMP,
  usuario_criador_id INTEGER NOT NULL,
  observacoes TEXT,
  valor_total_faturado DECIMAL(15,2) DEFAULT 0,
  total_itens_faturados INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  contrato_id INTEGER,
  is_parcial BOOLEAN DEFAULT false,
  PRIMARY KEY (id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  FOREIGN KEY (usuario_criador_id) REFERENCES usuarios(id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  UNIQUE (numero_faturamento)
);

-- Tabela: fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL NOT NULL,
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
  cep VARCHAR(10),
  PRIMARY KEY (id),
  UNIQUE (cnpj)
);

-- Tabela: modalidades
CREATE TABLE IF NOT EXISTS modalidades (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  valor_repasse DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (nome)
);

-- Tabela: movimentacoes_consumo_contratos
CREATE TABLE IF NOT EXISTS movimentacoes_consumo_contratos (
  id SERIAL NOT NULL,
  contrato_produto_id INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  quantidade_utilizada DECIMAL(10,3) NOT NULL,
  valor_utilizado DECIMAL(12,2),
  justificativa TEXT NOT NULL,
  data_movimentacao DATE NOT NULL,
  usuario_id INTEGER NOT NULL,
  observacoes TEXT,
  documento_referencia TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (contrato_produto_id) REFERENCES contrato_produtos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela: notificacoes_sistema
CREATE TABLE IF NOT EXISTS notificacoes_sistema (
  id SERIAL NOT NULL,
  usuario_id INTEGER,
  tipo VARCHAR(20) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  dados_extras JSONB DEFAULT '{}'::jsonb,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabela: pedido_itens_modalidades_config
CREATE TABLE IF NOT EXISTS pedido_itens_modalidades_config (
  id SERIAL NOT NULL,
  pedido_item_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  percentual_configurado DECIMAL(5,2),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (modalidade_id) REFERENCES modalidades(id),
  FOREIGN KEY (pedido_item_id) REFERENCES pedidos_itens(id),
  UNIQUE (pedido_item_id),
  UNIQUE (pedido_item_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id)
);

-- Tabela: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL NOT NULL,
  usuario_id INTEGER NOT NULL,
  escola_id INTEGER,
  contrato_id INTEGER,
  fornecedor_id INTEGER,
  status VARCHAR(50) DEFAULT 'pendente'::character varying,
  valor_total DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  numero_pedido VARCHAR(50),
  PRIMARY KEY (id),
  UNIQUE (numero_pedido)
);

-- Tabela: pedidos_faturamentos_controle
CREATE TABLE IF NOT EXISTS pedidos_faturamentos_controle (
  id SERIAL NOT NULL,
  pedido_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  agrupamento_faturamento_id INTEGER,
  faturamento_id INTEGER,
  status VARCHAR(50) DEFAULT 'PENDENTE'::character varying,
  valor_pedido DECIMAL(15,2) DEFAULT 0,
  data_faturamento TIMESTAMP,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  FOREIGN KEY (agrupamento_faturamento_id) REFERENCES agrupamentos_faturamentos(id),
  FOREIGN KEY (faturamento_id) REFERENCES faturamentos(id),
  UNIQUE (pedido_id),
  UNIQUE (pedido_id),
  UNIQUE (fornecedor_id),
  UNIQUE (fornecedor_id)
);

-- Tabela: pedidos_fornecedores
CREATE TABLE IF NOT EXISTS pedidos_fornecedores (
  id SERIAL NOT NULL,
  pedido_id INTEGER NOT NULL,
  fornecedor_id INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente'::character varying,
  valor_subtotal DECIMAL(10,2) DEFAULT 0,
  observacoes_fornecedor TEXT,
  data_confirmacao TIMESTAMP,
  data_envio TIMESTAMP,
  data_entrega TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Tabela: pedidos_historico
CREATE TABLE IF NOT EXISTS pedidos_historico (
  id SERIAL NOT NULL,
  pedido_id INTEGER NOT NULL,
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50) NOT NULL,
  observacoes TEXT,
  data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alterado_por INTEGER,
  PRIMARY KEY (id),
  FOREIGN KEY (alterado_por) REFERENCES usuarios(id),
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
);

-- Tabela: pedidos_itens
CREATE TABLE IF NOT EXISTS pedidos_itens (
  id SERIAL NOT NULL,
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
  PRIMARY KEY (id),
  FOREIGN KEY (pedido_fornecedor_id) REFERENCES pedidos_fornecedores(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

-- Tabela: presets_rotas
CREATE TABLE IF NOT EXISTS presets_rotas (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  cor_padrao VARCHAR(7) DEFAULT '#1976d2'::character varying NOT NULL,
  icone_padrao VARCHAR(10) DEFAULT '🚌'::character varying NOT NULL,
  configuracao_padrao TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_por INTEGER DEFAULT 1 NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (nome)
);

-- Tabela: produto_modalidades
CREATE TABLE IF NOT EXISTS produto_modalidades (
  id SERIAL NOT NULL,
  produto_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (produto_id),
  UNIQUE (produto_id),
  UNIQUE (modalidade_id),
  UNIQUE (modalidade_id)
);

-- Tabela: produtos
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  unidade VARCHAR(50) DEFAULT 'UN'::character varying NOT NULL,
  fator_divisao DECIMAL(10,4) DEFAULT 1.0000,
  tipo_processamento VARCHAR(100),
  categoria VARCHAR(100),
  marca VARCHAR(100),
  codigo_barras VARCHAR(100),
  peso DECIMAL(10,3),
  validade_minima INTEGER,
  imagem_url TEXT,
  perecivel BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  preco_referencia DECIMAL(10,2) DEFAULT NULL::numeric,
  estoque_minimo INTEGER DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE (nome)
);

-- Tabela: recebimentos_simples
CREATE TABLE IF NOT EXISTS recebimentos_simples (
  id SERIAL NOT NULL,
  pedido_item_id INTEGER NOT NULL,
  quantidade_recebida DECIMAL NOT NULL,
  numero_lote VARCHAR(100),
  data_validade DATE,
  observacoes TEXT,
  usuario_id INTEGER DEFAULT 1,
  data_recebimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Tabela: refeicao_produtos
CREATE TABLE IF NOT EXISTS refeicao_produtos (
  id SERIAL NOT NULL,
  refeicao_id INTEGER NOT NULL,
  produto_id INTEGER NOT NULL,
  per_capita DECIMAL(10,3) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo_medida VARCHAR(20) DEFAULT 'gramas'::character varying,
  observacoes TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id),
  UNIQUE (refeicao_id),
  UNIQUE (refeicao_id),
  UNIQUE (produto_id),
  UNIQUE (produto_id)
);

-- Tabela: refeicoes
CREATE TABLE IF NOT EXISTS refeicoes (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Tabela: rotas
CREATE TABLE IF NOT EXISTS rotas (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  cor VARCHAR(7) DEFAULT '#1976d2'::character varying NOT NULL,
  cor_secundaria VARCHAR(7),
  icone VARCHAR(10) DEFAULT '🚌'::character varying NOT NULL,
  ativa BOOLEAN DEFAULT true,
  tipo VARCHAR(20) DEFAULT 'personalizada'::character varying NOT NULL,
  preset_id INTEGER,
  configuracao TEXT,
  criado_por INTEGER DEFAULT 1 NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (preset_id) REFERENCES presets_rotas(id)
);

-- Tabela: schema_migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL NOT NULL,
  migration_name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (migration_name)
);

-- Tabela: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) DEFAULT 'USUARIO'::character varying,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE (email)
);

-- Dados da tabela: modalidades
INSERT INTO modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (1, 'Creche', 'Educação Infantil - Creche (0 a 3 anos)', true, '0.32', '2025-08-13T23:35:17.399Z', '2025-08-13T23:35:17.399Z') ON CONFLICT DO NOTHING;
INSERT INTO modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (3, 'Ensino Fundamental', 'Ensino Fundamental (6 a 14 anos)', true, '0.36', '2025-08-13T23:35:17.407Z', '2025-08-13T23:35:17.407Z') ON CONFLICT DO NOTHING;
INSERT INTO modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (4, 'Ensino Médio', 'Ensino Médio (15 a 17 anos)', true, '0.40', '2025-08-13T23:35:17.410Z', '2025-08-13T23:35:17.410Z') ON CONFLICT DO NOTHING;
INSERT INTO modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (5, 'EJA', 'Educação de Jovens e Adultos', true, '0.32', '2025-08-13T23:35:17.415Z', '2025-08-13T23:35:17.415Z') ON CONFLICT DO NOTHING;
INSERT INTO modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (6, 'Ensino Integral', 'Ensino em Tempo Integral', true, '1.07', '2025-08-13T23:35:17.417Z', '2025-08-13T23:35:17.417Z') ON CONFLICT DO NOTHING;
INSERT INTO modalidades (id, nome, descricao, ativo, valor_repasse, created_at, updated_at) VALUES (2, 'Pré-escola', 'Educação Infantil - Pré-escola (4 a 5 anos)', true, '320.00', '2025-08-13T23:35:17.404Z', '2025-08-15T17:13:27.745Z') ON CONFLICT DO NOTHING;

-- Dados da tabela: usuarios
INSERT INTO usuarios (id, nome, email, senha, tipo, ativo, created_at, updated_at) VALUES (1, 'Administrador', 'admin@sistema.com', '$2b$10$rQZ8kHWKtGkVQZ8kHWKtGOuKQZ8kHWKtGkVQZ8kHWKtGkVQZ8kHWKt', 'ADMIN', true, '2025-08-13T23:49:41.366Z', '2025-08-13T23:49:41.366Z') ON CONFLICT DO NOTHING;
INSERT INTO usuarios (id, nome, email, senha, tipo, ativo, created_at, updated_at) VALUES (2, 'Ewerton Nunes', 'ewenunes0@gmail.com', '$2a$10$KKR/RixGLaGjiRLyYj75t.rbOy1k9WzCP.p//ASdnW0WezRRS95Mm', 'gestor', true, '2025-08-16T01:35:55.346Z', '2025-08-16T01:35:55.346Z') ON CONFLICT DO NOTHING;

