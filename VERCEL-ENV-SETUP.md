# Configuração de Variáveis de Ambiente no Vercel

## Variáveis Obrigatórias

Configure estas variáveis no painel do Vercel (Settings > Environment Variables):

### Database
```
POSTGRES_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
```

### Aplicação
```
NODE_ENV=production
VERCEL=1
PORT=3000
```

### Segurança
```
JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*
```

### SSL
```
DB_SSL=true
```

## Como Configurar

1. Acesse o painel do Vercel
2. Vá em Settings > Environment Variables
3. Adicione cada variável acima
4. Selecione "Production", "Preview" e "Development" para cada uma
5. Clique em "Save"

## Verificação

Após configurar, teste com:
```powershell
./test-vercel-deployment.ps1
```

## Troubleshooting

- Se der erro de conexão DB, verifique se POSTGRES_URL está correto
- Se der erro 500, verifique se JWT_SECRET tem pelo menos 32 caracteres
- Se der erro CORS, verifique se CORS_ORIGIN está configurado