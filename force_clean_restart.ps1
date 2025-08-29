# Script para limpeza completa e reinício forçado
Write-Host "🧹 LIMPEZA COMPLETA DO FRONTEND" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Ir para o diretório frontend
Set-Location frontend

# 1. Parar todos os processos relacionados
Write-Host "🛑 Parando todos os processos Node.js..." -ForegroundColor Red
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Limpar TODOS os caches
Write-Host "🧹 Removendo todos os caches..." -ForegroundColor Yellow

# Cache do Vite
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "  ✅ Cache do Vite removido" -ForegroundColor Green
}

# Cache do npm
npm cache clean --force 2>$null
Write-Host "  ✅ Cache do npm limpo" -ForegroundColor Green

# Dist folder
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "  ✅ Pasta dist removida" -ForegroundColor Green
}

# 3. Verificar se algum processo ainda está usando as portas
Write-Host "🔍 Verificando portas em uso..." -ForegroundColor Blue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
$port5174 = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue

if ($port5173) {
    Write-Host "  ⚠️  Porta 5173 ainda em uso" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Porta 5173 livre" -ForegroundColor Green
}

if ($port5174) {
    Write-Host "  ⚠️  Porta 5174 ainda em uso" -ForegroundColor Yellow
    # Tentar matar o processo
    $pid = (Get-Process -Id $port5174.OwningProcess -ErrorAction SilentlyContinue).Id
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Processo na porta 5174 terminado" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Porta 5174 livre" -ForegroundColor Green
}

# 4. Aguardar um pouco
Write-Host "⏳ Aguardando limpeza completa..." -ForegroundColor Blue
Start-Sleep -Seconds 3

# 5. Reinstalar dependências (opcional, mas recomendado)
Write-Host "📦 Reinstalando dependências..." -ForegroundColor Cyan
npm install --silent

# 6. Iniciar servidor com configuração limpa
Write-Host "🚀 Iniciando servidor com configuração limpa..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 INSTRUÇÕES PARA O CELULAR:" -ForegroundColor Cyan
Write-Host "1. Feche COMPLETAMENTE o navegador" -ForegroundColor White
Write-Host "2. Abra o navegador novamente" -ForegroundColor White
Write-Host "3. Acesse: http://192.168.18.12:5173/diagnostico-mobile" -ForegroundColor White
Write-Host "4. Verifique se NÃO há erros de 5174 no console" -ForegroundColor White
Write-Host "5. Teste: http://192.168.18.12:5173/estoque-escola/84" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  SE AINDA HOUVER ERRO 5174:" -ForegroundColor Red
Write-Host "- Use modo incógnito/privado" -ForegroundColor White
Write-Host "- Ou limpe dados do site nas configurações" -ForegroundColor White
Write-Host ""

# Iniciar o servidor
npm run dev