# Script para verificar e iniciar o backend

Write-Host "Verificando status do backend..." -ForegroundColor Green

# Testar se o backend esta rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Backend esta rodando!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "Backend nao esta rodando!" -ForegroundColor Red
    Write-Host "Iniciando backend..." -ForegroundColor Yellow
    
    # Verificar se estamos no diretorio correto
    if (Test-Path "backend") {
        Set-Location backend
    }
    
    # Verificar se package.json existe
    if (Test-Path "package.json") {
        Write-Host "Instalando dependencias..." -ForegroundColor Yellow
        npm install
        
        Write-Host "Iniciando backend..." -ForegroundColor Green
        Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow
        
        # Aguardar um pouco para o backend iniciar
        Start-Sleep -Seconds 5
        
        # Testar novamente
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 10 -ErrorAction Stop
            Write-Host "Backend iniciado com sucesso!" -ForegroundColor Green
        } catch {
            Write-Host "Falha ao iniciar backend. Verifique os logs." -ForegroundColor Red
        }
    } else {
        Write-Host "package.json nao encontrado no diretorio backend" -ForegroundColor Red
    }
}