# Script para descobrir o IP da máquina
Write-Host "Descobrindo IP da maquina..." -ForegroundColor Cyan

# Pegar IP da rede local
try {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"} | Select-Object -First 1).IPAddress
    
    if ($ip) {
        Write-Host ""
        Write-Host "Seu IP local: $ip" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para configurar para rede, execute:" -ForegroundColor Yellow
        Write-Host ".\setup-network.ps1 -BackendIP '$ip'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Outros dispositivos poderao acessar em:" -ForegroundColor Yellow
        Write-Host "http://${ip}:5173" -ForegroundColor Gray
    } else {
        Write-Host "Nao foi possivel detectar IP da rede local" -ForegroundColor Red
    }
} catch {
    Write-Host "Erro ao detectar IP. Use ipconfig manualmente" -ForegroundColor Red
}