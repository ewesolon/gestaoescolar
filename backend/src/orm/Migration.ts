import { BaseModel } from './BaseModel';
import db from '../database';

// Registro de modelos
const registeredModels: (typeof BaseModel)[] = [];

// Classe para gerenciar migrações
export class Migration {
  // Registrar um modelo
  static registerModel(model: typeof BaseModel) {
    if (!registeredModels.includes(model)) {
      registeredModels.push(model);
      console.log(`📝 Modelo ${model.name} registrado`);
    }
  }

  // Obter todos os modelos registrados
  static getRegisteredModels(): (typeof BaseModel)[] {
    return [...registeredModels];
  }

  // Sincronizar todos os modelos
  static async syncAll(): Promise<void> {
    console.log('🔄 Iniciando sincronização de modelos...');
    
    try {
      // Verificar conexão com banco
      await this.checkDatabaseConnection();
      
      // Sincronizar cada modelo
      for (const model of registeredModels) {
        await model.sync();
      }
      
      console.log('✅ Sincronização concluída com sucesso!');
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      throw error;
    }
  }

  // Verificar conexão com banco
  private static async checkDatabaseConnection(): Promise<void> {
    try {
      await db.query('SELECT 1');
      console.log('🔗 Conexão com banco de dados verificada');
    } catch (error) {
      console.error('❌ Erro de conexão com banco de dados:', error);
      throw new Error('Falha na conexão com banco de dados');
    }
  }

  // Criar todas as tabelas (força criação)
  static async createAllTables(): Promise<void> {
    console.log('🏗️ Criando todas as tabelas...');
    
    try {
      for (const model of registeredModels) {
        await model.createTable();
      }
      console.log('✅ Todas as tabelas foram criadas!');
    } catch (error) {
      console.error('❌ Erro ao criar tabelas:', error);
      throw error;
    }
  }

  // Verificar status das tabelas
  static async checkTablesStatus(): Promise<void> {
    console.log('📊 Verificando status das tabelas...');
    
    for (const model of registeredModels) {
      const exists = await model.tableExists();
      const status = exists ? '✅ Existe' : '❌ Não existe';
      console.log(`  ${model.name}: ${status}`);
    }
  }

  // Listar todas as tabelas do banco
  static async listDatabaseTables(): Promise<string[]> {
    try {
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      const tables = result.rows.map(row => row.table_name);
      console.log('📋 Tabelas no banco:', tables);
      return tables;
    } catch (error) {
      console.error('❌ Erro ao listar tabelas:', error);
      return [];
    }
  }

  // Executar migração com logs detalhados
  static async migrate(): Promise<void> {
    console.log('🚀 Iniciando processo de migração...');
    console.log(`📦 ${registeredModels.length} modelo(s) registrado(s)`);
    
    // Verificar status atual
    await this.checkTablesStatus();
    
    // Sincronizar modelos
    await this.syncAll();
    
    // Verificar status final
    console.log('\n📊 Status final:');
    await this.checkTablesStatus();
    
    console.log('🎉 Migração concluída!');
  }
}

// Decorator para auto-registro de modelos
export function Model(tableName: string) {
  return function <T extends typeof BaseModel>(constructor: T) {
    constructor.setTableName(tableName);
    Migration.registerModel(constructor);
    return constructor;
  };
}

// Função utilitária para inicializar ORM
export async function initializeORM(): Promise<void> {
  console.log('🔧 Inicializando ORM...');
  await Migration.migrate();
}

// Exportar instância singleton
export const migration = Migration;