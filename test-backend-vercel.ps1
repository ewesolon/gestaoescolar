# Script para testar o backend no Vercel
Write-Host "🔍 Testando Backend Vercel..." -ForegroundColor Cyan

$baseUrl = "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app"

# Função para testar endpoint
function Test-Endpoint {
    param($url, $name)
    
    Write-Host "`n📡 Testando $name..." -ForegroundColor Yellow
    Write-Host "URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 30
        Write-Host "✅ $name: OK" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor White
        return $true
    }
    catch {
        Write-Host "❌ $name: ERRO" -ForegroundColor Red
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Lista de endpoints para testar
$endpoints = @(
    @{ url = "$baseUrl/health"; name = "Health Check" },
    @{ url = "$baseUrl/api/test-db"; name = "Teste Database" },
    @{ url = "$baseUrl/api/usuarios"; name = "Usuários" },
    @{ url = "$baseUrl/api/escolas"; name = "Escolas" },
    @{ url = "$baseUrl/api/produtos"; name = "Produtos" }
)

$successCount = 0
$totalCount = $endpoints.Count

Write-Host "`n🚀 Iniciando testes..." -ForegroundColor Cyan

foreach ($endpoint in $endpoints) {
    if (Test-Endpoint -url $endpoint.url -name $endpoint.name) {
        $successCount++
    }
    Start-Sleep -Seconds 2
}

Write-Host "`n📊 Resultado dos Testes:" -ForegroundColor Cyan
Write-Host "✅ Sucessos: $successCount/$totalCount" -ForegroundColor Green

if ($successCount -eq $totalCount) {
    Write-Host "🎉 Todos os testes passaram! Backend funcionando." -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "⚠️  Alguns testes falharam. Verifique os logs." -ForegroundColor Yellow
} else {
    Write-Host "❌ Todos os testes falharam. Backend com problemas." -ForegroundColor Red
}

Write-Host "`n🔗 URLs importantes:" -ForegroundColor Cyan
Write-Host "Dashboard Vercel: https://vercel.com/dashboard" -ForegroundColor Blue
Write-Host "Logs: https://vercel.com/ewenunes0-4923s-projects/gestaoescolar/functions" -ForegroundColor Blue