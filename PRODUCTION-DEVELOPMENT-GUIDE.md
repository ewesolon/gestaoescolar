# Guia de Desenvolvimento e Produção
## Sistema de Gerenciamento de Alimentação Escolar

Este guia explica como configurar e executar o sistema tanto em desenvolvimento quanto em produção.

## 🏗️ Arquitetura

```
Sistema de Alimentação Escolar
├── Backend (Node.js + Express + TypeScript)
│   ├── Desenvolvimento: http://localhost:3000
│   └── Produção: Vercel + Supabase PostgreSQL
├── Frontend (React + Vite + TypeScript)
│   ├── Desenvolvimento: http://localhost:5173
│   └── Produção: Vercel
└── Database
    ├── Desenvolvimento: PostgreSQL local ou Supabase
    └── Produção: Supabase PostgreSQL
```

## 🔧 Configuração de Ambiente

### Desenvolvimento

#### Backend (.env)
```env
# Configuração Supabase - Desenvolvimento
POSTGRES_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres

NODE_ENV=development
PORT=3000

JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=24h

CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

#### Frontend (.env.development)
```env
VITE_NODE_ENV=development
VITE_API_URL=http://localhost:3000/api
VITE_HEALTH_URL=http://localhost:3000/health
VITE_APP_NAME=Sistema de Alimentação Escolar (DEV)
VITE_DEBUG=true
VITE_VERCEL=false
```

### Produção

#### Backend (Variáveis no Vercel)
```env
POSTGRES_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
NODE_ENV=production
VERCEL=1
JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=24h
```

#### Frontend (Variáveis no Vercel)
```env
VITE_NODE_ENV=production
VITE_VERCEL=true
VITE_API_URL=https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api
VITE_HEALTH_URL=https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health
VITE_DEBUG=false
```

## 🚀 Desenvolvimento

### Início Rápido
```powershell
# Instalar dependências e iniciar tudo
./dev-manager-fixed.ps1 start -Both -Install

# Ou individualmente
./dev-manager-fixed.ps1 start -Backend    # Apenas backend
./dev-manager-fixed.ps1 start -Frontend   # Apenas frontend
```

### Comandos Úteis
```powershell
# Verificar status dos serviços
./dev-manager-fixed.ps1 status

# Parar todos os processos
./dev-manager-fixed.ps1 stop

# Limpar e reinstalar dependências
./dev-manager-fixed.ps1 clean

# Build dos projetos
./dev-manager-fixed.ps1 build
```

### URLs de Desenvolvimento
- **Backend**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Frontend**: http://localhost:5173

## 🌐 Produção

### Deploy Automático
```powershell
# Setup inicial (configurar variáveis)
./deploy-production.ps1 -Setup

# Deploy completo
./deploy-production.ps1 -Both

# Deploy individual
./deploy-production.ps1 -Backend    # Apenas backend
./deploy-production.ps1 -Frontend   # Apenas frontend

# Verificar status
./deploy-production.ps1 -Check
```

### URLs de Produção
- **Backend API**: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api
- **Health Check**: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health
- **Frontend**: https://gestaoescolar-frontend.vercel.app (quando deployado)

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento Local
```powershell
# 1. Clonar repositório
git clone https://github.com/ewesolon/gestaoescolar.git
cd gestaoescolar

# 2. Configurar ambiente
# Copiar .env.example para .env nos diretórios backend e frontend

# 3. Iniciar desenvolvimento
./dev-manager-fixed.ps1 start -Both -Install
```

### 2. Teste e Build
```powershell
# Testar localmente
./dev-manager-fixed.ps1 status

# Fazer build
./dev-manager-fixed.ps1 build

# Testar build local
cd frontend && npm run preview
```

### 3. Deploy em Produção
```powershell
# Commit das mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# Deploy
./deploy-production.ps1 -Both

# Verificar deploy
./deploy-production.ps1 -Check
```

## 🔧 Configurações Avançadas

### CORS (Cross-Origin Resource Sharing)

#### Desenvolvimento
- Permite qualquer origem (`origin: true`)
- Inclui localhost:5173, 127.0.0.1:5173

#### Produção
- Lista específica de domínios permitidos
- Suporte a wildcards (*.vercel.app)
- Configuração de segurança aprimorada

### Proxy do Vite (Desenvolvimento)
```typescript
// frontend/vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false
  }
}
```

### Detecção Automática de Ambiente
O sistema detecta automaticamente o ambiente baseado em:
- Hostname (localhost vs vercel.app)
- Variáveis de ambiente
- Configuração do Vite

## 🧪 Testes e Monitoramento

### Health Checks
- **Backend**: `/health` endpoint
- **Database**: Teste de conexão PostgreSQL
- **Frontend**: Componente ApiStatus

### Logs e Debug
- **Desenvolvimento**: Logs detalhados no console
- **Produção**: Logs otimizados, apenas erros críticos

### Monitoramento
```powershell
# Verificar status em tempo real
./deploy-production.ps1 -Check

# Logs do Vercel
vercel logs [deployment-url]
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```
Access to fetch at 'API_URL' from origin 'FRONTEND_URL' has been blocked by CORS policy
```
**Solução**: Verificar configuração de CORS no backend e URLs permitidas.

#### 2. Erro de Conexão com Database
```
Error: connect ECONNREFUSED
```
**Solução**: Verificar variáveis POSTGRES_URL e DATABASE_URL.

#### 3. Build Falha no Frontend
```
Module not found: Can't resolve './config/api'
```
**Solução**: Verificar se todos os arquivos de configuração existem.

#### 4. Timeout no Vercel
```
Function execution timed out
```
**Solução**: Otimizar queries do banco, verificar conexões.

### Comandos de Diagnóstico
```powershell
# Verificar configuração
./dev-manager-fixed.ps1 status

# Testar API diretamente
curl http://localhost:3000/health
curl https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health

# Verificar logs do Vercel
vercel logs --follow
```

## 📚 Recursos Adicionais

### Documentação
- [Vite Configuration](https://vitejs.dev/config/)
- [Vercel Deployment](https://vercel.com/docs)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)

### Scripts Disponíveis
- `dev-manager-fixed.ps1` - Gerenciamento de desenvolvimento
- `deploy-production.ps1` - Deploy em produção
- `deploy-vercel-fixed.ps1` - Deploy específico do backend

### Estrutura de Arquivos
```
├── backend/
│   ├── src/                 # Código TypeScript
│   ├── vercel-entry.js      # Entrada para Vercel
│   ├── vercel.json          # Configuração Vercel
│   └── .env                 # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── config/api.ts    # Configuração da API
│   │   └── components/      # Componentes React
│   ├── .env.development     # Env desenvolvimento
│   ├── .env.production      # Env produção
│   └── vercel.json          # Configuração Vercel
└── config.json              # Configuração global
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.