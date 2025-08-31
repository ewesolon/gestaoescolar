# Guia de Deploy no Vercel - Sistema de Alimentação Escolar

## ✅ Correções Aplicadas

### 1. Arquivo de Entrada Simplificado
- Criado `backend/vercel-entry.js` em JavaScript puro
- Evita problemas de compilação TypeScript
- Inclui apenas funcionalidades essenciais

### 2. Configuração do Vercel
- `backend/vercel.json` configurado corretamente
- Aponta para `vercel-entry.js`
- Variáveis de ambiente configuradas

### 3. Endpoints Básicos Funcionais
- `/health` - Status do sistema
- `/api/test-db` - Teste de conexão PostgreSQL
- `/api/usuarios` - Lista básica de usuários
- `/api/escolas` - Lista básica de escolas
- `/api/produtos` - Lista básica de produtos

## 🚀 Como Fazer o Deploy

### 1. Configurar Variáveis de Ambiente no Vercel
No painel do Vercel, adicione estas variáveis:

```
POSTGRES_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
NODE_ENV=production
VERCEL=1
JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=24h
```

### 2. Deploy via CLI do Vercel
```bash
cd backend
npx vercel --prod
```

### 3. Deploy via GitHub
1. Conecte o repositório ao Vercel
2. Configure o diretório raiz como `backend`
3. As variáveis de ambiente serão aplicadas automaticamente

## 🔧 Estrutura do Deploy

```
backend/
├── vercel-entry.js     # Arquivo principal (JavaScript puro)
├── vercel.json         # Configuração do Vercel
├── package.json        # Dependências
├── .vercelignore       # Arquivos ignorados no deploy
└── .env.production     # Variáveis de ambiente (não commitado)
```

## 🧪 Testando o Deploy

Após o deploy, teste estes endpoints:

1. **Health Check**: `https://seu-app.vercel.app/health`
2. **Teste DB**: `https://seu-app.vercel.app/api/test-db`
3. **Usuários**: `https://seu-app.vercel.app/api/usuarios`
4. **Escolas**: `https://seu-app.vercel.app/api/escolas`
5. **Produtos**: `https://seu-app.vercel.app/api/produtos`

## ⚠️ Observações Importantes

1. **Banco de Dados**: Usando Supabase PostgreSQL
2. **CORS**: Configurado para aceitar qualquer origem (*)
3. **SSL**: Habilitado para produção
4. **Conexões**: Pool otimizado para Vercel Serverless
5. **Logs**: Erros são logados no console do Vercel

## 🔄 Próximos Passos

Após confirmar que o deploy básico funciona:

1. Adicionar mais rotas gradualmente
2. Implementar autenticação JWT
3. Adicionar middleware de segurança
4. Configurar domínio customizado
5. Implementar monitoramento

## 🐛 Troubleshooting

### Erro de Conexão com Banco
- Verifique se as variáveis `POSTGRES_URL` e `DATABASE_URL` estão corretas
- Confirme se o Supabase está acessível

### Erro 500 Internal Server Error
- Verifique os logs no painel do Vercel
- Teste os endpoints individualmente

### Timeout de Função
- Vercel tem limite de 10s para funções gratuitas
- Otimize queries do banco de dados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Vercel
2. Teste a conexão com o banco via `/api/test-db`
3. Confirme as variáveis de ambiente