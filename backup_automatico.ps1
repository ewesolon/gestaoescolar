# Script de Backup Automático do PostgreSQL
# Sistema de Gerenciamento de Alimentação Escolar

param(
    [int]$RetentionDays = 30,
    [string]$BackupPath = ".\backups",
    [switch]$ScheduleTask = $false
)

Write-Host "🤖 BACKUP AUTOMÁTICO DO POSTGRESQL" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Função para fazer backup
function Invoke-DatabaseBackup {
    param([string]$Path)
    
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - Iniciando backup automático..." -ForegroundColor Yellow
    
    try {
        # Executar script de backup
        & .\backup_database.ps1 -BackupPath $Path -Compress
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - ✅ Backup concluído com sucesso" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Erro no backup" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - ❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Função para limpar backups antigos
function Remove-OldBackups {
    param(
        [string]$Path,
        [int]$Days
    )
    
    if (!(Test-Path $Path)) {
        return
    }
    
    $CutoffDate = (Get-Date).AddDays(-$Days)
    $OldFiles = Get-ChildItem $Path -Filter "alimentacao_escolar_backup_*" | Where-Object { $_.CreationTime -lt $CutoffDate }
    
    if ($OldFiles.Count -gt 0) {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - 🧹 Removendo $($OldFiles.Count) backup(s) antigo(s)..." -ForegroundColor Yellow
        
        foreach ($File in $OldFiles) {
            try {
                Remove-Item $File.FullName -Force
                Write-Host "   Removido: $($File.Name)" -ForegroundColor Gray
                
                # Remover arquivo .info correspondente
                $InfoFile = $File.FullName -replace "\.(backup|sql)$", ".info.txt"
                if (Test-Path $InfoFile) {
                    Remove-Item $InfoFile -Force
                }
            } catch {
                Write-Host "   Erro ao remover: $($File.Name)" -ForegroundColor Red
            }
        }
    }
}

# Criar tarefa agendada do Windows
if ($ScheduleTask) {
    Write-Host "📅 Configurando tarefa agendada..." -ForegroundColor Yellow
    
    $TaskName = "BackupAlimentacaoEscolar"
    $ScriptPath = $PSCommandPath
    $WorkingDir = $PSScriptRoot
    
    # Remover tarefa existente se houver
    try {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    } catch {}
    
    # Criar nova tarefa
    $Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`"" -WorkingDirectory $WorkingDir
    
    # Executar diariamente às 02:00
    $Trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
    
    # Configurações da tarefa
    $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    # Registrar tarefa
    try {
        Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Backup automático do banco PostgreSQL - Sistema de Alimentação Escolar"
        
        Write-Host "✅ Tarefa agendada criada com sucesso!" -ForegroundColor Green
        Write-Host "   Nome: $TaskName" -ForegroundColor Cyan
        Write-Host "   Horário: Diariamente às 02:00" -ForegroundColor Cyan
        Write-Host "   Para gerenciar: taskschd.msc" -ForegroundColor Cyan
        
    } catch {
        Write-Host "❌ Erro ao criar tarefa agendada: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    return
}

# Executar backup
Write-Host "Diretório: $BackupPath" -ForegroundColor Green
Write-Host "Retenção: $RetentionDays dias" -ForegroundColor Green
Write-Host ""

# Criar diretório se não existir
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

# Fazer backup
$BackupSuccess = Invoke-DatabaseBackup -Path $BackupPath

if ($BackupSuccess) {
    # Limpar backups antigos
    Remove-OldBackups -Path $BackupPath -Days $RetentionDays
    
    # Mostrar estatísticas
    $AllBackups = Get-ChildItem $BackupPath -Filter "alimentacao_escolar_backup_*"
    $TotalSize = ($AllBackups | Measure-Object Length -Sum).Sum
    $TotalSizeMB = [math]::Round($TotalSize / 1MB, 2)
    
    Write-Host ""
    Write-Host "📊 ESTATÍSTICAS DE BACKUP:" -ForegroundColor Cyan
    Write-Host "   Total de backups: $($AllBackups.Count)" -ForegroundColor Green
    Write-Host "   Espaço utilizado: $TotalSizeMB MB" -ForegroundColor Green
    Write-Host "   Backup mais antigo: $((Get-Date) - ($AllBackups | Sort-Object CreationTime | Select-Object -First 1).CreationTime | Select-Object -ExpandProperty Days) dias" -ForegroundColor Green
    
    # Listar backups recentes
    Write-Host ""
    Write-Host "📁 BACKUPS RECENTES:" -ForegroundColor Yellow
    $AllBackups | Sort-Object CreationTime -Descending | Select-Object -First 5 | ForEach-Object {
        $SizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   $($_.Name) - $SizeMB MB - $($_.CreationTime.ToString('dd/MM/yyyy HH:mm'))" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📋 COMANDOS ÚTEIS:" -ForegroundColor Yellow
Write-Host "   # Configurar backup automático diário:"
Write-Host "   .\backup_automatico.ps1 -ScheduleTask" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Backup com retenção personalizada:"
Write-Host "   .\backup_automatico.ps1 -RetentionDays 60" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Verificar tarefa agendada:"
Write-Host "   Get-ScheduledTask -TaskName 'BackupAlimentacaoEscolar'" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 RECOMENDAÇÃO: Configure backup automático para execução diária!" -ForegroundColor Green