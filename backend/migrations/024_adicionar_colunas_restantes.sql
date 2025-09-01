-- Migração 024: Adicionar colunas restantes que estão faltando

-- Adicionar coluna municipio na tabela escolas se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'escolas' AND column_name = 'municipio') THEN
        ALTER TABLE escolas ADD COLUMN municipio VARCHAR(100);
    END IF;
END $$;

-- Adicionar coluna status na tabela estoque_lotes se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'estoque_lotes' AND column_name = 'status') THEN
        ALTER TABLE estoque_lotes ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
    END IF;
END $$;

-- Adicionar coluna status na tabela contratos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratos' AND column_name = 'status') THEN
        ALTER TABLE contratos ADD COLUMN status VARCHAR(20) DEFAULT 'ativo';
    END IF;
END $$;

-- Adicionar coluna status na tabela pedidos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'status') THEN
        ALTER TABLE pedidos ADD COLUMN status VARCHAR(20) DEFAULT 'PENDENTE';
    END IF;
END $$;

-- Adicionar coluna saldo_disponivel na tabela contratos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contratos' AND column_name = 'saldo_disponivel') THEN
        ALTER TABLE contratos ADD COLUMN saldo_disponivel DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Criar tabela reservas_saldo se não existir
CREATE TABLE IF NOT EXISTS reservas_saldo (
    id SERIAL PRIMARY KEY,
    contrato_id INTEGER REFERENCES contratos(id),
    pedido_id INTEGER REFERENCES pedidos(id),
    valor_reservado DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ativa',
    motivo TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    data_expiracao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela backups se não existir
CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    nome_arquivo VARCHAR(255) NOT NULL,
    tamanho_bytes BIGINT DEFAULT 0,
    tipo VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    data_backup TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela performance_monitoring se não existir
CREATE TABLE IF NOT EXISTS performance_monitoring (
    id SERIAL PRIMARY KEY,
    modulo VARCHAR(100),
    operacao VARCHAR(100),
    tabela VARCHAR(100),
    tempo_execucao_ms INTEGER,
    registros_afetados INTEGER,
    query_sql TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    sessao_id VARCHAR(100),
    timestamp_inicio TIMESTAMP,
    timestamp_fim TIMESTAMP,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela consistencia_dados se não existir
CREATE TABLE IF NOT EXISTS consistencia_dados (
    id SERIAL PRIMARY KEY,
    modulo VARCHAR(100),
    tipo_verificacao VARCHAR(100),
    tabela_origem VARCHAR(100),
    registro_id INTEGER,
    status_verificacao VARCHAR(20),
    detalhes_inconsistencia TEXT,
    timestamp_verificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migração 024 concluída