# Deploy no Vercel - Guia Completo

## 📋 Pré-requisitos

1. **Conta no Vercel**: https://vercel.com
2. **Vercel CLI instalado**: `npm install -g vercel`
3. **Banco PostgreSQL**: Vercel Postgres ou Neon Database
4. **Repositório Git**: GitHub, GitLab ou Bitbucket

## 🚀 Processo de Deploy

### 1. Preparação do Ambiente

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login no Vercel
vercel login
```

### 2. Deploy do Backend

```bash
cd backend
vercel --prod
```

**Configurações necessárias no Vercel Dashboard:**

- `NODE_ENV=production`
- `POSTGRES_URL=postgresql://...` (URL do seu banco)
- `JWT_SECRET=sua_chave_super_secreta`
- `FRONTEND_URL=https://seu-frontend.vercel.app`

### 3. Deploy do Frontend

```bash
cd frontend
vercel --prod
```

**Configurações necessárias no Vercel Dashboard:**

- `VITE_API_URL=https://seu-backend.vercel.app/api`
- `VITE_HEALTH_URL=https://seu-backend.vercel.app/health`
- `VITE_VERCEL=true`

### 4. Configuração do Banco de Dados

#### Opção A: Vercel Postgres
1. Acesse o Vercel Dashboard
2. Vá em Storage > Create Database
3. Escolha Postgres
4. Copie a URL de conexão
5. Configure como `POSTGRES_URL`

#### Opção B: Neon Database
1. Acesse https://neon.tech
2. Crie uma conta e database
3. Copie a connection string
4. Configure como `POSTGRES_URL`

### 5. Script Automatizado

Execute o script completo:

```powershell
.\deploy-vercel-complete.ps1
```

## 🔧 Configurações Importantes

### Backend (Serverless Functions)

- **Timeout**: 30 segundos máximo
- **Memory**: 1024MB padrão
- **Regions**: Automático (us-east-1)
- **Runtime**: Node.js 18.x

### Frontend (Static Site)

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x
- **Framework**: Vite

## 🌐 URLs de Exemplo

Após o deploy, você terá:

- **Backend**: `https://seu-backend.vercel.app`
- **Frontend**: `https://seu-frontend.vercel.app`
- **API**: `https://seu-backend.vercel.app/api`
- **Health**: `https://seu-backend.vercel.app/health`

## 🔍 Troubleshooting

### Erro de CORS
```javascript
// Adicione no backend/api/index.ts
app.use(cors({
  origin: ['https://seu-frontend.vercel.app'],
  credentials: true
}));
```

### Erro de Database
```bash
# Verifique a connection string
echo $POSTGRES_URL
```

### Erro de Build
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Timeout de Function
```json
// vercel.json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📊 Monitoramento

### Logs do Vercel
```bash
vercel logs https://seu-backend.vercel.app
```

### Analytics
- Acesse Vercel Dashboard > Analytics
- Monitore performance e erros
- Configure alertas

## 🔄 CI/CD Automático

### GitHub Integration
1. Conecte repositório no Vercel
2. Configure auto-deploy em push
3. Configure preview deployments

### Variáveis por Ambiente
- **Production**: Variáveis de produção
- **Preview**: Variáveis de teste
- **Development**: Variáveis locais

## 📝 Checklist Final

- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] Banco PostgreSQL configurado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado corretamente
- [ ] Health check respondendo
- [ ] API endpoints funcionando
- [ ] Autenticação funcionando
- [ ] Upload de arquivos (se necessário)
- [ ] Logs sendo gerados
- [ ] Performance aceitável

## 🆘 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **PostgreSQL Docs**: https://www.postgresql.org/docs/