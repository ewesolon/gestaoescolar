# 🚀 Deploy GitHub + Vercel - Sistema de Alimentação Escolar

## 📋 Visão Geral

Sistema completo de gerenciamento de alimentação escolar com:
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React + TypeScript + Vite + Material-UI
- **Mobile**: React Native + Expo (separado)

## 🔧 Arquitetura de Deploy

### Backend (Vercel Serverless Functions)
- Serverless Functions com Node.js 18.x
- PostgreSQL como banco de dados
- JWT para autenticação
- CORS configurado para produção

### Frontend (Vercel Static Site)
- Build estático com Vite
- SPA com React Router
- Proxy para API do backend
- Material-UI otimizado

## 🚀 Deploy via GitHub + Vercel

### 1. Preparar Repositório GitHub

```bash
# Adicionar arquivos ao Git
git add .
git commit -m "feat: configuração para deploy Vercel"
git push origin main
```

### 2. Importar no Vercel

1. **Acesse**: https://vercel.com/dashboard
2. **Clique**: "Add New..." > "Project"
3. **Importe**: Seu repositório GitHub
4. **Configure**: Dois projetos separados

#### Projeto 1: Backend
- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Projeto 2: Frontend  
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

#### Backend (Vercel Dashboard)
```env
NODE_ENV=production
POSTGRES_URL=postgresql://user:pass@host:port/db
JWT_SECRET=sua_chave_super_secreta_aqui
FRONTEND_URL=https://seu-frontend.vercel.app
VERCEL=1
```

#### Frontend (Vercel Dashboard)
```env
VITE_API_URL=https://seu-backend.vercel.app/api
VITE_HEALTH_URL=https://seu-backend.vercel.app/health
VITE_VERCEL=true
VITE_APP_NAME=Sistema de Alimentação Escolar
```

### 4. Configurar Banco PostgreSQL

#### Opção A: Vercel Postgres
1. No dashboard do backend project
2. Storage > Create Database > Postgres
3. Copie a `POSTGRES_URL`
4. Configure nas variáveis de ambiente

#### Opção B: Neon Database (Recomendado)
1. Acesse: https://neon.tech
2. Crie conta e database
3. Copie connection string
4. Configure como `POSTGRES_URL`

#### Opção C: Supabase
1. Acesse: https://supabase.com
2. Crie projeto
3. Copie connection string
4. Configure como `POSTGRES_URL`

## 🔄 CI/CD Automático

### Auto-Deploy Configurado
- ✅ Push para `main` → Deploy automático
- ✅ Pull Request → Preview deploy
- ✅ Rollback automático em caso de erro

### Branches Strategy
```
main (produção)
├── develop (staging)
├── feature/nova-funcionalidade
└── hotfix/correcao-urgente
```

## 🌐 URLs Finais

Após deploy completo:
- **Frontend**: `https://alimentacao-escolar-frontend.vercel.app`
- **Backend**: `https://alimentacao-escolar-backend.vercel.app`
- **API**: `https://alimentacao-escolar-backend.vercel.app/api`
- **Health**: `https://alimentacao-escolar-backend.vercel.app/health`

## 🔧 Configurações Avançadas

### Custom Domains
```bash
# Adicionar domínio customizado
vercel domains add meudominio.com
```

### Environment Variables por Branch
- **Production**: `main` branch
- **Preview**: outras branches
- **Development**: local

### Performance Optimization
```json
// vercel.json (backend)
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

## 📊 Monitoramento

### Analytics Vercel
- Page views e performance
- Function invocations
- Error tracking
- Core Web Vitals

### Logs
```bash
# Ver logs em tempo real
vercel logs https://seu-backend.vercel.app --follow
```

## 🔍 Troubleshooting

### Erro de Build
```bash
# Limpar cache Vercel
vercel --debug
```

### Erro de CORS
```javascript
// Verificar origins no backend
const corsOrigins = [
  'https://seu-frontend.vercel.app',
  'https://seu-dominio-customizado.com'
];
```

### Erro de Database
```bash
# Testar conexão
curl https://seu-backend.vercel.app/health
```

## 📝 Checklist de Deploy

### Pré-Deploy
- [ ] Código commitado no GitHub
- [ ] Variáveis de ambiente definidas
- [ ] Banco PostgreSQL configurado
- [ ] URLs atualizadas nos configs

### Pós-Deploy
- [ ] Health check funcionando
- [ ] API endpoints respondendo
- [ ] Frontend carregando
- [ ] Autenticação funcionando
- [ ] CORS configurado
- [ ] Performance aceitável
- [ ] Logs sendo gerados

## 🆘 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Integration**: https://vercel.com/docs/git
- **PostgreSQL**: https://vercel.com/docs/storage/vercel-postgres
- **Troubleshooting**: https://vercel.com/docs/platform/frequently-asked-questions