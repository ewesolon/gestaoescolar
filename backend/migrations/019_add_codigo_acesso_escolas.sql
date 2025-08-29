-- Migration: Add codigo_acesso to escolas table
-- Description: Adds unique access code field for school managers

-- Add codigo_acesso column
ALTER TABLE escolas 
ADD COLUMN codigo_acesso VARCHAR(20) UNIQUE;

-- Generate unique codes for existing schools (6-digit codes)
UPDATE escolas 
SET codigo_acesso = LPAD((id * 123 + 456789)::text, 6, '0')
WHERE codigo_acesso IS NULL;

-- Make the column NOT NULL after populating existing records
ALTER TABLE escolas 
ALTER COLUMN codigo_acesso SET NOT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_escolas_codigo_acesso ON escolas(codigo_acesso);

-- Add comment for documentation
COMMENT ON COLUMN escolas.codigo_acesso IS 'Código único de acesso para gestores da escola (6 dígitos)';