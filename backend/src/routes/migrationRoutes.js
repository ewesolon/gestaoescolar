const express = require('express');
const router = express.Router();
const db = require('../database');

// Rota para criar tabelas faltantes
router.post('/create-missing-tables', async (req, res) => {
  try {
    console.log('🔄 Criando tabelas faltantes...');
    
    // Criar tabela aditivos_contratos
    await db.query(`
      CREATE TABLE IF NOT EXISTS aditivos_contratos (
        id SERIAL NOT NULL,
        contrato_id INTEGER NOT NULL,
        numero_aditivo VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        data_assinatura DATE NOT NULL,
        data_inicio_vigencia DATE NOT NULL,
        data_fim_vigencia DATE,
        prazo_adicional_dias INTEGER,
        nova_data_fim DATE,
        percentual_acrescimo DECIMAL(5,2),
        valor_original DECIMAL(15,2),
        valor_aditivo DECIMAL(15,2),
        valor_total_atualizado DECIMAL(15,2),
        justificativa TEXT NOT NULL,
        fundamentacao_legal TEXT NOT NULL,
        numero_processo VARCHAR(100),
        observacoes TEXT,
        ativo BOOLEAN DEFAULT true NOT NULL,
        criado_por INTEGER NOT NULL,
        aprovado_por INTEGER,
        data_aprovacao TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `);
    
    console.log('✅ Tabela aditivos_contratos criada!');
    
    // Verificar se a tabela foi criada
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'aditivos_contratos'
    `);
    
    res.json({
      success: true,
      message: 'Tabelas criadas com sucesso!',
      tables_created: ['aditivos_contratos'],
      verified: result.rows.length > 0
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar tabelas',
      error: error.message
    });
  }
});

// Rota para listar tabelas existentes
router.get('/list-tables', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tabelasEssenciais = [
      'aditivos_contratos',
      'contratos', 
      'contrato_produtos',
      'fornecedores'
    ];
    
    const status = {};
    tabelasEssenciais.forEach(tabela => {
      status[tabela] = result.rows.some(row => row.table_name === tabela);
    });
    
    res.json({
      success: true,
      all_tables: result.rows.map(row => row.table_name),
      essential_tables_status: status
    });
    
  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar tabelas',
      error: error.message
    });
  }
});

// Rota para verificar estrutura de tabelas
router.get('/check-table-structure/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    
    res.json({
      success: true,
      table: tableName,
      columns: result.rows
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar estrutura da tabela',
      error: error.message
    });
  }
});

// Rota para adicionar colunas faltantes
router.post('/fix-table-columns', async (req, res) => {
  try {
    console.log('🔄 Corrigindo colunas faltantes...');
    
    // Adicionar colunas faltantes na tabela contratos
    await db.query(`
      ALTER TABLE contratos 
      ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true
    `);
    
    await db.query(`
      ALTER TABLE contratos 
      ADD COLUMN IF NOT EXISTS descricao TEXT
    `);
    
    await db.query(`
      ALTER TABLE contratos 
      ADD COLUMN IF NOT EXISTS objeto TEXT
    `);
    
    await db.query(`
      ALTER TABLE contratos 
      ADD COLUMN IF NOT EXISTS modalidade VARCHAR(100)
    `);
    
    await db.query(`
      ALTER TABLE contratos 
      ADD COLUMN IF NOT EXISTS numero_processo VARCHAR(100)
    `);
    
    console.log('✅ Colunas adicionadas na tabela contratos!');
    
    res.json({
      success: true,
      message: 'Colunas corrigidas com sucesso!',
      columns_added: ['ativo', 'descricao', 'objeto', 'modalidade', 'numero_processo']
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir colunas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao corrigir colunas',
      error: error.message
    });
  }
});

module.exports = router;