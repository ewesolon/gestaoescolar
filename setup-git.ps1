# Script para configurar o repositório Git e enviar para GitHub
# Execute este script após instalar o Git

Write-Host "🚀 Configurando repositório Git..." -ForegroundColor Green

# Verificar se o Git está instalado
try {
    git --version
    Write-Host "✅ Git encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Instale o Git primeiro:" -ForegroundColor Red
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Inicializar repositório
Write-Host "📁 Inicializando repositório..." -ForegroundColor Cyan
git init

# Adicionar README.md se não existir
if (-not (Test-Path "README.md")) {
    Write-Host "📝 Criando README.md..." -ForegroundColor Cyan
    echo "# gestaoescolar" >> README.md
}

# Adicionar todos os arquivos
Write-Host "📦 Adicionando arquivos..." -ForegroundColor Cyan
git add .

# Fazer commit inicial
Write-Host "💾 Fazendo commit inicial..." -ForegroundColor Cyan
git commit -m "feat: sistema de gestão escolar completo

- Sistema completo de gestão de alimentação escolar
- Backend Node.js/Express com PostgreSQL
- Frontend React com Material-UI
- Mobile React Native com Expo
- Módulos: cadastros, cardápios, fornecedores, estoque, entregas
- Interface mobile para gestores de escola
- Correções de tipos TypeScript e melhorias de UX"

# Configurar branch principal
Write-Host "🌿 Configurando branch main..." -ForegroundColor Cyan
git branch -M main

# Adicionar repositório remoto
Write-Host "🔗 Conectando com GitHub..." -ForegroundColor Cyan
git remote add origin https://github.com/ewesolon/gestaoescolar.git

# Enviar para GitHub
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "✅ Repositório enviado com sucesso para GitHub!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://github.com/ewesolon/gestaoescolar" -ForegroundColor Yellow