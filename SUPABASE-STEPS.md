# 🚀 Passos para Migrar para Supabase

## ✅ Você já tem:
- Connection String: `postgresql://postgres:[YOUR-PASSWORD]@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres`

## 📋 Próximos Passos:

### 1. 📤 Exportar Dados Locais
```bash
cd backend
node export-to-supabase.js
```

Isso vai gerar o arquivo `supabase-data.sql` com todos os seus dados.

### 2. 🌐 Acessar Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Entre no seu projeto "gestaoescolar"

### 3. 📊 Executar SQL no Supabase
1. No dashboard, clique em **"SQL Editor"** (ícone </> na lateral)
2. Clique em **"New query"**
3. Abra o arquivo `backend/supabase-data.sql` no seu editor
4. **Copie todo o conteúdo** do arquivo
5. **Cole** no SQL Editor do Supabase
6. Clique **"Run"** (ou Ctrl+Enter)

### 4. ✅ Verificar Importação
1. Vá em **"Table Editor"** no dashboard
2. Verifique se suas tabelas apareceram:
   - `usuarios`
   - `escolas` 
   - `produtos`
   - `fornecedores`
   - etc.
3. Clique em uma tabela para ver os dados

### 5. 🔧 Configurar Connection String
Sua connection string completa (substitua [YOUR-PASSWORD] pela senha real):
```
postgresql://postgres:SUA_SENHA_AQUI@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
```

### 6. 🌐 Atualizar Vercel
1. Vá no **projeto backend** no Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Edite ou adicione:
   - `POSTGRES_URL` = sua connection string completa
   - `DATABASE_URL` = mesma connection string
4. **Save** - redeploy automático será feito

### 7. 🔍 Testar
1. Aguarde o redeploy (1-2 minutos)
2. Teste: https://gestaoescolar-backend.vercel.app/health
3. Deve mostrar conexão com PostgreSQL

## 🎯 Exemplo de Connection String Completa:
```
postgresql://postgres:minhasenha123@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres
```

## 🆘 Se der erro:
- **Erro de senha**: Verifique se substituiu [YOUR-PASSWORD] pela senha real
- **Tabelas não aparecem**: Reexecute o SQL no Supabase
- **Conexão falha**: Verifique se a connection string está correta no Vercel

## 🎉 Após migração:
- ✅ Banco na nuvem (Supabase)
- ✅ Backup automático
- ✅ Dashboard visual
- ✅ SSL por padrão
- ✅ 500MB gratuito

**Pronto para executar o passo 1!** 🚀