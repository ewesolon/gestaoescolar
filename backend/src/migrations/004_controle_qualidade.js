const db = require('../database');

const dbPath = path.join(__dirname, '../../database.db');
const db = new Database(dbPath);

console.log('🔄 Executando migration: Controle de Qualidade...');

try {
  // Iniciar transação
  db.exec('BEGIN TRANSACTION');

  // 1. Criar tabela de controle de qualidade
  db.exec(`
    CREATE TABLE IF NOT EXISTS controle_qualidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recebimento_item_id INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'quarentena',
      criterios_aprovacao TEXT, -- JSON dos critérios
      responsavel_id INTEGER,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_liberacao DATETIME,
      fotos TEXT, -- JSON array das URLs das fotos
      observacoes TEXT,
      FOREIGN KEY (recebimento_item_id) REFERENCES recebimento_itens_modernos(id),
      FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
    )
  `);

  // 2. Verificar se a tabela criterios_qualidade_produto já existe
  const tableExists = await db.get(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'criterios_qualidade_produto'
  `);

  if (!tableExists) {
    // Criar tabela de critérios de qualidade por produto
    db.exec(`
      CREATE TABLE criterios_qualidade_produto (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        produto_id INTEGER NOT NULL,
        criterio_id VARCHAR(50) NOT NULL,
        nome VARCHAR(200) NOT NULL,
        tipo VARCHAR(20) NOT NULL, -- 'boolean', 'numeric', 'text'
        obrigatorio BOOLEAN DEFAULT false,
        valor_minimo DECIMAL(10,2),
        valor_maximo DECIMAL(10,2),
        descricao TEXT,
        ativo BOOLEAN DEFAULT true,
        data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (produto_id) REFERENCES produtos(id),
        UNIQUE(produto_id, criterio_id)
      )
    `);
    console.log('✅ Tabela criterios_qualidade_produto criada');
  } else {
    console.log('ℹ️ Tabela criterios_qualidade_produto já existe');
    
    // Verificar se precisa adicionar colunas
    const columns = db.prepare("PRAGMA table_info(criterios_qualidade_produto)").all();
    const hascriterio_id = columns.some(col => col.name === 'criterio_id');
    
    if (!hascriterio_id) {
      // Adicionar coluna criterio_id se não existir
      db.exec(`ALTER TABLE criterios_qualidade_produto ADD COLUMN criterio_id VARCHAR(50)`);
      console.log('✅ Coluna criterio_id adicionada');
    }
  }

  // 3. Criar índices para performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_controle_qualidade_status 
    ON controle_qualidade(status)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_controle_qualidade_recebimento 
    ON controle_qualidade(recebimento_item_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_criterios_produto 
    ON criterios_qualidade_produto(produto_id)
  `);

  // 4. Inserir critérios padrão para alguns produtos (exemplo)
  const criteriosPadrao = [
    // Critérios gerais aplicáveis a todos os produtos
    {
      produto_id: null, // null = aplicável a todos
      criterio_id: 'aparencia_geral',
      nome: 'Aparência Geral',
      tipo: 'boolean',
      obrigatorio: true,
      descricao: 'Produto apresenta boa aparência visual'
    },
    {
      produto_id: null,
      criterio_id: 'embalagem_integra',
      nome: 'Embalagem Íntegra',
      tipo: 'boolean',
      obrigatorio: true,
      descricao: 'Embalagem sem danos, furos ou violação'
    },
    {
      produto_id: null,
      criterio_id: 'data_validade',
      nome: 'Data de Validade',
      tipo: 'boolean',
      obrigatorio: true,
      descricao: 'Produto dentro do prazo de validade'
    },
    {
      produto_id: null,
      criterio_id: 'temperatura_adequada',
      nome: 'Temperatura Adequada',
      tipo: 'boolean',
      obrigatorio: false,
      descricao: 'Produto armazenado/transportado na temperatura correta'
    },
    {
      produto_id: null,
      criterio_id: 'peso_conferido',
      nome: 'Peso Conferido',
      tipo: 'numeric',
      obrigatorio: false,
      valor_minimo: 0,
      descricao: 'Peso real do produto (kg)'
    }
  ];

  // Verificar se a tabela foi criada corretamente
  const tableInfo = db.prepare("PRAGMA table_info(criterios_qualidade_produto)").all();
  console.log('📋 Estrutura da tabela criterios_qualidade_produto:', tableInfo);

  // Inserir critérios padrão (ajustado para a estrutura existente)
  const insertCriterio = db.prepare(`
    INSERT OR IGNORE INTO criterios_qualidade_produto 
    (produto_id, criterio_id, criterio_nome, criterio_tipo, criterio_obrigatorio, valor_minimo, valor_maximo, descricao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  criteriosPadrao.forEach(criterio => {
    insertCriterio.run(
      criterio.produto_id,
      criterio.criterio_id,
      criterio.nome,
      criterio.tipo,
      criterio.obrigatorio ? 1 : 0,
      criterio.valor_minimo || null,
      criterio.valor_maximo || null,
      criterio.descricao
    );
  });

  // 5. Criar diretório para fotos de qualidade
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, '../../uploads/qualidade');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Diretório de uploads de qualidade criado');
  }

  // Confirmar transação
  db.exec('COMMIT');

  console.log('✅ Migration de Controle de Qualidade executada com sucesso!');
  console.log('📋 Tabelas criadas:');
  console.log('   - controle_qualidade');
  console.log('   - criterios_qualidade_produto');
  console.log('🔍 Índices criados para otimização');
  console.log('📝 Critérios padrão inseridos');

} catch (error) {
  // Reverter em caso de erro
  db.exec('ROLLBACK');
  console.error('❌ Erro na migration de Controle de Qualidade:', error);
  throw error;
} finally {
  db.close();
}