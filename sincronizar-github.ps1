# Script para sincronizar o projeto local com o GitHub

Write-Host "Sincronizando projeto com GitHub..." -ForegroundColor Green

# Verificar se estamos em um repositório git
if (-not (Test-Path ".git")) {
    Write-Host "Não é um repositório Git. Inicializando..." -ForegroundColor Red
    git init
    git remote add origin https://github.com/ewesolon/gestaoescolar.git
}

# Verificar status atual
Write-Host "Status atual do repositório:" -ForegroundColor Cyan
git status

# Fazer stash das alterações locais não commitadas (se houver)
$hasChanges = git status --porcelain
if ($hasChanges) {
    Write-Host "Salvando alterações locais temporariamente..." -ForegroundColor Yellow
    git stash push -m "Alterações locais antes da sincronização - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

# Buscar as alterações mais recentes do GitHub
Write-Host "Buscando alterações do GitHub..." -ForegroundColor Yellow
git fetch origin

# Verificar se há commits remotos mais recentes
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main

if ($localCommit -ne $remoteCommit) {
    Write-Host "Há alterações no GitHub. Fazendo pull..." -ForegroundColor Yellow
    
    # Fazer pull das alterações
    git pull origin main
    
    Write-Host "Pull concluído!" -ForegroundColor Green
} else {
    Write-Host "Projeto já está atualizado com o GitHub." -ForegroundColor Green
}

# Restaurar alterações locais se foram salvas
if ($hasChanges) {
    Write-Host "Restaurando alterações locais..." -ForegroundColor Yellow
    $stashResult = git stash pop
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Alterações locais restauradas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Houve conflitos ao restaurar alterações locais." -ForegroundColor Red
        Write-Host "Verifique os conflitos e resolva manualmente." -ForegroundColor Yellow
        git status
    }
}

# Mostrar status final
Write-Host "Status final:" -ForegroundColor Cyan
git status

# Mostrar últimos commits
Write-Host "Últimos commits:" -ForegroundColor Cyan
git log --oneline -5

Write-Host "Sincronização concluída!" -ForegroundColor Green