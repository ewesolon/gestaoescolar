# Script de Restauração do Banco PostgreSQL
# Sistema de Gerenciamento de Alimentação Escolar

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$NewDbName = "",
    [switch]$DropExisting = $false,
    [switch]$CreateNew = $false,
    [string]$TableName = ""
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

Write-Host "🔄 RESTAURAÇÃO DO BANCO POSTGRESQL" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Verificar se o arquivo de backup existe
if (!(Test-Path $BackupFile)) {
    Write-Host "❌ ERRO: Arquivo de backup não encontrado: $BackupFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "📁 Backups disponíveis:" -ForegroundColor Yellow
    if (Test-Path ".\backups") {
        Get-ChildItem ".\backups" -Filter "*.backup" | ForEach-Object {
            Write-Host "   $($_.Name)" -ForegroundColor Green
        }
        Get-ChildItem ".\backups" -Filter "*.sql" | ForEach-Object {
            Write-Host "   $($_.Name)" -ForegroundColor Green
        }
    } else {
        Write-Host "   Nenhum backup encontrado em .\backups" -ForegroundColor Gray
    }
    exit 1
}

# Determinar se é novo banco
if ($NewDbName -ne "") {
    $DbName = $NewDbName
    $CreateNew = $true
}

Write-Host "Host: $DbHost" -ForegroundColor Green
Write-Host "Porta: $DbPort" -ForegroundColor Green
Write-Host "Banco: $DbName" -ForegroundColor Green
Write-Host "Usuário: $DbUser" -ForegroundColor Green
Write-Host "Arquivo: $BackupFile" -ForegroundColor Green
Write-Host ""

# Verificar se pg_restore/psql está disponível
try {
    $pgRestoreVersion = & pg_restore --version 2>$null
    Write-Host "✅ pg_restore encontrado: $pgRestoreVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: pg_restore não encontrado!" -ForegroundColor Red
    Write-Host "   Instale o PostgreSQL client tools ou adicione ao PATH" -ForegroundColor Yellow
    exit 1
}

# Configurar variável de ambiente para senha
$env:PGPASSWORD = $DbPassword

try {
    # Determinar tipo de arquivo
    $IsCustomFormat = $BackupFile -match "\.backup$"
    
    if ($CreateNew) {
        Write-Host "🆕 Criando novo banco: $DbName" -ForegroundColor Yellow
        & createdb --host=$DbHost --port=$DbPort --username=$DbUser $DbName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Banco pode já existir ou erro na criação" -ForegroundColor Yellow
        }
    }
    
    if ($DropExisting -and !$CreateNew) {
        Write-Host "⚠️  ATENÇÃO: Isso irá APAGAR todos os dados existentes!" -ForegroundColor Red
        $Confirm = Read-Host "Digite 'CONFIRMAR' para continuar"
        
        if ($Confirm -ne "CONFIRMAR") {
            Write-Host "❌ Operação cancelada pelo usuário" -ForegroundColor Yellow
            exit 0
        }
    }

    Write-Host "🚀 Iniciando restauração..." -ForegroundColor Yellow

    if ($IsCustomFormat) {
        # Backup comprimido (.backup)
        $RestoreArgs = @(
            "--host=$DbHost",
            "--port=$DbPort",
            "--username=$DbUser",
            "--dbname=$DbName",
            "--verbose",
            "--no-password"
        )
        
        if ($DropExisting) {
            $RestoreArgs += "--clean"
        }
        
        if ($TableName -ne "") {
            $RestoreArgs += "--table=$TableName"
            Write-Host "   Restaurando apenas tabela: $TableName" -ForegroundColor Cyan
        }
        
        $RestoreArgs += $BackupFile
        
        & pg_restore @RestoreArgs
        
    } else {
        # Backup SQL (.sql)
        Write-Host "   Executando arquivo SQL..." -ForegroundColor Cyan
        
        & psql --host=$DbHost --port=$DbPort --username=$DbUser --dbname=$DbName --file=$BackupFile
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ RESTAURAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
        Write-Host "   Banco: $DbName" -ForegroundColor Cyan
        Write-Host "   Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
        
        # Verificar algumas tabelas principais
        Write-Host ""
        Write-Host "🔍 Verificando tabelas restauradas..." -ForegroundColor Yellow
        
        $CheckQuery = @"
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.tablename) as colunas
FROM pg_tables t 
WHERE schemaname = 'public' 
ORDER BY tablename;
"@
        
        try {
            $Tables = & psql --host=$DbHost --port=$DbPort --username=$DbUser --dbname=$DbName --tuples-only --command=$CheckQuery 2>$null
            
            if ($Tables) {
                Write-Host "   Tabelas encontradas:" -ForegroundColor Green
                $Tables | ForEach-Object {
                    if ($_.Trim()) {
                        Write-Host "     $_" -ForegroundColor Gray
                    }
                }
            }
        } catch {
            Write-Host "   (Não foi possível verificar tabelas)" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "❌ ERRO durante a restauração!" -ForegroundColor Red
        Write-Host "   Verifique se:" -ForegroundColor Yellow
        Write-Host "   - O banco de destino existe" -ForegroundColor Yellow
        Write-Host "   - As credenciais estão corretas" -ForegroundColor Yellow
        Write-Host "   - O arquivo de backup é válido" -ForegroundColor Yellow
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
Write-Host "📋 EXEMPLOS DE USO:" -ForegroundColor Yellow
Write-Host "   # Restaurar backup completo (substitui dados existentes):"
Write-Host "   .\restore_database.ps1 -BackupFile '.\backups\backup.backup' -DropExisting" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Criar novo banco e restaurar:"
Write-Host "   .\restore_database.ps1 -BackupFile '.\backups\backup.backup' -NewDbName 'alimentacao_teste'" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Restaurar apenas uma tabela:"
Write-Host "   .\restore_database.ps1 -BackupFile '.\backups\backup.backup' -TableName 'produtos'" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 DICA: Sempre teste a restauração em um banco separado primeiro!" -ForegroundColor Green