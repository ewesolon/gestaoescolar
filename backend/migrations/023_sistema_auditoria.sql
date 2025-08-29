-- Migração: Sistema de Auditoria
-- Data: 2025-08-28
-- Descrição: Criação das tabelas para auditoria e logs do sistema

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS logs_auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao VARCHAR(50) NOT NULL,
    tabela VARCHAR(100) NOT NULL,
    registro_id INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para logs de auditoria
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_acao ON logs_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabela ON logs_auditoria(tabela);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_registro ON logs_auditoria(registro_id);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_created_at ON logs_auditoria(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_tabela_registro ON logs_auditoria(tabela, registro_id);

-- Tabela de backups
CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT NOT NULL DEFAULT 0,
    data_backup TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('completo', 'incremental', 'manual')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('sucesso', 'erro', 'em_progresso')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para backups
CREATE INDEX IF NOT EXISTS idx_backups_data ON backups(data_backup);
CREATE INDEX IF NOT EXISTS idx_backups_tipo ON backups(tipo);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);

-- Tabela de pedidos modernos (sistema avançado)
CREATE TABLE IF NOT EXISTS pedidos_modernos (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER NOT NULL REFERENCES escolas(id),
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
    contrato_id INTEGER REFERENCES contratos(id),
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    data_entrega_prevista DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pendente', 'aprovado', 'em_producao', 'em_transito', 'entregue', 'cancelado')),
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    observacoes TEXT,
    usuario_criacao_id INTEGER NOT NULL REFERENCES usuarios(id),
    usuario_aprovacao_id INTEGER REFERENCES usuarios(id),
    data_aprovacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens dos pedidos modernos
CREATE TABLE IF NOT EXISTS pedidos_modernos_itens (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos_modernos(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade DECIMAL(10,3) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para pedidos modernos
CREATE INDEX IF NOT EXISTS idx_pedidos_modernos_escola ON pedidos_modernos(escola_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_modernos_fornecedor ON pedidos_modernos(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_modernos_status ON pedidos_modernos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_modernos_data ON pedidos_modernos(data_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_modernos_itens_pedido ON pedidos_modernos_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_modernos_itens_produto ON pedidos_modernos_itens(produto_id);

-- Tabela de refeições
CREATE TABLE IF NOT EXISTS refeicoes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('cafe_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia')),
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ingredientes das refeições
CREATE TABLE IF NOT EXISTS refeicoes_ingredientes (
    id SERIAL PRIMARY KEY,
    refeicao_id INTEGER NOT NULL REFERENCES refeicoes(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade_por_porcao DECIMAL(10,3) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para refeições
CREATE INDEX IF NOT EXISTS idx_refeicoes_tipo ON refeicoes(tipo);
CREATE INDEX IF NOT EXISTS idx_refeicoes_ativa ON refeicoes(ativa);
CREATE INDEX IF NOT EXISTS idx_refeicoes_ingredientes_refeicao ON refeicoes_ingredientes(refeicao_id);
CREATE INDEX IF NOT EXISTS idx_refeicoes_ingredientes_produto ON refeicoes_ingredientes(produto_id);

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_pedidos_modernos_updated_at ON pedidos_modernos;
CREATE TRIGGER update_pedidos_modernos_updated_at 
    BEFORE UPDATE ON pedidos_modernos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refeicoes_updated_at ON refeicoes;
CREATE TRIGGER update_refeicoes_updated_at 
    BEFORE UPDATE ON refeicoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE logs_auditoria IS 'Logs de auditoria do sistema';
COMMENT ON TABLE backups IS 'Registro de backups realizados';
COMMENT ON TABLE pedidos_modernos IS 'Sistema avançado de pedidos';
COMMENT ON TABLE pedidos_modernos_itens IS 'Itens dos pedidos modernos';
COMMENT ON TABLE refeicoes IS 'Cadastro de refeições';
COMMENT ON TABLE refeicoes_ingredientes IS 'Ingredientes das refeições';