// Migração para adicionar modalidade_id na tabela cardapios
const db = require('../src/database');

module.exports = {
  async up() {
    console.log('🔧 Adicionando modalidade_id na tabela cardapios...');
    
    // Adicionar coluna modalidade_id
    await db.query(`
      ALTER TABLE cardapios 
      ADD COLUMN modalidade_id INTEGER;
    `);
    
    // Adicionar foreign key constraint
    await db.query(`
      ALTER TABLE cardapios 
      ADD CONSTRAINT fk_cardapios_modalidade 
      FOREIGN KEY (modalidade_id) REFERENCES modalidades(id) ON DELETE SET NULL;
    `);
    
    // Criar índice para melhor performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_cardapios_modalidade ON cardapios(modalidade_id);
    `);
    
    console.log('✅ Coluna modalidade_id adicionada com sucesso!');
  },
  
  async down() {
    console.log('🔧 Removendo modalidade_id da tabela cardapios...');
    
    // Remover índice
    await db.query(`
      DROP INDEX IF EXISTS idx_cardapios_modalidade;
    `);
    
    // Remover foreign key constraint
    await db.query(`
      ALTER TABLE cardapios 
      DROP CONSTRAINT IF EXISTS fk_cardapios_modalidade;
    `);
    
    // Remover coluna
    await db.query(`
      ALTER TABLE cardapios 
      DROP COLUMN IF EXISTS modalidade_id;
    `);
    
    console.log('✅ Coluna modalidade_id removida com sucesso!');
  }
};