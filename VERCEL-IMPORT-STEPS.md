# 🚀 Importar no Vercel - Passos Finais

## ✅ Código já está no GitHub!
Repositório: https://github.com/ewesolon/gestaoescolar

## 📋 Agora siga estes passos:

### 1. 🌐 Acesse o Vercel
👉 https://vercel.com/dashboard

### 2. 📦 Importe o Projeto Backend
1. Clique **"Add New..."** → **"Project"**
2. Encontre **"ewesolon/gestaoescolar"**
3. Clique **"Import"**
4. Configure:
   - **Project Name**: `gestaoescolar-backend`
   - **Framework**: `Other`
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables** (IMPORTANTE):
```
NODE_ENV=production
POSTGRES_URL=postgresql://user:password@host:port/database
JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres
FRONTEND_URL=https://gestaoescolar-frontend.vercel.app
VERCEL=1
```

6. Clique **"Deploy"**

### 3. 📦 Importe o Projeto Frontend
1. **Novamente** clique **"Add New..."** → **"Project"**
2. Encontre **"ewesolon/gestaoescolar"** (mesmo repo)
3. Clique **"Import"**
4. Configure:
   - **Project Name**: `gestaoescolar-frontend`
   - **Framework**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Environment Variables**:
```
VITE_API_URL=https://gestaoescolar-backend.vercel.app/api
VITE_HEALTH_URL=https://gestaoescolar-backend.vercel.app/health
VITE_VERCEL=true
VITE_APP_NAME=Sistema de Alimentação Escolar
```

6. Clique **"Deploy"**

### 4. 🗄️ Configure PostgreSQL

#### Opção Recomendada: Neon Database (Gratuito)
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie novo projeto: "gestaoescolar"
4. Copie a **Connection String**
5. No Vercel, vá no projeto **backend**
6. **Settings** → **Environment Variables**
7. Edite `POSTGRES_URL` e cole a connection string

### 5. ✅ Teste o Deploy

#### Backend:
👉 https://gestaoescolar-backend.vercel.app/health

#### Frontend:
👉 https://gestaoescolar-frontend.vercel.app

## 🔧 Se der erro:

### ❌ Backend não funciona:
- Verifique se `POSTGRES_URL` está correto
- Verifique logs no Vercel Dashboard

### ❌ Frontend não conecta na API:
- Verifique se `VITE_API_URL` aponta para o backend correto
- Verifique se CORS está configurado

### ❌ Erro de CORS:
- Atualize `FRONTEND_URL` no backend com a URL real do frontend

## 🎉 URLs Finais

Após tudo configurado:
- **🌐 App**: https://gestaoescolar-frontend.vercel.app
- **⚡ API**: https://gestaoescolar-backend.vercel.app/api
- **❤️ Health**: https://gestaoescolar-backend.vercel.app/health

## 📱 Próximos Passos

1. ✅ Testar todas as funcionalidades
2. ✅ Configurar domínio customizado (opcional)
3. ✅ Configurar analytics
4. ✅ Deploy automático está ativo (push = deploy)

**🎊 Parabéns! Seu sistema está no ar!**