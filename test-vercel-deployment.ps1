# Script para testar deployment do Vercel apos correcao de runtime
Write-Host "Testando deployment do Vercel..." -ForegroundColor Cyan

# URLs do Vercel (ajustar conforme necessário)
$VERCEL_URL = "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app"

Write-Host "`nTestando endpoints..." -ForegroundColor Yellow

# Teste 1: Health check
Write-Host "`n1. Testando /api/health..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$VERCEL_URL/api/health" -Method GET -TimeoutSec 30
    Write-Host "Health check OK:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erro no health check: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: API test simples
Write-Host "`n2. Testando /api/test..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$VERCEL_URL/api/test" -Method GET -TimeoutSec 30
    Write-Host "Test API OK:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erro no test API: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: API 404 (deve retornar erro estruturado)
Write-Host "`n3. Testando /api/inexistente..." -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$VERCEL_URL/api/inexistente" -Method GET -TimeoutSec 30
    Write-Host "Resposta 404 estruturada:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erro esperado (404): $($_.Exception.Message)" -ForegroundColor Yellow
}

# Teste 4: Frontend
Write-Host "`n4. Testando frontend..." -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri $VERCEL_URL -Method GET -TimeoutSec 30
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend carregou (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "Frontend com status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erro no frontend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTeste concluido!" -ForegroundColor Cyan
Write-Host "Se houver erros, aguarde alguns minutos para o deployment completar." -ForegroundColor Gray