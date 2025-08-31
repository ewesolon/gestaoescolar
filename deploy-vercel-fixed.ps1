# Script de Deploy Vercel - Sistema de Alimentação Escolar
# Versão corrigida com arquivo de entrada JavaScript

Write-Host "🚀 Iniciando deploy no Vercel..." -ForegroundColor Green

# Verificar se está no diretório correto
if (-not (Test-Path "backend/vercel-entry.js")) {
    Write-Host "❌ Erro: Arquivo vercel-entry.js não encontrado!" -ForegroundColor Red
    Write-Host "   Execute este script na raiz do projeto" -ForegroundColor Yellow
    exit 1
}

# Verificar se o Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado!" -ForegroundColor Red
    Write-Host "   Instale com: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Navegar para o diretório backend
Set-Location backend

Write-Host "📁 Diretório atual: $(Get-Location)" -ForegroundColor Cyan

# Verificar arquivos essenciais
$arquivosEssenciais = @(
    "vercel-entry.js",
    "vercel.json",
    "package.json"
)

foreach ($arquivo in $arquivosEssenciais) {
    if (Test-Path $arquivo) {
        Write-Host "✅ $arquivo encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $arquivo não encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Mostrar configuração do vercel.json
Write-Host "`n📋 Configuração do Vercel:" -ForegroundColor Cyan
Get-Content vercel.json | Write-Host

# Confirmar deploy
Write-Host "`n⚠️  Variáveis de ambiente necessárias no Vercel:" -ForegroundColor Yellow
Write-Host "   - POSTGRES_URL" -ForegroundColor White
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - NODE_ENV=production" -ForegroundColor White
Write-Host "   - VERCEL=1" -ForegroundColor White
Write-Host "   - JWT_SECRET" -ForegroundColor White

$confirmacao = Read-Host "`n🤔 Deseja continuar com o deploy? (s/n)"
if ($confirmacao -ne "s" -and $confirmacao -ne "S") {
    Write-Host "❌ Deploy cancelado pelo usuário" -ForegroundColor Red
    exit 0
}

# Executar deploy
Write-Host "`n🚀 Executando deploy..." -ForegroundColor Green
try {
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deploy realizado com sucesso!" -ForegroundColor Green
        Write-Host "`n🧪 Teste estes endpoints após o deploy:" -ForegroundColor Cyan
        Write-Host "   - /health (Status do sistema)" -ForegroundColor White
        Write-Host "   - /api/test-db (Teste de conexão)" -ForegroundColor White
        Write-Host "   - /api/usuarios (Lista de usuários)" -ForegroundColor White
        Write-Host "   - /api/escolas (Lista de escolas)" -ForegroundColor White
        Write-Host "   - /api/produtos (Lista de produtos)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Erro durante o deploy!" -ForegroundColor Red
        Write-Host "   Verifique os logs acima para mais detalhes" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Erro ao executar o deploy: $($_.Exception.Message)" -ForegroundColor Red
}

# Voltar ao diretório raiz
Set-Location ..

Write-Host "`n📚 Para mais informações, consulte: VERCEL-DEPLOY-GUIDE.md" -ForegroundColor Cyan