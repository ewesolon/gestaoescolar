# 🚀 Migração para Supabase - Guia Completo

## 🌟 Por que Supabase?

- ✅ **500MB gratuito** (vs 20MB ElephantSQL)
- ✅ **Dashboard visual** para gerenciar dados
- ✅ **API REST automática** para todas as tabelas
- ✅ **Autenticação integrada** (se quiser usar futuramente)
- ✅ **Real-time subscriptions** (opcional)
- ✅ **Backup automático**
- ✅ **SSL por padrão**

## 📋 Passo a Passo

### 1. 🌐 Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique **"Start your project"**
3. **Sign up** com GitHub (recomendado)
4. Confirme email se necessário

### 2. 📦 Criar Projeto

1. No dashboard, clique **"New project"**
2. **Organization**: Sua conta pessoal
3. **Name**: `gestaoescolar` ou `alimentacao-escolar`
4. **Database Password**: Crie uma senha forte (anote!)
5. **Region**: `South America (São Paulo)` (mais próximo)
6. Clique **"Create new project"**

⏱️ **Aguarde 2-3 minutos** para o projeto ser criado.

### 3. 🔗 Obter Connection String

1. No projeto criado, vá em **Settings** (⚙️)
2. Clique em **Database**
3. Na seção **Connection string**, escolha **URI**
4. Copie a string que aparece (algo como):
```
postgresql://postgres:suasenha@db.xxx.supabase.co:5432/postgres
```

### 4. 🚀 Executar Migração

```bash
# 1. Exportar dados locais
node migrate-to-supabase.js

# 2. Importar para Supabase (cole sua connection string)
node migrate-to-supabase.js import "postgresql://postgres:suasenha@db.xxx.supabase.co:5432/postgres"
```

### 5. ✅ Verificar Migração

1. No Supabase Dashboard, vá em **Table Editor**
2. Verifique se suas tabelas apareceram:
   - `usuarios`
   - `escolas`
   - `produtos`
   - `fornecedores`
   - etc.

3. Clique em uma tabela para ver os dados importados

### 6. 🔧 Configurar Aplicação

#### Backend (.env ou Vercel)
```env
# Configuração Supabase
POSTGRES_URL=postgresql://postgres:suasenha@db.xxx.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:suasenha@db.xxx.supabase.co:5432/postgres

# Configurações de produção
NODE_ENV=production
JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres
VERCEL=1
FRONTEND_URL=https://gestaoescolar-frontend.vercel.app
```

#### Frontend (.env ou Vercel)
```env
VITE_API_URL=https://gestaoescolar-backend.vercel.app/api
VITE_HEALTH_URL=https://gestaoescolar-backend.vercel.app/health
VITE_VERCEL=true
```

## 🔧 Configurações Avançadas Supabase

### Row Level Security (RLS)
Se quiser adicionar segurança extra:

```sql
-- Habilitar RLS na tabela usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo (temporário)
CREATE POLICY "Permitir tudo temporariamente" ON public.usuarios
  FOR ALL USING (true);
```

### API REST Automática
O Supabase gera automaticamente uma API REST para suas tabelas:
- **URL**: `https://xxx.supabase.co/rest/v1/`
- **Headers**: `apikey: sua_anon_key`

### Backup Automático
- Backups diários automáticos
- Retenção de 7 dias no plano gratuito
- Restore com 1 clique

## 🌐 Configurar no Vercel

### Backend Project
1. Vá no projeto backend no Vercel
2. **Settings** → **Environment Variables**
3. Adicione/edite:
   - `POSTGRES_URL` = sua connection string Supabase
   - `DATABASE_URL` = mesma connection string
4. **Redeploy** automático será feito

### Frontend Project
1. Vá no projeto frontend no Vercel
2. **Settings** → **Environment Variables**
3. Confirme se estão corretas:
   - `VITE_API_URL` = URL do seu backend
   - `VITE_HEALTH_URL` = URL do health check

## 🔍 Testar Migração

### 1. Health Check
```bash
curl https://gestaoescolar-backend.vercel.app/health
```

### 2. Teste de Database
```bash
curl https://gestaoescolar-backend.vercel.app/api/test-db
```

### 3. Teste de Login
1. Acesse: https://gestaoescolar-frontend.vercel.app
2. Tente fazer login com usuário existente
3. Verifique se dados carregam corretamente

## 📊 Monitoramento Supabase

### Dashboard Analytics
- **Database**: Uso de storage, conexões
- **API**: Requests por minuto
- **Auth**: Usuários ativos (se usar)

### Logs
- **Logs** tab no dashboard
- Queries SQL executadas
- Erros de conexão

## 🆘 Troubleshooting

### ❌ Erro de Conexão
```bash
# Verificar se connection string está correta
# Deve incluir ?sslmode=require no final se necessário
```

### ❌ Tabelas não aparecem
```bash
# Verificar se migração foi executada com sucesso
# Reexecutar: node migrate-to-supabase.js import "connection-string"
```

### ❌ Dados não carregam no frontend
```bash
# Verificar CORS no backend
# Verificar se VITE_API_URL aponta para backend correto
```

## 🎉 Vantagens Pós-Migração

### Para Desenvolvimento
- ✅ **Dashboard visual** para ver/editar dados
- ✅ **SQL Editor** integrado
- ✅ **API Explorer** automático
- ✅ **Logs em tempo real**

### Para Produção
- ✅ **Backup automático** diário
- ✅ **SSL/TLS** por padrão
- ✅ **Monitoramento** integrado
- ✅ **Escalabilidade** automática

### Para Futuro
- ✅ **Autenticação** Supabase (opcional)
- ✅ **Storage** para arquivos (opcional)
- ✅ **Edge Functions** (opcional)
- ✅ **Real-time** subscriptions (opcional)

## 📝 Checklist Final

- [ ] Conta Supabase criada
- [ ] Projeto "gestaoescolar" criado
- [ ] Connection string copiada
- [ ] Migração executada com sucesso
- [ ] Tabelas visíveis no dashboard
- [ ] Variáveis Vercel atualizadas
- [ ] Health check funcionando
- [ ] API endpoints respondendo
- [ ] Frontend conectando corretamente
- [ ] Login funcionando
- [ ] Dados carregando

🎊 **Parabéns! Seu banco está na nuvem com Supabase!**