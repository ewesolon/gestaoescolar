-- Migração 012: Sistema de Modalidades, Escolas e Produtos Escolares
-- Cria as tabelas básicas para gerenciar modalidades de ensino, escolas e produtos escolares
-- (Sistema de cálculo removido - preservando apenas estruturas essenciais)

-- 1. Criar tabela modalidades_ensino
CREATE TABLE IF NOT EXISTS modalidades_ensino (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar tabela escolas
CREATE TABLE IF NOT EXISTS escolas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  endereco TEXT,
  municipio VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(100),
  diretor VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela escolas_modalidades (relaciona escolas com modalidades e quantidade de alunos)
CREATE TABLE IF NOT EXISTS escolas_modalidades (
  id SERIAL PRIMARY KEY,
  escola_id INTEGER NOT NULL,
  modalidade_id INTEGER NOT NULL,
  quantidade_alunos INTEGER NOT NULL DEFAULT 0,
  ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (escola_id) REFERENCES escolas(id) ON DELETE CASCADE,
  FOREIGN KEY (modalidade_id) REFERENCES modalidades_ensino(id),
  UNIQUE(escola_id, modalidade_id, ano_letivo)
);

-- 4. Criar tabela produtos_escolares
CREATE TABLE IF NOT EXISTS produtos_escolares (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  descricao TEXT,
  unidade_medida VARCHAR(20) NOT NULL DEFAULT 'unidade',
  categoria VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas de cálculo removidas - preservando apenas estruturas essenciais

-- 5. Criar índices para otimização (apenas para tabelas preservadas)
CREATE INDEX IF NOT EXISTS idx_escolas_modalidades_escola ON escolas_modalidades(escola_id);
CREATE INDEX IF NOT EXISTS idx_escolas_modalidades_modalidade ON escolas_modalidades(modalidade_id);

-- 6. Inserir dados iniciais de modalidades de ensino
INSERT INTO modalidades_ensino (nome, descricao) VALUES 
('Ensino Fundamental I', 'Ensino Fundamental do 1º ao 5º ano'),
('Ensino Fundamental II', 'Ensino Fundamental do 6º ao 9º ano'),
('Ensino Médio', 'Ensino Médio do 1º ao 3º ano'),
('Educação Infantil', 'Educação Infantil - Creche e Pré-escola'),
('EJA', 'Educação de Jovens e Adultos')
ON CONFLICT (nome) DO NOTHING;

-- 7. Criar triggers para atualizar updated_at (apenas para tabelas preservadas)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_modalidades_ensino_updated_at BEFORE UPDATE ON modalidades_ensino FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escolas_updated_at BEFORE UPDATE ON escolas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escolas_modalidades_updated_at BEFORE UPDATE ON escolas_modalidades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_escolares_updated_at BEFORE UPDATE ON produtos_escolares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;