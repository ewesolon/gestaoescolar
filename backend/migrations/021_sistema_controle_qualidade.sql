-- Migração: Sistema de Controle de Qualidade
-- Data: 2025-08-28
-- Descrição: Criação das tabelas para controle de qualidade de produtos

-- Tabela de controle de qualidade
CREATE TABLE IF NOT EXISTS controle_qualidade (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    lote VARCHAR(100) NOT NULL,
    data_fabricacao DATE NOT NULL,
    data_validade DATE NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'quarentena')),
    observacoes TEXT,
    usuario_analise_id INTEGER REFERENCES usuarios(id),
    data_analise TIMESTAMP,
    motivo_rejeicao TEXT,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedores(id),
    recebimento_id INTEGER REFERENCES recebimentos(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para controle de qualidade
CREATE INDEX IF NOT EXISTS idx_controle_qualidade_produto ON controle_qualidade(produto_id);
CREATE INDEX IF NOT EXISTS idx_controle_qualidade_status ON controle_qualidade(status);
CREATE INDEX IF NOT EXISTS idx_controle_qualidade_lote ON controle_qualidade(lote);
CREATE INDEX IF NOT EXISTS idx_controle_qualidade_validade ON controle_qualidade(data_validade);
CREATE INDEX IF NOT EXISTS idx_controle_qualidade_fornecedor ON controle_qualidade(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_controle_qualidade_recebimento ON controle_qualidade(recebimento_id);

-- Tabela de análises de qualidade
CREATE TABLE IF NOT EXISTS analises_qualidade (
    id SERIAL PRIMARY KEY,
    item_controle_id INTEGER NOT NULL REFERENCES controle_qualidade(id) ON DELETE CASCADE,
    criterio VARCHAR(255) NOT NULL,
    resultado VARCHAR(20) NOT NULL CHECK (resultado IN ('conforme', 'nao_conforme')),
    observacoes TEXT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para análises
CREATE INDEX IF NOT EXISTS idx_analises_qualidade_item ON analises_qualidade(item_controle_id);
CREATE INDEX IF NOT EXISTS idx_analises_qualidade_usuario ON analises_qualidade(usuario_id);
CREATE INDEX IF NOT EXISTS idx_analises_qualidade_resultado ON analises_qualidade(resultado);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_controle_qualidade_updated_at ON controle_qualidade;
CREATE TRIGGER update_controle_qualidade_updated_at 
    BEFORE UPDATE ON controle_qualidade 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE controle_qualidade IS 'Controle de qualidade de produtos recebidos';
COMMENT ON TABLE analises_qualidade IS 'Análises detalhadas de qualidade por critério';