# Script de Backup do Banco PostgreSQL
# Sistema de Gerenciamento de Alimentação Escolar

param(
    [string]$BackupPath = ".\backups",
    [switch]$Compress = $true,
    [switch]$SchemaOnly = $false,
    [switch]$DataOnly = $false
)

# Configurações do banco (lendo do .env)
$EnvFile = ".\backend\.env"
$DbHost = "localhost"
$DbPort = "5432"
$DbName = "alimentacao_escolar"
$DbUser = "postgres"
$DbPassword = "admin123"

# Ler configurações do arquivo .env se existir
if (Test-Path $EnvFile) {
    Write-Host "📄 Lendo configurações do arquivo .env..." -ForegroundColor Yellow
    
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match "^DB_HOST=(.+)$") { $DbHost = $matches[1] }
        if ($_ -match "^DB_PORT=(.+)$") { $DbPort = $matches[1] }
        if ($_ -match "^DB_NAME=(.+)$") { $DbName = $matches[1] }
        if ($_ -match "^DB_USER=(.+)$") { $DbUser = $matches[1] }
        if ($_ -match "^DB_PASSWORD=(.+)$") { $DbPassword = $matches[1] }
    }
}

Write-Host "🗄️  BACKUP DO BANCO POSTGRESQL" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Host: $DbHost" -ForegroundColor Green
Write-Host "Porta: $DbPort" -ForegroundColor Green
Write-Host "Banco: $DbName" -ForegroundColor Green
Write-Host "Usuário: $DbUser" -ForegroundColor Green
Write-Host ""

# Verificar se pg_dump está disponível
try {
    $pgDumpVersion = & pg_dump --version 2>$null
    Write-Host "✅ pg_dump encontrado: $pgDumpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: pg_dump não encontrado!" -ForegroundColor Red
    Write-Host "   Instale o PostgreSQL client tools ou adicione ao PATH" -ForegroundColor Yellow
    Write-Host "   Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Criar diretório de backup
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "📁 Diretório de backup criado: $BackupPath" -ForegroundColor Green
}

# Gerar nome do arquivo com timestamp
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFileName = "alimentacao_escolar_backup_$Timestamp"

# Determinar extensão e opções
$Extension = ".sql"
$PgDumpOptions = @()

if ($SchemaOnly) {
    $PgDumpOptions += "--schema-only"
    $BackupFileName += "_schema"
} elseif ($DataOnly) {
    $PgDumpOptions += "--data-only"
    $BackupFileName += "_data"
} else {
    $PgDumpOptions += "--clean", "--create"
}

if ($Compress) {
    $Extension = ".backup"
    $PgDumpOptions += "--format=custom", "--compress=9"
    $BackupFileName += "_compressed"
}

$BackupFile = Join-Path $BackupPath "$BackupFileName$Extension"

# Configurar variável de ambiente para senha
$env:PGPASSWORD = $DbPassword

Write-Host "🚀 Iniciando backup..." -ForegroundColor Yellow
Write-Host "   Arquivo: $BackupFile" -ForegroundColor Cyan

try {
    # Executar pg_dump
    $PgDumpArgs = @(
        "--host=$DbHost",
        "--port=$DbPort",
        "--username=$DbUser",
        "--verbose",
        "--no-password"
    ) + $PgDumpOptions + @($DbName)

    if ($Compress) {
        & pg_dump @PgDumpArgs --file="$BackupFile"
    } else {
        & pg_dump @PgDumpArgs | Out-File -FilePath $BackupFile -Encoding UTF8
    }

    if ($LASTEXITCODE -eq 0) {
        $FileSize = (Get-Item $BackupFile).Length
        $FileSizeMB = [math]::Round($FileSize / 1MB, 2)
        
        Write-Host ""
        Write-Host "✅ BACKUP CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
        Write-Host "   Arquivo: $BackupFile" -ForegroundColor Cyan
        Write-Host "   Tamanho: $FileSizeMB MB" -ForegroundColor Cyan
        Write-Host "   Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
        
        # Criar arquivo de informações
        $InfoFile = $BackupFile -replace "\.(sql|backup)$", ".info.txt"
        @"
BACKUP DO BANCO POSTGRESQL
==========================
Sistema: Gerenciamento de Alimentação Escolar
Data/Hora: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')
Servidor: ${DbHost}:${DbPort}
Banco: $DbName
Usuário: $DbUser
Arquivo: $BackupFileName$Extension
Tamanho: $FileSizeMB MB
Tipo: $(if ($SchemaOnly) { "Apenas Schema" } elseif ($DataOnly) { "Apenas Dados" } else { "Completo (Schema + Dados)" })
Compressão: $(if ($Compress) { "Sim (Custom Format)" } else { "Não (SQL Text)" })

COMO RESTAURAR:
===============
Para backup comprimido (.backup):
pg_restore --host=localhost --port=5432 --username=postgres --dbname=alimentacao_escolar --clean --create --verbose "$BackupFileName$Extension"

Para backup SQL (.sql):
psql --host=localhost --port=5432 --username=postgres --dbname=postgres --file="$BackupFileName$Extension"

COMANDOS ÚTEIS:
===============
# Listar conteúdo do backup comprimido:
pg_restore --list "$BackupFileName$Extension"

# Restaurar apenas uma tabela específica:
pg_restore --host=localhost --port=5432 --username=postgres --dbname=alimentacao_escolar --table=nome_da_tabela "$BackupFileName$Extension"

# Criar novo banco e restaurar:
createdb --host=localhost --port=5432 --username=postgres alimentacao_escolar_restore
pg_restore --host=localhost --port=5432 --username=postgres --dbname=alimentacao_escolar_restore --verbose "$BackupFileName$Extension"
"@ | Out-File -FilePath $InfoFile -Encoding UTF8

        Write-Host "   Info: $InfoFile" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ ERRO durante o backup!" -ForegroundColor Red
        exit 1
    }

} catch {
    Write-Host "❌ ERRO: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Limpar variável de ambiente da senha
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "📋 OPÇÕES DE BACKUP DISPONÍVEIS:" -ForegroundColor Yellow
Write-Host "   .\backup_database.ps1                    # Backup completo comprimido"
Write-Host "   .\backup_database.ps1 -Compress:`$false   # Backup completo SQL"
Write-Host "   .\backup_database.ps1 -SchemaOnly        # Apenas estrutura"
Write-Host "   .\backup_database.ps1 -DataOnly          # Apenas dados"
Write-Host "   .\backup_database.ps1 -BackupPath 'C:\Backups' # Diretório personalizado"
Write-Host ""
Write-Host "💡 DICA: Mantenha backups regulares para segurança dos dados!" -ForegroundColor Green