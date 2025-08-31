# Script de Teste do Sistema - Desenvolvimento e Produção
# Sistema de Gerenciamento de Alimentação Escolar

Write-Host "🧪 Testando Sistema - Desenvolvimento e Produção" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

# Função para testar URL
function Test-Url {
    param(
        [string]$Url,
        [string]$Name,
        [int]$Timeout = 10
    )
    
    try {
        Write-Host "   Testando $Name..." -ForegroundColor White -NoNewline
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ OK ($($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host " ⚠️  $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host " ❌ ERRO" -ForegroundColor Red
        Write-Host "      $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Função para testar API JSON
function Test-ApiEndpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$Timeout = 10
    )
    
    try {
        Write-Host "   Testando $Name..." -ForegroundColor White -NoNewline
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            Write-Host " ✅ OK" -ForegroundColor Green
            
            # Mostrar informações específicas baseadas no endpoint
            if ($Url.Contains("/health")) {
                Write-Host "      Status: $($data.status)" -ForegroundColor Gray
                Write-Host "      Database: $($data.dbConnection)" -ForegroundColor Gray
                Write-Host "      Environment: $($data.environment)" -ForegroundColor Gray
            } elseif ($Url.Contains("/api/")) {
                Write-Host "      Success: $($data.success)" -ForegroundColor Gray
                if ($data.data -and $data.data.Count) {
                    Write-Host "      Records: $($data.data.Count)" -ForegroundColor Gray
                }
            }
            return $true
        } else {
            Write-Host " ⚠️  $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host " ❌ ERRO" -ForegroundColor Red
        Write-Host "      $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Testar Desenvolvimento (Local)
Write-Host "`n🔧 Testando Ambiente de Desenvolvimento:" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue

$devResults = @{
    BackendHealth = Test-ApiEndpoint "http://localhost:3000/health" "Backend Health"
    BackendAPI = Test-ApiEndpoint "http://localhost:3000/api/test-db" "Backend API Test"
    Frontend = Test-Url "http://localhost:5173" "Frontend"
}

# Testar Produção (Vercel)
Write-Host "`n🌐 Testando Ambiente de Produção:" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Magenta

$prodResults = @{
    BackendHealth = Test-ApiEndpoint "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health" "Backend Health"
    BackendAPI = Test-ApiEndpoint "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api/test-db" "Backend API Test"
    BackendUsuarios = Test-ApiEndpoint "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api/usuarios" "API Usuários"
    BackendEscolas = Test-ApiEndpoint "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api/escolas" "API Escolas"
    BackendProdutos = Test-ApiEndpoint "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api/produtos" "API Produtos"
}

# Tentar testar frontend em produção (pode não existir ainda)
Write-Host "`n🎨 Testando Frontend em Produção:" -ForegroundColor Cyan
$frontendUrls = @(
    "https://gestaoescolar-frontend.vercel.app",
    "https://gestaoescolar-frontend-git-main-ewenunes0-4923s-projects.vercel.app"
)

$frontendOnline = $false
foreach ($url in $frontendUrls) {
    if (Test-Url $url "Frontend ($url)") {
        $frontendOnline = $true
        break
    }
}

if (-not $frontendOnline) {
    Write-Host "   Frontend nao deployado ainda" -ForegroundColor Yellow
}

# Resumo dos Resultados
Write-Host "`n📊 Resumo dos Testes:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

Write-Host "`n🔧 Desenvolvimento:" -ForegroundColor Blue
foreach ($test in $devResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅ OK" } else { "❌ FALHOU" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "   $($test.Key): $status" -ForegroundColor $color
}

Write-Host "`n🌐 Produção:" -ForegroundColor Magenta
foreach ($test in $prodResults.GetEnumerator()) {
    $status = if ($test.Value) { "✅ OK" } else { "❌ FALHOU" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "   $($test.Key): $status" -ForegroundColor $color
}

# Verificar arquivos de configuração
Write-Host "`n📁 Verificando Arquivos de Configuração:" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

$configFiles = @{
    "config.json" = "Configuração global"
    "backend/.env" = "Backend environment"
    "backend/vercel.json" = "Backend Vercel config"
    "backend/vercel-entry.js" = "Backend Vercel entry"
    "frontend/.env" = "Frontend environment"
    "frontend/.env.development" = "Frontend dev environment"
    "frontend/.env.production" = "Frontend prod environment"
    "frontend/vite.config.ts" = "Frontend Vite config"
    "frontend/vercel.json" = "Frontend Vercel config"
    "frontend/src/config/api.ts" = "Frontend API config"
}

foreach ($file in $configFiles.GetEnumerator()) {
    if (Test-Path $file.Key) {
        Write-Host "   ✅ $($file.Value): $($file.Key)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $($file.Value): $($file.Key) (AUSENTE)" -ForegroundColor Red
    }
}

# Recomendacoes
Write-Host "`nRecomendacoes:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

$devWorking = $devResults.Values -contains $true
$prodWorking = $prodResults.Values -contains $true

if ($devWorking) {
    Write-Host "✅ Desenvolvimento funcionando - Continue desenvolvendo!" -ForegroundColor Green
} else {
    Write-Host "Desenvolvimento com problemas:" -ForegroundColor Yellow
    Write-Host "   Execute: ./dev-manager-fixed.ps1 start -Both -Install" -ForegroundColor White
}

if ($prodWorking) {
    Write-Host "✅ Produção funcionando - Sistema online!" -ForegroundColor Green
} else {
    Write-Host "Producao com problemas:" -ForegroundColor Yellow
    Write-Host "   Execute: ./deploy-production.ps1 -Backend" -ForegroundColor White
}

if (-not $frontendOnline) {
    Write-Host "Para deployar o frontend:" -ForegroundColor Cyan
    Write-Host "   Execute: ./deploy-production.ps1 -Frontend" -ForegroundColor White
}

Write-Host "`nURLs Importantes:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Desenvolvimento:" -ForegroundColor Blue
Write-Host "   Backend: http://localhost:3000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   API: http://localhost:3000/api" -ForegroundColor White

Write-Host "`nProdução:" -ForegroundColor Magenta
Write-Host "   Backend: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app" -ForegroundColor White
Write-Host "   API: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api" -ForegroundColor White
Write-Host "   Health: https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health" -ForegroundColor White

Write-Host "`n🎉 Teste concluído!" -ForegroundColor Green