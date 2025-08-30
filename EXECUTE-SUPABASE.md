# 🚀 Executar Migração no Supabase - PASSO A PASSO

## ✅ Você já tem:
- ✅ Dados exportados do PostgreSQL local
- ✅ Projeto criado no Supabase
- ✅ Connection String: `postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres`

## 📋 Execute AGORA:

### 1. 🌐 Acessar Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Entre no seu projeto "gestaoescolar"

### 2. 📊 Criar Estrutura das Tabelas
1. No dashboard, clique em **"SQL Editor"** (ícone </> na lateral esquerda)
2. Clique em **"New query"**
3. **COPIE** todo o conteúdo do arquivo `backend/create-supabase-schema.sql`
4. **COLE** no editor SQL
5. Clique **"Run"** (ou Ctrl+Enter)

✅ **Resultado esperado**: "Success. No rows returned"

### 3. ✅ Verificar Tabelas Criadas
1. Vá em **"Table Editor"** (ícone de tabela na lateral)
2. Você deve ver as tabelas:
   - `usuarios`
   - `escolas`
   - `modalidades`
   - `produtos`
   - `fornecedores`
   - `contratos`
   - etc.

### 4. 📤 Importar Dados
Agora execute no seu terminal:

```bash
cd backend
set DB_PASSWORD=admin123
node import-data-only.js "postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres"
```

### 5. ✅ Verificar Dados Importados
1. No **Table Editor** do Supabase
2. Clique em cada tabela para ver os dados:
   - `usuarios`: deve ter 2 registros
   - `escolas`: deve ter 54 registros
   - `produtos`: deve ter 12 registros
   - etc.

### 6. 🔧 Configurar no Vercel
1. Acesse: https://vercel.com/dashboard
2. Vá no projeto **backend** (gestaoescolar-backend)
3. **Settings** → **Environment Variables**
4. Edite ou adicione:
   - `POSTGRES_URL` = `postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres`
   - `DATABASE_URL` = mesma string acima
5. **Save** (redeploy automático)

### 7. 🔍 Testar Migração
Após 1-2 minutos do redeploy:

```bash
# Teste 1: Health check
curl https://gestaoescolar-backend.vercel.app/health

# Teste 2: Database
curl https://gestaoescolar-backend.vercel.app/api/test-db
```

**Resultado esperado**: Conexão com PostgreSQL funcionando

### 8. 🌐 Testar Frontend
1. Acesse: https://gestaoescolar-frontend.vercel.app
2. Tente fazer login
3. Verifique se dados carregam

## 📄 Arquivos Importantes:

- `backend/create-supabase-schema.sql` - **Execute no SQL Editor**
- `backend/import-data-only.js` - **Execute no terminal**

## 🆘 Se der erro:

### ❌ "Tabela já existe"
- Normal, pode ignorar

### ❌ "Erro de conexão"
- Verifique se a senha `@Nunes8922` está correta
- Verifique se o projeto Supabase está ativo

### ❌ "Dados não aparecem"
- Reexecute o passo 4 (import-data-only.js)

## 🎉 Sucesso = 
- ✅ Tabelas criadas no Supabase
- ✅ Dados importados
- ✅ Vercel conectando ao Supabase
- ✅ Frontend funcionando

**Comece pelo passo 1! 🚀**