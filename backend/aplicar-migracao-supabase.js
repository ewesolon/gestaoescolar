const { Pool } = require('pg');
const fs = require('fs');

// Configuração do Supabase
const supabasePool = new Pool({
  connectionString: 'postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres',
});

async function aplicarMigracao() {
  try {
    console.log('🔄 Conectando ao Supabase...');
    
    // Testar conexão
    const testResult = await supabasePool.query('SELECT NOW() as current_time');
    console.log('✅ Conectado ao Supabase:', testResult.rows[0].current_time);
    
    // Ler o script de migração
    console.log('📖 Lendo script de migração...');
    const sqlScript = fs.readFileSync('./migracao-completa-supabase.sql', 'utf8');
    
    // Dividir o script em comandos individuais
    const comandos = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${comandos.length} comandos...`);
    
    let sucessos = 0;
    let erros = 0;
    
    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i];
      
      if (comando.length < 10) continue; // Pular comandos muito pequenos
      
      try {
        await supabasePool.query(comando);
        sucessos++;
        
        // Log a cada 10 comandos
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Processados ${i + 1}/${comandos.length} comandos`);
        }
        
      } catch (error) {
        erros++;
        console.log(`⚠️ Erro no comando ${i + 1}: ${error.message.substring(0, 100)}...`);
        
        // Se for erro de tabela já existente, continuar
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log('   (Ignorado - recurso já existe)');
        } else {
          console.log(`   Comando: ${comando.substring(0, 100)}...`);
        }
      }
    }
    
    console.log(`\n📊 Resumo da migração:`);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`⚠️ Erros: ${erros}`);
    
    // Verificar tabelas criadas
    const tabelas = await supabasePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`\n📋 Tabelas no Supabase: ${tabelas.rows.length}`);
    console.log('Tabelas:', tabelas.rows.map(t => t.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await supabasePool.end();
  }
}

aplicarMigracao();