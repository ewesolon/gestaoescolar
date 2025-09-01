-- Migração: Adicionar colunas faltantes
-- Data: 2025-09-01
-- Descrição: Adiciona colunas que estão sendo referenciadas no código mas não existem no banco

-- Adicionar colunas faltantes na tabela escolas
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS codigo_acesso VARCHAR(10);
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS endereco_maps TEXT;
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS nome_gestor VARCHAR(255);
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS administracao VARCHAR(20) DEFAULT 'municipal';
ALTER TABLE escolas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar colunas faltantes na tabela produtos
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS marca VARCHAR(100);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50);
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS observacoes TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar colunas faltantes na tabela fornecedores
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar colunas faltantes na tabela contratos
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar colunas faltantes na tabela modalidades
ALTER TABLE modalidades ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Adicionar colunas faltantes na tabela refeicoes
ALTER TABLE refeicoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_escolas_updated_at ON escolas;
CREATE TRIGGER update_escolas_updated_at 
    BEFORE UPDATE ON escolas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_produtos_updated_at ON produtos;
CREATE TRIGGER update_produtos_updated_at 
    BEFORE UPDATE ON produtos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fornecedores_updated_at ON fornecedores;
CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contratos_updated_at ON contratos;
CREATE TRIGGER update_contratos_updated_at 
    BEFORE UPDATE ON contratos 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modalidades_updated_at ON modalidades;
CREATE TRIGGER update_modalidades_updated_at 
    BEFORE UPDATE ON modalidades 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refeicoes_updated_at ON refeicoes;
CREATE TRIGGER update_refeicoes_updated_at 
    BEFORE UPDATE ON refeicoes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gerar códigos de acesso únicos para escolas que não têm
UPDATE escolas 
SET codigo_acesso = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')
WHERE codigo_acesso IS NULL OR codigo_acesso = '';

-- Comentários nas colunas
COMMENT ON COLUMN escolas.codigo_acesso IS 'Código de 6 dígitos para acesso mobile';
COMMENT ON COLUMN escolas.endereco_maps IS 'URL do Google Maps ou coordenadas';
COMMENT ON COLUMN escolas.nome_gestor IS 'Nome do gestor responsável pela escola';
COMMENT ON COLUMN escolas.administracao IS 'Tipo de administração: municipal, estadual, federal, particular';

COMMENT ON COLUMN produtos.marca IS 'Marca do produto';
COMMENT ON COLUMN produtos.codigo_barras IS 'Código de barras do produto';
COMMENT ON COLUMN produtos.observacoes IS 'Observações sobre o produto';
COMMENT ON COLUMN produtos.ativo IS 'Se o produto está ativo no sistema';