// Migração para criar tabela de cardápios no PostgreSQL
const db = require('../src/database');

module.exports = {
  async up() {
    console.log('🔧 Criando tabela cardapios...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS cardapios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        periodo_dias INTEGER NOT NULL DEFAULT 30,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar índices para melhor performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cardapios_nome ON cardapios(nome);
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cardapios_ativo ON cardapios(ativo);
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cardapios_periodo ON cardapios(data_inicio, data_fim);
    `);
    
    // Criar tabela cardapio_refeicoes
    await db.query(`
      CREATE TABLE IF NOT EXISTS cardapio_refeicoes (
        id SERIAL PRIMARY KEY,
        cardapio_id INTEGER NOT NULL,
        refeicao_id INTEGER NOT NULL,
        modalidade_id INTEGER NOT NULL,
        frequencia_mensal INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Constraints
        CONSTRAINT fk_cardapio_refeicoes_cardapio 
            FOREIGN KEY (cardapio_id) REFERENCES cardapios(id) ON DELETE CASCADE,
        CONSTRAINT fk_cardapio_refeicoes_refeicao 
            FOREIGN KEY (refeicao_id) REFERENCES refeicoes(id) ON DELETE CASCADE,
        CONSTRAINT fk_cardapio_refeicoes_modalidade 
            FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE CASCADE,
        
        -- Evitar duplicatas
        CONSTRAINT uk_cardapio_refeicao_modalidade UNIQUE (cardapio_id, refeicao_id, modalidade_id),
        
        -- Validações
        CONSTRAINT ck_frequencia_positiva CHECK (frequencia_mensal > 0)
      )
    `);
    
    // Índices para cardapio_refeicoes
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cardapio_refeicoes_cardapio_id ON cardapio_refeicoes(cardapio_id);
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cardapio_refeicoes_refeicao_id ON cardapio_refeicoes(refeicao_id);
    `);
    
    // Trigger para atualizar updated_at automaticamente
    await db.query(`
      CREATE OR REPLACE FUNCTION update_cardapios_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await db.query(`
      DROP TRIGGER IF EXISTS trigger_update_cardapios_updated_at ON cardapios;
      CREATE TRIGGER trigger_update_cardapios_updated_at
          BEFORE UPDATE ON cardapios
          FOR EACH ROW
          EXECUTE FUNCTION update_cardapios_updated_at();
    `);
    
    await db.query(`
      CREATE OR REPLACE FUNCTION update_cardapio_refeicoes_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await db.query(`
      DROP TRIGGER IF EXISTS trigger_update_cardapio_refeicoes_updated_at ON cardapio_refeicoes;
      CREATE TRIGGER trigger_update_cardapio_refeicoes_updated_at
          BEFORE UPDATE ON cardapio_refeicoes
          FOR EACH ROW
          EXECUTE FUNCTION update_cardapio_refeicoes_updated_at();
    `);
    
    // Inserir dados padrão se a tabela estiver vazia
    const count = await db.query('SELECT COUNT(*) as total FROM cardapios');
    if (count.rows[0].total === 0) {
      console.log('📝 Inserindo dados padrão de cardápios...');
      
      await db.query(`
        INSERT INTO cardapios (nome, descricao, periodo_dias, data_inicio, data_fim, ativo) VALUES
        ('Cardápio Padrão Janeiro', 'Cardápio para o mês de janeiro', 30, '2025-01-01', '2025-01-31', true),
        ('Cardápio Padrão Fevereiro', 'Cardápio para o mês de fevereiro', 28, '2025-02-01', '2025-02-28', true)
      `);
    }
    
    console.log('✅ Tabela cardapios criada com sucesso!');
  },
  
  async down() {
    console.log('🗑️ Removendo tabelas cardapios...');
    await db.query('DROP TABLE IF EXISTS cardapio_refeicoes CASCADE');
    await db.query('DROP TABLE IF EXISTS cardapios CASCADE');
    await db.query('DROP FUNCTION IF EXISTS update_cardapios_updated_at() CASCADE');
    await db.query('DROP FUNCTION IF EXISTS update_cardapio_refeicoes_updated_at() CASCADE');
    console.log('✅ Tabelas cardapios removidas!');
  }
};