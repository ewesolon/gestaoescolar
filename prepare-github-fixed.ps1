# Script para preparar projeto para GitHub + Vercel
Write-Host "📦 Preparando projeto para GitHub + Vercel..." -ForegroundColor Green

# Verificar se está em um repositório Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Não é um repositório Git. Inicializando..." -ForegroundColor Red
    git init
    git branch -M main
}

# Verificar status atual
Write-Host "`n📋 Status atual do Git:" -ForegroundColor Yellow
git status --short

# Adicionar arquivos de configuração Vercel
Write-Host "`n📁 Adicionando arquivos de configuração..." -ForegroundColor Cyan
git add .

# Verificar se há mudanças para commit
$changes = git diff --cached --name-only
if ($changes) {
    Write-Host "`n📝 Arquivos que serão commitados:" -ForegroundColor Cyan
    foreach ($file in $changes) {
        Write-Host "  + $file" -ForegroundColor Green
    }
    
    # Fazer commit
    $commitMessage = "feat: configuração completa para deploy Vercel"
    git commit -m $commitMessage
    
    Write-Host "`n✅ Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Nenhuma mudança para commitar." -ForegroundColor Yellow
}

# Verificar remote origin
try {
    $remoteUrl = git remote get-url origin 2>$null
    if ($LASTEXITCODE -eq 0 -and $remoteUrl) {
        Write-Host "`n🔗 Remote origin configurado: $remoteUrl" -ForegroundColor Cyan
        
        # Push para GitHub
        Write-Host "`n🚀 Enviando para GitHub..." -ForegroundColor Yellow
        git push origin main
        
        Write-Host "`n✅ Código enviado para GitHub!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Remote origin não configurado." -ForegroundColor Yellow
        Write-Host "Configure com: git remote add origin https://github.com/seu-usuario/seu-repo.git" -ForegroundColor Cyan
    }
} catch {
    Write-Host "`n⚠️ Erro ao verificar remote origin." -ForegroundColor Yellow
}

# Mostrar próximos passos
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Magenta
Write-Host "1. 🌐 Acesse: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. 📦 Clique em 'Add New...' > 'Project'" -ForegroundColor White
Write-Host "3. 🔗 Importe seu repositório GitHub" -ForegroundColor White
Write-Host "4. 🔧 Configure DOIS projetos separados:" -ForegroundColor White
Write-Host "   📁 Backend (pasta: backend/)" -ForegroundColor Gray
Write-Host "   📁 Frontend (pasta: frontend/)" -ForegroundColor Gray
Write-Host "5. ⚙️ Configure as variáveis de ambiente" -ForegroundColor White
Write-Host "6. 🗄️ Configure banco PostgreSQL" -ForegroundColor White

Write-Host "`n📚 Documentação completa em: GITHUB-VERCEL-GUIDE.md" -ForegroundColor Cyan
Write-Host "`n🎉 Projeto pronto para importar no Vercel!" -ForegroundColor Green