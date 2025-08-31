# Script de Deploy em Produção - Sistema de Alimentação Escolar
# Deploy tanto do Backend quanto do Frontend no Vercel

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Both,
    [switch]$Check,
    [switch]$Setup
)

Write-Host "🚀 Deploy em Produção - Sistema de Alimentação Escolar" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan

# Função para verificar se o Vercel CLI está instalado
function Test-VercelCLI {
    try {
        $vercelVersion = vercel --version
        Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Vercel CLI não encontrado!" -ForegroundColor Red
        Write-Host "   Instale com: npm install -g vercel" -ForegroundColor Yellow
        return $false
    }
}

# Função para verificar status dos deployments
function Check-DeploymentStatus {
    Write-Host "📊 Verificando status dos deployments..." -ForegroundColor Cyan
    
    # Verificar backend
    Write-Host "`n🔧 Backend:" -ForegroundColor Blue
    try {
        $backendResponse = Invoke-WebRequest -Uri "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health" -TimeoutSec 10 -UseBasicParsing
        $backendData = $backendResponse.Content | ConvertFrom-Json
        Write-Host "   ✅ Status: $($backendData.status)" -ForegroundColor Green
        Write-Host "   📊 Database: $($backendData.dbConnection)" -ForegroundColor White
        Write-Host "   🕒 Timestamp: $($backendData.timestamp)" -ForegroundColor White
        Write-Host "   🌍 Environment: $($backendData.environment)" -ForegroundColor White
    } catch {
        Write-Host "   ❌ Backend offline ou com erro" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Verificar frontend (se existir)
    Write-Host "`n🎨 Frontend:" -ForegroundColor Magenta
    try {
        # Tentar diferentes URLs possíveis do frontend
        $frontendUrls = @(
            "https://gestaoescolar-frontend.vercel.app",
            "https://gestaoescolar-frontend-git-main-ewenunes0-4923s-projects.vercel.app"
        )
        
        $frontendOnline = $false
        foreach ($url in $frontendUrls) {
            try {
                $frontendResponse = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing
                if ($frontendResponse.StatusCode -eq 200) {
                    Write-Host "   ✅ Online: $url" -ForegroundColor Green
                    $frontendOnline = $true
                    break
                }
            } catch {
                # Continuar tentando outras URLs
            }
        }
        
        if (-not $frontendOnline) {
            Write-Host "   ❌ Frontend offline ou não encontrado" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Erro ao verificar frontend" -ForegroundColor Red
    }
    
    Write-Host "`n🔗 URLs de Produção:" -ForegroundColor Cyan
    Write-Host "   Backend API: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api" -ForegroundColor White
    Write-Host "   Backend Health: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health" -ForegroundColor White
    Write-Host "   Frontend: https://gestaoescolar-frontend.vercel.app (se deployado)" -ForegroundColor White
}

# Função para setup inicial
function Setup-Production {
    Write-Host "🔧 Configurando ambiente de produção..." -ForegroundColor Cyan
    
    if (-not (Test-VercelCLI)) {
        return
    }
    
    Write-Host "`n📋 Variáveis de ambiente necessárias no Vercel:" -ForegroundColor Yellow
    Write-Host "   Backend:" -ForegroundColor Blue
    Write-Host "     POSTGRES_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres" -ForegroundColor White
    Write-Host "     DATABASE_URL=postgresql://postgres:@Nunes8922@db.aswbqvyxsfecjdjfjodz.supabase.co:5432/postgres" -ForegroundColor White
    Write-Host "     NODE_ENV=production" -ForegroundColor White
    Write-Host "     VERCEL=1" -ForegroundColor White
    Write-Host "     JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres" -ForegroundColor White
    Write-Host "     JWT_EXPIRES_IN=24h" -ForegroundColor White
    
    Write-Host "`n   Frontend:" -ForegroundColor Magenta
    Write-Host "     VITE_NODE_ENV=production" -ForegroundColor White
    Write-Host "     VITE_VERCEL=true" -ForegroundColor White
    Write-Host "     VITE_API_URL=https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api" -ForegroundColor White
    Write-Host "     VITE_HEALTH_URL=https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health" -ForegroundColor White
    
    Write-Host "`n💡 Configure essas variáveis no painel do Vercel antes do deploy!" -ForegroundColor Cyan
}

# Função para deploy do backend
function Deploy-Backend {
    Write-Host "🔧 Fazendo deploy do Backend..." -ForegroundColor Blue
    
    if (-not (Test-Path "backend/vercel-entry.js")) {
        Write-Host "❌ Arquivo backend/vercel-entry.js não encontrado!" -ForegroundColor Red
        return $false
    }
    
    if (-not (Test-Path "backend/vercel.json")) {
        Write-Host "❌ Arquivo backend/vercel.json não encontrado!" -ForegroundColor Red
        return $false
    }
    
    Set-Location backend
    
    Write-Host "📦 Verificando dependências..." -ForegroundColor White
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Instalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🚀 Iniciando deploy do backend..." -ForegroundColor Green
    try {
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend deployado com sucesso!" -ForegroundColor Green
            Set-Location ..
            return $true
        } else {
            Write-Host "❌ Erro no deploy do backend!" -ForegroundColor Red
            Set-Location ..
            return $false
        }
    } catch {
        Write-Host "❌ Erro ao executar deploy do backend: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ..
        return $false
    }
}

# Função para deploy do frontend
function Deploy-Frontend {
    Write-Host "🎨 Fazendo deploy do Frontend..." -ForegroundColor Magenta
    
    if (-not (Test-Path "frontend/package.json")) {
        Write-Host "❌ Frontend não encontrado!" -ForegroundColor Red
        return $false
    }
    
    Set-Location frontend
    
    Write-Host "📦 Verificando dependências..." -ForegroundColor White
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Instalando dependências..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host "🔨 Fazendo build do frontend..." -ForegroundColor White
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro no build do frontend!" -ForegroundColor Red
        Set-Location ..
        return $false
    }
    
    Write-Host "🚀 Iniciando deploy do frontend..." -ForegroundColor Green
    try {
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend deployado com sucesso!" -ForegroundColor Green
            Set-Location ..
            return $true
        } else {
            Write-Host "❌ Erro no deploy do frontend!" -ForegroundColor Red
            Set-Location ..
            return $false
        }
    } catch {
        Write-Host "❌ Erro ao executar deploy do frontend: $($_.Exception.Message)" -ForegroundColor Red
        Set-Location ..
        return $false
    }
}

# Processar ações
if ($Setup) {
    Setup-Production
    exit 0
}

if ($Check) {
    Check-DeploymentStatus
    exit 0
}

if (-not (Test-VercelCLI)) {
    exit 1
}

# Fazer deploy
$backendSuccess = $true
$frontendSuccess = $true

if ($Backend -or $Both) {
    $backendSuccess = Deploy-Backend
}

if ($Frontend -or $Both) {
    $frontendSuccess = Deploy-Frontend
}

if (-not $Backend -and -not $Frontend -and -not $Both) {
    # Padrão: deploy do backend apenas (mais comum)
    Write-Host "ℹ️  Nenhuma opção especificada, fazendo deploy do backend..." -ForegroundColor Cyan
    $backendSuccess = Deploy-Backend
}

# Resultado final
Write-Host "`n📊 Resultado do Deploy:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($Backend -or $Both -or (-not $Frontend)) {
    if ($backendSuccess) {
        Write-Host "✅ Backend: Sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend: Falhou" -ForegroundColor Red
    }
}

if ($Frontend -or $Both) {
    if ($frontendSuccess) {
        Write-Host "✅ Frontend: Sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend: Falhou" -ForegroundColor Red
    }
}

if ($backendSuccess -and $frontendSuccess) {
    Write-Host "`n🎉 Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "`n🧪 Teste os serviços:" -ForegroundColor Cyan
    Write-Host "   ./deploy-production.ps1 -Check" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Deploy concluído com alguns erros" -ForegroundColor Yellow
    Write-Host "   Verifique os logs acima para mais detalhes" -ForegroundColor White
}

Write-Host "`n💡 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   ./deploy-production.ps1 -Setup      # Configurar ambiente" -ForegroundColor White
Write-Host "   ./deploy-production.ps1 -Check      # Verificar status" -ForegroundColor White
Write-Host "   ./deploy-production.ps1 -Backend    # Deploy apenas backend" -ForegroundColor White
Write-Host "   ./deploy-production.ps1 -Frontend   # Deploy apenas frontend" -ForegroundColor White
Write-Host "   ./deploy-production.ps1 -Both       # Deploy completo" -ForegroundColor White