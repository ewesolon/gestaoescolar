import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Configurações do servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Configurações do banco de dados
  dbPath: process.env.DB_PATH || "./database.db",

  // Configurações de segurança
  jwtSecret: process.env.JWT_SECRET || "sua_chave_secreta_jwt_aqui",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",

  // Configurações CORS
  corsOrigin:
    process.env.CORS_ORIGIN ||
    "http://localhost:5173,http://192.168.18.12:5173",

  // Configurações da API
  apiBasePath: process.env.API_BASE_PATH || "/api",

  // URLs completas
  get apiUrl() {
    return `http://192.168.18.12:${this.port}${this.apiBasePath}`;
  },

  get healthUrl() {
    return `http://192.168.18.12:${this.port}/health`;
  },
};
