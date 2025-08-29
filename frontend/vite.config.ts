import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Proxy direto para o IP correto
    proxy: {
      '/api': {
        target: 'http://192.168.1.2:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => {
          console.log('🔄 Proxy rewrite:', path);
          return path;
        }
      }
    },
    // CORS básico
    cors: true,
    // Headers para forçar limpeza de cache
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*'
    },
    // Desabilitar completamente HMR
    hmr: false
  },
  // Configurações mínimas de build
  build: {
    target: 'es2020',
    minify: 'esbuild'
  },
  // Configurações mínimas de otimização
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      'axios'
    ]
  }
});