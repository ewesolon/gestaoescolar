-- Migração: Sistema de Alertas
-- Data: 2025-08-28
-- Descrição: Criação das tabelas para sistema de alertas e notificações

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS alertas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('estoque_baixo', 'produto_vencendo', 'contrato_vencendo', 'pedido_atrasado', 'sistema')),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'lido', 'resolvido', 'ignorado')),
    usuario_id INTEGER REFERENCES usuarios(id),
    dados_contexto JSONB,
    data_expiracao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas(status);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridade ON alertas(prioridade);
CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON alertas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_created_at ON alertas(created_at);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'sucesso', 'aviso', 'erro')),
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    dados_contexto JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at);

-- Tabela de configurações de notificação
CREATE TABLE IF NOT EXISTS configuracoes_notificacao (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    email BOOLEAN NOT NULL DEFAULT TRUE,
    push BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, tipo_alerta)
);

-- Índices para configurações
CREATE INDEX IF NOT EXISTS idx_config_notif_usuario ON configuracoes_notificacao(usuario_id);
CREATE INDEX IF NOT EXISTS idx_config_notif_tipo ON configuracoes_notificacao(tipo_alerta);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_alertas_updated_at ON alertas;
CREATE TRIGGER update_alertas_updated_at 
    BEFORE UPDATE ON alertas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notificacoes_updated_at ON notificacoes;
CREATE TRIGGER update_notificacoes_updated_at 
    BEFORE UPDATE ON notificacoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE alertas IS 'Sistema de alertas do sistema';
COMMENT ON TABLE notificacoes IS 'Notificações para usuários';
COMMENT ON TABLE configuracoes_notificacao IS 'Configurações de notificação por usuário';