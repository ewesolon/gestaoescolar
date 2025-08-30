# Configuração do Frontend para Vercel

## URL do Backend Confirmada
**Endereço correto do backend:** `gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app`

## Configuração das Variáveis de Ambiente no Vercel

### Passo a Passo:
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `gestaoescolar` (frontend)
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```
VITE_API_URL=https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api
VITE_HEALTH_URL=https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health
VITE_VERCEL=true
VITE_APP_NAME=Sistema de Alimentação Escolar
VITE_APP_VERSION=1.0.0
```

### Solução para Proteção de Deploy (se necessário):
1. Vá em **Settings** → **Deployment Protection**
2. Desative **Vercel Authentication** para permitir acesso público
3. **OU** gere um **Protection Bypass Token** e use na URL

### Após configurar:
1. Faça um novo deploy
2. O login funcionará com:
   - Email: ewenunes0@gmail.com
   - Senha: @Nunes8922