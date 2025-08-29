# Script para reiniciar o frontend e limpar cache
Write-Host "🔄 Reiniciando servidor frontend..." -ForegroundColor Yellow

# Ir para o diretório frontend
Set-Location frontend

# Parar qualquer processo npm que esteja rodando na porta 5173
Write-Host "🛑 Parando processos na porta 5173..." -ForegroundColor Red
$processes = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($process in $processes) {
        $pid = (Get-Process -Id $process.OwningProcess -ErrorAction SilentlyContinue).Id
        if ($pid) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Processo $pid parado" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  ℹ️  Nenhum processo encontrado na porta 5173" -ForegroundColor Blue
}

# Aguardar um pouco
Start-Sleep -Seconds 2

# Limpar cache do Vite
Write-Host "🧹 Limpando cache do Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "  ✅ Cache do Vite limpo" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Cache do Vite não encontrado" -ForegroundColor Blue
}

# Reiniciar o servidor
Write-Host "🚀 Iniciando servidor frontend..." -ForegroundColor Green
Write-Host "  📱 Acesse: http://192.168.18.12:5173/diagnostico-mobile" -ForegroundColor Cyan
Write-Host "  🌐 Ou: http://192.168.18.12:5173/estoque-escola/84" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Limpe o cache do navegador mobile!" -ForegroundColor Red
Write-Host ""

# Iniciar o servidor
npm run dev