# Sistema de Backup PostgreSQL
## Gerenciamento de Alimentação Escolar

Este sistema fornece scripts automatizados para backup e restauração do banco PostgreSQL.

## 📋 Pré-requisitos

- PostgreSQL Client Tools instalado
- PowerShell 5.0 ou superior
- Acesso ao banco PostgreSQL configurado

## 🛠️ Scripts Disponíveis

### 1. `backup_database.ps1` - Backup Manual
Cria backup do banco de dados com opções flexíveis.

**Uso básico:**
```powershell
.\backup_database.ps1
```

**Opções avançadas:**
```powershell
# Backup apenas da estrutura (schema)
.\backup_database.ps1 -SchemaOnly

# Backup apenas dos dados
.\backup_database.ps1 -DataOnly

# Backup sem compressão (formato SQL)
.\backup_database.ps1 -Compress:$false

# Backup em diretório personalizado
.\backup_database.ps1 -BackupPath "C:\MeusBackups"
```

### 2. `restore_database.ps1` - Restauração
Restaura backup do banco de dados.

**Uso básico:**
```powershell
.\restore_database.ps1 -BackupFile ".\backups\backup_20241227_143022.backup"
```

**Opções avançadas:**
```powershell
# Criar novo banco e restaurar
.\restore_database.ps1 -BackupFile "backup.backup" -NewDbName "alimentacao_teste"

# Substituir banco existente (CUIDADO!)
.\restore_database.ps1 -BackupFile "backup.backup" -DropExisting

# Restaurar apenas uma tabela
.\restore_database.ps1 -BackupFile "backup.backup" -TableName "produtos"
```

### 3. `backup_automatico.ps1` - Backup Automático
Gerencia backups automáticos e limpeza de arquivos antigos.

**Uso básico:**
```powershell
.\backup_automatico.ps1
```

**Configurar tarefa agendada:**
```powershell
.\backup_automatico.ps1 -ScheduleTask
```

**Personalizar retenção:**
```powershell
.\backup_automatico.ps1 -RetentionDays 60
```

## 📁 Estrutura de Arquivos

```
projeto/
├── backup_database.ps1      # Script de backup manual
├── restore_database.ps1     # Script de restauração
├── backup_automatico.ps1    # Script de backup automático
├── test_backup_simple.ps1   # Teste do sistema
├── backups/                 # Diretório de backups (criado automaticamente)
│   ├── alimentacao_escolar_backup_20241227_143022_compressed.backup
│   ├── alimentacao_escolar_backup_20241227_143022_compressed.info.txt
│   └── ...
└── backend/
    └── .env                 # Configurações do banco
```

## ⚙️ Configuração

As configurações são lidas automaticamente do arquivo `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alimentacao_escolar
DB_USER=postgres
DB_PASSWORD=admin123
```

## 🔄 Backup Automático

### Configurar Tarefa Agendada (Windows)
```powershell
.\backup_automatico.ps1 -ScheduleTask
```

Isso criará uma tarefa que executa diariamente às 02:00.

### Gerenciar Tarefa Agendada
```powershell
# Verificar status
Get-ScheduledTask -TaskName "BackupAlimentacaoEscolar"

# Executar manualmente
Start-ScheduledTask -TaskName "BackupAlimentacaoEscolar"

# Remover tarefa
Unregister-ScheduledTask -TaskName "BackupAlimentacaoEscolar"
```

## 📊 Tipos de Backup

### 1. Backup Comprimido (Padrão)
- **Formato:** Custom (.backup)
- **Compressão:** Sim (nível 9)
- **Tamanho:** Menor
- **Restauração:** Apenas com pg_restore

### 2. Backup SQL
- **Formato:** SQL Text (.sql)
- **Compressão:** Não
- **Tamanho:** Maior
- **Restauração:** Com psql ou pg_restore

### 3. Backup Schema Only
- **Conteúdo:** Apenas estrutura (tabelas, índices, etc.)
- **Uso:** Criar ambiente de desenvolvimento

### 4. Backup Data Only
- **Conteúdo:** Apenas dados
- **Uso:** Migração de dados

## 🔧 Solução de Problemas

### Erro: "pg_dump não encontrado"
**Solução:** Instalar PostgreSQL Client Tools
- Download: https://www.postgresql.org/download/
- Adicionar ao PATH do Windows

### Erro: "Acesso negado"
**Verificar:**
- Credenciais no arquivo .env
- Permissões do usuário PostgreSQL
- Conectividade de rede

### Erro: "Banco não existe"
**Para restauração:**
```powershell
# Criar banco primeiro
createdb -h localhost -U postgres alimentacao_escolar

# Ou usar opção -CreateNew
.\restore_database.ps1 -BackupFile "backup.backup" -CreateNew
```

## 📈 Monitoramento

### Verificar Backups
```powershell
# Listar backups
Get-ChildItem .\backups -Filter "alimentacao_escolar_backup_*"

# Verificar tamanhos
Get-ChildItem .\backups | Measure-Object Length -Sum
```

### Testar Restauração
```powershell
# Criar banco de teste
.\restore_database.ps1 -BackupFile "backup.backup" -NewDbName "teste_restore"

# Verificar dados
psql -h localhost -U postgres -d teste_restore -c "SELECT COUNT(*) FROM produtos;"
```

## 🛡️ Boas Práticas

### Segurança
- ✅ Mantenha backups em local seguro
- ✅ Teste restauração regularmente
- ✅ Use senhas fortes
- ✅ Limite acesso aos arquivos de backup

### Retenção
- ✅ Configure retenção adequada (padrão: 30 dias)
- ✅ Monitore espaço em disco
- ✅ Mantenha backups offsite para DR

### Automação
- ✅ Configure backup automático diário
- ✅ Monitore logs de execução
- ✅ Configure alertas de falha

## 📞 Comandos de Emergência

### Restauração Rápida
```powershell
# Parar aplicação
# Fazer backup atual (se possível)
.\backup_database.ps1

# Restaurar backup anterior
.\restore_database.ps1 -BackupFile ".\backups\[ultimo_backup_bom].backup" -DropExisting

# Reiniciar aplicação
```

### Recuperação de Desastre
```powershell
# Criar novo banco
createdb -h localhost -U postgres alimentacao_escolar_recovery

# Restaurar do backup
.\restore_database.ps1 -BackupFile "backup.backup" -NewDbName "alimentacao_escolar_recovery"

# Atualizar configurações da aplicação
# Testar funcionalidade
# Promover para produção
```

## 📝 Logs e Auditoria

Cada backup gera um arquivo `.info.txt` com:
- Data/hora do backup
- Configurações utilizadas
- Comandos de restauração
- Informações técnicas

**Exemplo:**
```
alimentacao_escolar_backup_20241227_143022_compressed.backup
alimentacao_escolar_backup_20241227_143022_compressed.info.txt
```

---

## 🚀 Início Rápido

1. **Teste o sistema:**
   ```powershell
   .\test_backup_simple.ps1
   ```

2. **Primeiro backup:**
   ```powershell
   .\backup_database.ps1
   ```

3. **Configure automação:**
   ```powershell
   .\backup_automatico.ps1 -ScheduleTask
   ```

4. **Teste restauração:**
   ```powershell
   .\restore_database.ps1 -BackupFile ".\backups\[arquivo].backup" -NewDbName "teste"
   ```

**✨ Sistema de backup pronto para uso!**