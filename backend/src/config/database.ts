// Configuração PostgreSQL
const db = require("../database");

// Exportar para compatibilidade com código existente
export async function openDb() {
  // Retornar o objeto db do PostgreSQL
  return db;
}

// Função para testar conexão
export async function testConnection() {
  return await db.testConnection();
}

export default db;
