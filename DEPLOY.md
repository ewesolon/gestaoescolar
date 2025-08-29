# Deploy no Vercel - Sistema de Gestão Escolar

## 🚀 Configuração para Deploy

### 1. Preparação do Projeto

O projeto está configurado para deploy no Vercel com:
- Frontend React/Vite
- Backend Node.js/Express
- Configuração automática via `vercel.json`

### 2. Variáveis de Ambiente Necessárias

Configure no Vercel Dashboard:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
CORS_ORIGIN=https://your-app.vercel.app

# Node Environment
NODE_ENV=production
```

### 3. Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Deploy via GitHub

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. O deploy será automático a cada push

### 5. Configuração de Banco de Dados

Para produção, recomendamos:
- **Neon** (PostgreSQL serverless)
- **Supabase** (PostgreSQL com interface)
- **PlanetScale** (MySQL serverless)

### 6. Estrutura de Arquivos

```
├── vercel.json          # Configuração do Vercel
├── frontend/            # React App
│   ├── dist/           # Build output
│   └── package.json    # Frontend dependencies
├── backend/            # Node.js API
│   ├── src/           # TypeScript source
│   └── package.json   # Backend dependencies
└── .env.production    # Environment template
```

### 7. Comandos de Build

- **Frontend**: `npm run vercel-build` (na pasta frontend)
- **Backend**: `npm run vercel-build` (na pasta backend)

### 8. Troubleshooting

#### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se os scripts de build estão corretos

#### Erro de Database
- Configure a `DATABASE_URL` corretamente
- Execute as migrações no banco de produção

#### Erro de CORS
- Configure `CORS_ORIGIN` com a URL do Vercel
- Verifique se o frontend está fazendo requests para `/api`

### 9. Monitoramento

- Use o dashboard do Vercel para logs
- Configure alertas para erros
- Monitore performance e usage

### 10. Domínio Personalizado

1. Vá em Settings > Domains no Vercel
2. Adicione seu domínio
3. Configure DNS conforme instruções