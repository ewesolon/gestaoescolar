# 🚀 Guia Completo: GitHub → Vercel Deploy

## 📋 Passo a Passo Detalhado

### 1. 📦 Preparar e Enviar para GitHub

```powershell
# Execute o script de preparação
.\prepare-github.ps1
```

Ou manualmente:
```bash
git add .
git commit -m "feat: configuração para deploy Vercel"
git push origin main
```

### 2. 🌐 Importar no Vercel

#### Acesse o Vercel Dashboard
1. Vá para: https://vercel.com/dashboard
2. Clique em **"Add New..."** → **"Project"**
3. Conecte sua conta GitHub se necessário
4. Encontre seu repositório na lista

#### Configure o Backend (Projeto 1)
1. **Selecione** seu repositório
2. **Configure**:
   - **Project Name**: `alimentacao-escolar-backend`
   - **Framework Preset**: `Other`
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
```env
NODE_ENV=production
POSTGRES_URL=postgresql://user:password@host:port/database
JWT_SECRET=sua_chave_jwt_super_secreta_aqui_minimo_32_caracteres
FRONTEND_URL=https://alimentacao-escolar-frontend.vercel.app
VERCEL=1
```

4. **Deploy** → Aguarde o build

#### Configure o Frontend (Projeto 2)
1. **Importe novamente** o mesmo repositório
2. **Configure**:
   - **Project Name**: `alimentacao-escolar-frontend`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**:
```env
VITE_API_URL=https://alimentacao-escolar-backend.vercel.app/api
VITE_HEALTH_URL=https://alimentacao-escolar-backend.vercel.app/health
VITE_VERCEL=true
VITE_APP_NAME=Sistema de Alimentação Escolar
VITE_APP_VERSION=1.0.0
```

4. **Deploy** → Aguarde o build

### 3. 🗄️ Configurar Banco PostgreSQL

#### Opção A: Vercel Postgres (Mais Simples)
1. No projeto **backend** no Vercel
2. Vá em **Storage** → **Create Database**
3. Escolha **Postgres**
4. Copie a **Connection String**
5. Atualize `POSTGRES_URL` nas variáveis de ambiente

#### Opção B: Neon Database (Recomendado - Gratuito)
1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a **Connection String**
5. Configure como `POSTGRES_URL`

#### Opção C: Supabase (Alternativa)
1. Acesse: https://supabase.com
2. Crie projeto gratuito
3. Vá em **Settings** → **Database**
4. Copie **Connection String**
5. Configure como `POSTGRES_URL`

### 4. ✅ Verificar Deploy

#### Testar Backend
```bash
# Health check
curl https://alimentacao-escolar-backend.vercel.app/health

# Teste de API
curl https://alimentacao-escolar-backend.vercel.app/api/test-db
```

#### Testar Frontend
1. Acesse: https://alimentacao-escolar-frontend.vercel.app
2. Verifique se carrega corretamente
3. Teste login/navegação

### 5. 🔧 Configurações Avançadas

#### Custom Domains (Opcional)
```bash
# Backend
vercel domains add api.meudominio.com --scope=alimentacao-escolar-backend

# Frontend  
vercel domains add app.meudominio.com --scope=alimentacao-escolar-frontend
```

#### CORS para Domínio Customizado
Atualize no backend as variáveis:
```env
FRONTEND_URL=https://app.meudominio.com
```

## 🔄 Workflow de Desenvolvimento

### Branches e Deploy
- **main** → Deploy automático para produção
- **develop** → Preview deploy
- **feature/*** → Preview deploy por PR

### Atualizações
```bash
# Fazer mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático no Vercel!
```

## 📊 Monitoramento e Logs

### Ver Logs em Tempo Real
```bash
# Backend
vercel logs https://alimentacao-escolar-backend.vercel.app --follow

# Frontend
vercel logs https://alimentacao-escolar-frontend.vercel.app --follow
```

### Analytics
- Acesse cada projeto no Vercel Dashboard
- Vá em **Analytics** para métricas
- Configure **Alerts** para erros

## 🔍 Troubleshooting Comum

### ❌ Erro de Build Backend
```bash
# Verificar logs
vercel logs https://alimentacao-escolar-backend.vercel.app

# Possíveis causas:
# 1. Variável POSTGRES_URL incorreta
# 2. Dependências faltando
# 3. Timeout de função (>30s)
```

### ❌ Erro de Build Frontend
```bash
# Verificar se API_URL está correta
# Verificar se todas as dependências estão no package.json
# Verificar se não há imports absolutos quebrados
```

### ❌ Erro de CORS
```javascript
// No backend, verificar se FRONTEND_URL está correto
// Verificar se origins do CORS incluem o domínio do frontend
```

### ❌ Erro de Database
```bash
# Testar conexão local primeiro
# Verificar se POSTGRES_URL tem formato correto:
# postgresql://user:password@host:port/database?sslmode=require
```

## 📝 URLs Finais

Após deploy completo, você terá:

- **🌐 Frontend**: https://alimentacao-escolar-frontend.vercel.app
- **⚡ Backend**: https://alimentacao-escolar-backend.vercel.app  
- **🔌 API**: https://alimentacao-escolar-backend.vercel.app/api
- **❤️ Health**: https://alimentacao-escolar-backend.vercel.app/health

## 🎉 Pronto!

Seu sistema está no ar com:
- ✅ Deploy automático via GitHub
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Serverless scaling
- ✅ Preview deployments
- ✅ Analytics integrado