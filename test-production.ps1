# Teste Simples da Producao
Write-Host "Testando Producao..." -ForegroundColor Green

# Testar Backend Health
try {
    $response = Invoke-WebRequest -Uri "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/health" -TimeoutSec 10 -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Backend Health: OK" -ForegroundColor Green
    Write-Host "  Status: $($data.status)" -ForegroundColor White
    Write-Host "  Database: $($data.dbConnection)" -ForegroundColor White
    Write-Host "  Environment: $($data.environment)" -ForegroundColor White
} catch {
    Write-Host "Backend Health: ERRO" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
}

# Testar API Test-DB
try {
    $response = Invoke-WebRequest -Uri "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api/test-db" -TimeoutSec 10 -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "API Test-DB: OK" -ForegroundColor Green
    Write-Host "  Success: $($data.success)" -ForegroundColor White
    Write-Host "  Message: $($data.message)" -ForegroundColor White
} catch {
    Write-Host "API Test-DB: ERRO" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
}

# Testar API Usuarios
try {
    $response = Invoke-WebRequest -Uri "https://gestaoescolar-xtu1-git-main-ewenunes0-4923s-projects.vercel.app/api/usuarios" -TimeoutSec 10 -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    Write-Host "API Usuarios: OK" -ForegroundColor Green
    Write-Host "  Success: $($data.success)" -ForegroundColor White
    if ($data.data) {
        Write-Host "  Records: $($data.data.Count)" -ForegroundColor White
    }
} catch {
    Write-Host "API Usuarios: ERRO" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`nTeste concluido!" -ForegroundColor Cyan