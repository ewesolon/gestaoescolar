import { beforeAll, afterAll, beforeEach } from '@jest/globals';

// Mock do console para evitar logs desnecessários durante os testes
beforeAll(() => {
  // Silenciar logs durante os testes
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Limpar mocks após cada teste
beforeEach(() => {
  jest.clearAllMocks();
});

// Restaurar mocks após todos os testes
afterAll(() => {
  jest.restoreAllMocks();
});

// Configurações globais para testes
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};