# Script completo de deploy para Vercel
# Executa: .\deploy-vercel-complete.ps1

Write-Host "🚀 Iniciando deploy completo no Vercel..." -ForegroundColor Green

# Verificar se Vercel CLI está instalado
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI não encontrado. Instalando..." -ForegroundColor Red
    npm install -g vercel
}

# Função para fazer deploy
function Deploy-Project {
    param($ProjectPath, $ProjectName)
    
    Write-Host "📦 Fazendo deploy do $ProjectName..." -ForegroundColor Yellow
    
    Set-Location $ProjectPath
    
    # Instalar dependências
    Write-Host "📥 Instalando dependências..." -ForegroundColor Cyan
    npm install
    
    # Build do projeto
    Write-Host "🔨 Fazendo build..." -ForegroundColor Cyan
    npm run build
    
    # Deploy no Vercel
    Write-Host "🚀 Fazendo deploy no Vercel..." -ForegroundColor Cyan
    vercel --prod
    
    Set-Location ..
}

# Deploy do Backend
Write-Host "`n=== BACKEND ===" -ForegroundColor Magenta
Deploy-Project "backend" "Backend"

# Deploy do Frontend
Write-Host "`n=== FRONTEND ===" -ForegroundColor Magenta
Deploy-Project "frontend" "Frontend"

Write-Host "`n✅ Deploy completo finalizado!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure as variáveis de ambiente no Vercel Dashboard"
Write-Host "2. Configure o banco PostgreSQL (Vercel Postgres ou Neon)"
Write-Host "3. Atualize as URLs nos arquivos .env"
Write-Host "4. Teste as aplicações"

Write-Host "`n🔗 Links úteis:" -ForegroundColor Cyan
Write-Host "- Vercel Dashboard: https://vercel.com/dashboard"
Write-Host "- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres"
Write-Host "- Neon Database: https://neon.tech/"