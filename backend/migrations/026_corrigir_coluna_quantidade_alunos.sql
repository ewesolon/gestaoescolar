-- Migração 026: Corrigir coluna quantidade_alunos na tabela escola_modalidades

-- Adicionar coluna quantidade_alunos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'escola_modalidades' AND column_name = 'quantidade_alunos') THEN
        ALTER TABLE escola_modalidades ADD COLUMN quantidade_alunos INTEGER DEFAULT 0;
    END IF;
END $$;

-- Copiar dados da coluna alunos_matriculados para quantidade_alunos se existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'escola_modalidades' AND column_name = 'alunos_matriculados') THEN
        UPDATE escola_modalidades SET quantidade_alunos = COALESCE(alunos_matriculados, 0);
    END IF;
END $$;

-- Migração 026 concluída