# Sistema de Configuração Flexível

Este projeto usa um sistema de configuração baseado em JSON que permite fácil troca entre diferentes ambientes e computadores.

## 🚀 Configuração Rápida

### Ambiente Local (mesmo computador)
```powershell
.\setup-local.ps1
```

### Ambiente de Rede (acessível de outros computadores)
```powershell
# Substitua pelo seu IP real
.\setup-network.ps1 -BackendIP "192.168.1.100"
```

## 📁 Arquivos de Configuração

### `config.json`
Configuração principal do sistema. Define:
- URLs e portas do backend
- Configurações de CORS
- URLs da API para o frontend
- Configurações do banco de dados

### `backend/.env`
Variáveis de ambiente do backend:
- Configurações do servidor
- Credenciais do banco PostgreSQL
- Configurações JWT
- Configurações de upload

### `frontend/.env`
Variáveis de ambiente do frontend:
- URL da API
- Configurações de desenvolvimento

## 🔧 Configuração Manual

Se preferir configurar manualmente:

1. **Copie os arquivos de exemplo:**
   ```powershell
   copy .env.example backend\.env
   copy .env.example frontend\.env
   ```

2. **Edite as configurações conforme necessário**

3. **Atualize o `config.json` com suas configurações**

## 🌐 Configurações por Ambiente

### Desenvolvimento Local
- Backend: `localhost:3000`
- Frontend: `localhost:5173`
- Database: `localhost:5432`
- CORS: Permite localhost e 127.0.0.1

### Desenvolvimento em Rede
- Backend: `0.0.0.0:3000` (acessível de qualquer IP)
- Frontend: `localhost:5173` (proxy para IP específico)
- Database: `localhost:5432`
- CORS: Permite qualquer origem em desenvolvimento

### Produção
- Backend: `0.0.0.0:3000`
- Frontend: Usa `/api` (sem proxy)
- Database: Configurável
- CORS: Apenas domínios específicos
- SSL: Habilitado

## 🔒 Segurança

- **Senhas**: Sempre definidas em `.env`, nunca no `config.json`
- **JWT Secret**: Deve ser alterado em produção
- **CORS**: Configurado adequadamente por ambiente
- **SSL**: Habilitado automaticamente em produção

## 🛠️ Troubleshooting

### Erro de Conexão
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no `.env`
3. Teste a conexão: `npm run test-db`

### Erro de CORS
1. Verifique se o IP está correto no `config.json`
2. Confirme se o frontend está usando o proxy correto
3. Reinicie ambos os servidores após mudanças

### Erro de Proxy (Frontend)
1. Verifique se o backend está rodando
2. Confirme o IP no `config.json`
3. Teste diretamente: `http://IP:3000/health`

## 📋 Comandos Úteis

```powershell
# Testar configuração
cd backend && npm run test-db

# Ver configuração atual
type config.json

# Verificar variáveis de ambiente
cd backend && type .env
cd frontend && type .env

# Reiniciar com nova configuração
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm run dev
```

## 🔄 Mudança de Computador

Quando trocar de computador:

1. **Descubra seu novo IP:**
   ```powershell
   ipconfig | findstr IPv4
   ```

2. **Configure para rede:**
   ```powershell
   .\setup-network.ps1 -BackendIP "SEU_NOVO_IP"
   ```

3. **Ou configure para local:**
   ```powershell
   .\setup-local.ps1
   ```

4. **Reinicie os servidores**

## 💡 Dicas

- Use configuração **local** para desenvolvimento no mesmo computador
- Use configuração **rede** quando quiser acessar de outros dispositivos
- Sempre reinicie os servidores após mudanças de configuração
- Mantenha backups das configurações que funcionam
- Teste sempre com `http://IP:3000/health` antes de usar o frontend