-- Migração: Sistema Financeiro
-- Data: 2025-08-28
-- Descrição: Criação das tabelas para gestão financeira

-- Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
    id SERIAL PRIMARY KEY,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
    pedido_id INTEGER REFERENCES pedidos(id),
    contrato_id INTEGER REFERENCES contratos(id),
    numero_documento VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor_original DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_pendente DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
    observacoes TEXT,
    usuario_criacao_id INTEGER NOT NULL REFERENCES usuarios(id),
    usuario_pagamento_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para contas a pagar
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_pedido ON contas_pagar(pedido_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_contrato ON contas_pagar(contrato_id);

-- Tabela de contas a receber
CREATE TABLE IF NOT EXISTS contas_receber (
    id SERIAL PRIMARY KEY,
    escola_id INTEGER NOT NULL REFERENCES escolas(id),
    pedido_id INTEGER REFERENCES pedidos(id),
    numero_documento VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    valor_original DECIMAL(10,2) NOT NULL,
    valor_recebido DECIMAL(10,2) NOT NULL DEFAULT 0,
    valor_pendente DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_recebimento TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'vencido', 'cancelado')),
    observacoes TEXT,
    usuario_criacao_id INTEGER NOT NULL REFERENCES usuarios(id),
    usuario_recebimento_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para contas a receber
CREATE INDEX IF NOT EXISTS idx_contas_receber_escola ON contas_receber(escola_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_receber_pedido ON contas_receber(pedido_id);

-- Tabela de reservas de saldo
CREATE TABLE IF NOT EXISTS reservas_saldo (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER NOT NULL REFERENCES contratos(id),
    pedido_id INTEGER REFERENCES pedidos(id),
    valor_reservado DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'consumida', 'cancelada', 'expirada')),
    motivo TEXT NOT NULL,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    data_expiracao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reservas de saldo
CREATE INDEX IF NOT EXISTS idx_reservas_saldo_contrato ON reservas_saldo(contrato_id);
CREATE INDEX IF NOT EXISTS idx_reservas_saldo_pedido ON reservas_saldo(pedido_id);
CREATE INDEX IF NOT EXISTS idx_reservas_saldo_status ON reservas_saldo(status);
CREATE INDEX IF NOT EXISTS idx_reservas_saldo_usuario ON reservas_saldo(usuario_id);

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_contas_pagar_updated_at ON contas_pagar;
CREATE TRIGGER update_contas_pagar_updated_at 
    BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contas_receber_updated_at ON contas_receber;
CREATE TRIGGER update_contas_receber_updated_at 
    BEFORE UPDATE ON contas_receber 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reservas_saldo_updated_at ON reservas_saldo;
CREATE TRIGGER update_reservas_saldo_updated_at 
    BEFORE UPDATE ON reservas_saldo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE contas_pagar IS 'Contas a pagar do sistema';
COMMENT ON TABLE contas_receber IS 'Contas a receber do sistema';
COMMENT ON TABLE reservas_saldo IS 'Reservas de saldo em contratos';