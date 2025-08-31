# Script de Gerenciamento de Desenvolvimento - Versão Corrigida
# Sistema de Alimentação Escolar

param(
    [string]$Action = "start",
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Both,
    [switch]$Install,
    [switch]$Build,
    [switch]$Clean
)

Write-Host "🚀 Gerenciador de Desenvolvimento - Sistema de Alimentação Escolar" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan

# Função para verificar se um processo está rodando
function Test-ProcessRunning {
    param([string]$ProcessName)
    return (Get-Process -Name $ProcessName -ErrorAction SilentlyContinue) -ne $null
}

# Função para matar processos Node.js
function Stop-NodeProcesses {
    Write-Host "🛑 Parando processos Node.js..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Função para instalar dependências
function Install-Dependencies {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    
    if (Test-Path "backend/package.json") {
        Write-Host "   Backend..." -ForegroundColor White
        Set-Location backend
        npm install
        Set-Location ..
    }
    
    if (Test-Path "frontend/package.json") {
        Write-Host "   Frontend..." -ForegroundColor White
        Set-Location frontend
        npm install
        Set-Location ..
    }
    
    Write-Host "✅ Dependências instaladas!" -ForegroundColor Green
}

# Função para limpar node_modules e reinstalar
function Clean-Install {
    Write-Host "🧹 Limpando e reinstalando..." -ForegroundColor Yellow
    
    # Parar processos
    Stop-NodeProcesses
    
    # Limpar backend
    if (Test-Path "backend/node_modules") {
        Write-Host "   Removendo backend/node_modules..." -ForegroundColor White
        Remove-Item -Recurse -Force "backend/node_modules"
    }
    if (Test-Path "backend/package-lock.json") {
        Remove-Item -Force "backend/package-lock.json"
    }
    
    # Limpar frontend
    if (Test-Path "frontend/node_modules") {
        Write-Host "   Removendo frontend/node_modules..." -ForegroundColor White
        Remove-Item -Recurse -Force "frontend/node_modules"
    }
    if (Test-Path "frontend/package-lock.json") {
        Remove-Item -Force "frontend/package-lock.json"
    }
    
    # Reinstalar
    Install-Dependencies
}

# Função para build
function Build-Projects {
    Write-Host "🔨 Fazendo build dos projetos..." -ForegroundColor Cyan
    
    if (Test-Path "backend/package.json") {
        Write-Host "   Build Backend..." -ForegroundColor White
        Set-Location backend
        npm run build
        Set-Location ..
    }
    
    if (Test-Path "frontend/package.json") {
        Write-Host "   Build Frontend..." -ForegroundColor White
        Set-Location frontend
        npm run build
        Set-Location ..
    }
    
    Write-Host "✅ Build concluído!" -ForegroundColor Green
}

# Função para iniciar backend
function Start-Backend {
    Write-Host "🔧 Iniciando Backend..." -ForegroundColor Blue
    
    if (-not (Test-Path "backend/package.json")) {
        Write-Host "❌ Backend não encontrado!" -ForegroundColor Red
        return
    }
    
    Set-Location backend
    
    # Verificar se as dependências estão instaladas
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
        npm install
    }
    
    # Verificar variáveis de ambiente
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Arquivo .env não encontrado no backend!" -ForegroundColor Yellow
        Write-Host "   Criando .env baseado no .env.example..." -ForegroundColor White
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
        }
    }
    
    Write-Host "🚀 Iniciando servidor backend em modo desenvolvimento..." -ForegroundColor Green
    Write-Host "   URL: http://localhost:3000" -ForegroundColor White
    Write-Host "   Health: http://localhost:3000/health" -ForegroundColor White
    Write-Host "   API: http://localhost:3000/api" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    
    # Iniciar em nova janela
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Set-Location ..
}

# Função para iniciar frontend
function Start-Frontend {
    Write-Host "🎨 Iniciando Frontend..." -ForegroundColor Magenta
    
    if (-not (Test-Path "frontend/package.json")) {
        Write-Host "❌ Frontend não encontrado!" -ForegroundColor Red
        return
    }
    
    Set-Location frontend
    
    # Verificar se as dependências estão instaladas
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
        npm install
    }
    
    # Verificar variáveis de ambiente
    if (-not (Test-Path ".env.development")) {
        Write-Host "⚠️  Arquivo .env.development não encontrado!" -ForegroundColor Yellow
        Write-Host "   Usando configuração padrão..." -ForegroundColor White
    }
    
    Write-Host "🚀 Iniciando servidor frontend em modo desenvolvimento..." -ForegroundColor Green
    Write-Host "   URL: http://localhost:5173" -ForegroundColor White
    Write-Host "   Proxy API: /api -> http://localhost:3000/api" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    
    # Aguardar um pouco para o backend iniciar
    Start-Sleep -Seconds 3
    
    # Iniciar em nova janela
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Set-Location ..
}

# Função para verificar status
function Show-Status {
    Write-Host "📊 Status dos Serviços:" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    
    # Verificar backend
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -UseBasicParsing
        if ($backendResponse.StatusCode -eq 200) {
            Write-Host "✅ Backend: Online (http://localhost:3000)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Backend: Respondendo mas com erro" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Backend: Offline" -ForegroundColor Red
    }
    
    # Verificar frontend
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
        if ($frontendResponse.StatusCode -eq 200) {
            Write-Host "✅ Frontend: Online (http://localhost:5173)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Frontend: Respondendo mas com erro" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Frontend: Offline" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Processar ações
switch ($Action.ToLower()) {
    "install" { Install-Dependencies }
    "clean" { Clean-Install }
    "build" { Build-Projects }
    "status" { Show-Status }
    "stop" { Stop-NodeProcesses }
    "start" {
        if ($Clean) { Clean-Install }
        if ($Install) { Install-Dependencies }
        if ($Build) { Build-Projects }
        
        if ($Backend -or $Both) { Start-Backend }
        if ($Frontend -or $Both) { Start-Frontend }
        
        if (-not $Backend -and -not $Frontend -and -not $Both) {
            # Padrão: iniciar ambos
            Start-Backend
            Start-Sleep -Seconds 5
            Start-Frontend
        }
        
        Write-Host ""
        Write-Host "🎉 Serviços iniciados!" -ForegroundColor Green
        Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
        Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
        Write-Host ""
        Write-Host "💡 Comandos úteis:" -ForegroundColor Cyan
        Write-Host "   ./dev-manager-fixed.ps1 status    # Ver status" -ForegroundColor White
        Write-Host "   ./dev-manager-fixed.ps1 stop      # Parar tudo" -ForegroundColor White
        Write-Host "   ./dev-manager-fixed.ps1 clean     # Limpar e reinstalar" -ForegroundColor White
    }
    default {
        Write-Host "❌ Ação inválida: $Action" -ForegroundColor Red
        Write-Host ""
        Write-Host "Uso:" -ForegroundColor Cyan
        Write-Host "   ./dev-manager-fixed.ps1 start [-Backend] [-Frontend] [-Both] [-Install] [-Build] [-Clean]"
        Write-Host "   ./dev-manager-fixed.ps1 install"
        Write-Host "   ./dev-manager-fixed.ps1 build"
        Write-Host "   ./dev-manager-fixed.ps1 clean"
        Write-Host "   ./dev-manager-fixed.ps1 status"
        Write-Host "   ./dev-manager-fixed.ps1 stop"
        Write-Host ""
        Write-Host "Exemplos:" -ForegroundColor Yellow
        Write-Host "   ./dev-manager-fixed.ps1 start -Both          # Iniciar backend e frontend"
        Write-Host "   ./dev-manager-fixed.ps1 start -Backend       # Apenas backend"
        Write-Host "   ./dev-manager-fixed.ps1 start -Frontend      # Apenas frontend"
        Write-Host "   ./dev-manager-fixed.ps1 start -Clean -Both   # Limpar e iniciar tudo"
    }
}