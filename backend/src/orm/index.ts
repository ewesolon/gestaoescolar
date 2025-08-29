// Arquivo principal do ORM - importa todos os modelos e inicializa o sistema

import { initializeORM, Migration } from './Migration';
import { BaseModel } from './BaseModel';

// Importar todos os modelos ORM aqui
import ProdutoORM from '../models/ProdutoORM';
import UsuarioORM from '../models/UsuarioORM';
// Adicione outros modelos aqui conforme necessário
// import FornecedorORM from '../models/FornecedorORM';
// import PedidoORM from '../models/PedidoORM';

// Lista de todos os modelos (para referência)
export const models = {
  ProdutoORM,
  UsuarioORM,
  // Adicione outros modelos aqui
};

// Função para inicializar todo o sistema ORM
export async function setupORM(): Promise<void> {
  console.log('🔧 Configurando sistema ORM...');
  
  try {
    // Verificar modelos registrados
    const registeredModels = Migration.getRegisteredModels();
    console.log(`📦 ${registeredModels.length} modelo(s) encontrado(s):`);
    registeredModels.forEach(model => {
      console.log(`  - ${model.name}`);
    });
    
    // Inicializar ORM (criar/sincronizar tabelas)
    await initializeORM();
    
    console.log('✅ Sistema ORM configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao configurar ORM:', error);
    throw error;
  }
}

// Função para verificar status do sistema
export async function checkORMStatus(): Promise<void> {
  console.log('📊 Verificando status do ORM...');
  
  try {
    await Migration.checkTablesStatus();
    await Migration.listDatabaseTables();
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
}

// Função para forçar recriação de todas as tabelas (cuidado!)
export async function recreateAllTables(): Promise<void> {
  console.log('⚠️ ATENÇÃO: Recriando todas as tabelas...');
  
  try {
    await Migration.createAllTables();
    console.log('✅ Tabelas recriadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao recriar tabelas:', error);
    throw error;
  }
}

// Exportar classes principais
export { BaseModel, Migration, initializeORM };
export { ProdutoORM, UsuarioORM };

// Exportar tipos
export type { FieldType, FieldDefinition, IndexDefinition } from './BaseModel';
export type { IProduto } from '../models/ProdutoORM';
export type { IUsuario } from '../models/UsuarioORM';