# Script para deploy no Vercel
# Execute este script para fazer deploy do sistema completo

Write-Host "🚀 Iniciando deploy no Vercel..." -ForegroundColor Green

# Verificar se o Vercel CLI está instalado
try {
    vercel --version
    Write-Host "✅ Vercel CLI encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado. Instalando..." -ForegroundColor Red
    npm install -g vercel
}

# Fazer login no Vercel (se necessário)
Write-Host "🔐 Verificando login no Vercel..." -ForegroundColor Cyan
vercel whoami

# Build do frontend
Write-Host "🏗️ Fazendo build do frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build
Set-Location ..

# Build do backend
Write-Host "🏗️ Fazendo build do backend..." -ForegroundColor Cyan
Set-Location backend
npm install
npm run build
Set-Location ..

# Deploy para produção
Write-Host "🚀 Fazendo deploy para produção..." -ForegroundColor Green
vercel --prod

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse seu app no link fornecido pelo Vercel" -ForegroundColor Yellow

Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis de ambiente no Vercel Dashboard" -ForegroundColor White
Write-Host "2. Configure o banco de dados PostgreSQL" -ForegroundColor White
Write-Host "3. Execute as migrações no banco de produção" -ForegroundColor White
Write-Host "4. Teste todas as funcionalidades" -ForegroundColor White