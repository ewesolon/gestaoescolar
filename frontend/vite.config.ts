import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // Carregar variáveis de ambiente baseadas no modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Determinar se é desenvolvimento ou produção
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  
  // URLs da API baseadas no ambiente
  const getApiConfig = () => {
    if (isDev) {
      return {
        apiUrl: 'http://localhost:3000',
        secure: false
      };
    } else {
      return {
        apiUrl: 'https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app',
        secure: true
      };
    }
  };
  
  const apiConfig = getApiConfig();
  
  return {
    plugins: [react()],
    esbuild: {
      // Skip type checking during build for faster builds
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        '/api': {
          target: apiConfig.apiUrl,
          changeOrigin: true,
          secure: apiConfig.secure,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          }
        }
      }
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: isDev,
      minify: isProd,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            router: ['react-router-dom'],
            utils: ['axios', 'date-fns']
          }
        }
      }
    },
    base: '/',
    define: {
      global: 'globalThis',
      __DEV__: isDev,
      __PROD__: isProd
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@mui/material', '@mui/icons-material']
    }
  };
});
