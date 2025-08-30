# Script completo para migrar PostgreSQL para nuvem
# Executa: .\migrate-database.ps1

Write-Host "🌐 Migração PostgreSQL Local → Nuvem" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verificar se Node.js está disponível
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se está no diretório correto
if (-not (Test-Path "backend")) {
    Write-Host "❌ Execute este script na raiz do projeto (onde está a pasta backend)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Opções de PostgreSQL Gratuito:" -ForegroundColor Yellow
Write-Host "1. 🥇 Neon Database (RECOMENDADO) - 512MB gratuito" -ForegroundColor White
Write-Host "2. 🥈 Supabase - 500MB gratuito" -ForegroundColor White
Write-Host "3. 🥉 Railway - $5 crédito/mês" -ForegroundColor White
Write-Host "4. 🔄 ElephantSQL - 20MB gratuito" -ForegroundColor White

Write-Host "`n📚 Guia completo: POSTGRES-CLOUD-OPTIONS.md" -ForegroundColor Cyan

# Perguntar qual opção
$opcao = Read-Host "`nEscolha uma opção (1-4) ou 'skip' para pular"

switch ($opcao) {
    "1" {
        Write-Host "`n🥇 Neon Database selecionado!" -ForegroundColor Green
        Write-Host "👉 Acesse: https://neon.tech" -ForegroundColor Cyan
        Write-Host "1. Crie conta com GitHub" -ForegroundColor White
        Write-Host "2. Create Project → 'gestaoescolar'" -ForegroundColor White
        Write-Host "3. Copie a Connection String" -ForegroundColor White
    }
    "2" {
        Write-Host "`n🥈 Supabase selecionado!" -ForegroundColor Green
        Write-Host "👉 Acesse: https://supabase.com" -ForegroundColor Cyan
        Write-Host "1. Crie conta com GitHub" -ForegroundColor White
        Write-Host "2. New Project → 'gestaoescolar'" -ForegroundColor White
        Write-Host "3. Settings → Database → Connection string" -ForegroundColor White
    }
    "3" {
        Write-Host "`n🥉 Railway selecionado!" -ForegroundColor Green
        Write-Host "👉 Acesse: https://railway.app" -ForegroundColor Cyan
        Write-Host "1. Crie conta com GitHub" -ForegroundColor White
        Write-Host "2. New Project → Add PostgreSQL" -ForegroundColor White
        Write-Host "3. Variables → DATABASE_URL" -ForegroundColor White
    }
    "4" {
        Write-Host "`n🔄 ElephantSQL selecionado!" -ForegroundColor Green
        Write-Host "👉 Acesse: https://www.elephantsql.com" -ForegroundColor Cyan
        Write-Host "1. Crie conta gratuita" -ForegroundColor White
        Write-Host "2. Create New Instance → Tiny Turtle (free)" -ForegroundColor White
        Write-Host "3. Copie a URL de conexão" -ForegroundColor White
    }
    "skip" {
        Write-Host "`n⏭️ Pulando criação de conta..." -ForegroundColor Yellow
    }
    default {
        Write-Host "`n❌ Opção inválida. Saindo..." -ForegroundColor Red
        exit 1
    }
}

# Exportar dados locais
Write-Host "`n📦 Exportando dados do banco local..." -ForegroundColor Yellow
Set-Location backend

try {
    node ../migrate-to-cloud.js
    Write-Host "✅ Dados exportados com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao exportar dados:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Verificar se arquivos foram gerados
if ((Test-Path "backend/database-schema.sql") -and (Test-Path "backend/database-data.sql")) {
    Write-Host "`n📄 Arquivos gerados:" -ForegroundColor Green
    Write-Host "  ✅ backend/database-schema.sql" -ForegroundColor White
    Write-Host "  ✅ backend/database-data.sql" -ForegroundColor White
} else {
    Write-Host "`n❌ Arquivos SQL não foram gerados corretamente" -ForegroundColor Red
    exit 1
}

# Perguntar connection string
Write-Host "`n🔗 Agora você precisa da Connection String do seu banco na nuvem" -ForegroundColor Yellow
Write-Host "Formato: postgresql://user:password@host:port/database?sslmode=require" -ForegroundColor Gray

$connectionString = Read-Host "`nCole sua Connection String (ou 'later' para fazer depois)"

if ($connectionString -eq "later") {
    Write-Host "`n⏰ Migração pausada. Para continuar depois:" -ForegroundColor Yellow
    Write-Host "cd backend" -ForegroundColor Gray
    Write-Host "node ../migrate-to-cloud.js import 'sua-connection-string'" -ForegroundColor Gray
} elseif ($connectionString -match "^postgresql://") {
    Write-Host "`n☁️ Importando para banco na nuvem..." -ForegroundColor Yellow
    
    Set-Location backend
    try {
        node ../migrate-to-cloud.js import $connectionString
        Write-Host "`n🎉 Migração concluída com sucesso!" -ForegroundColor Green
        
        # Atualizar .env
        Write-Host "`n📝 Atualizando configurações..." -ForegroundColor Yellow
        
        $envContent = @"
# Configurações do Banco PostgreSQL na Nuvem
POSTGRES_URL=$connectionString
DATABASE_URL=$connectionString

# Configurações de Produção
NODE_ENV=production
JWT_SECRET=sua_chave_jwt_super_secreta_minimo_32_caracteres

# Configurações Vercel
VERCEL=1
FRONTEND_URL=https://gestaoescolar-frontend.vercel.app
"@
        
        $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
        Write-Host "✅ Arquivo .env.production criado" -ForegroundColor Green
        
    } catch {
        Write-Host "`n❌ Erro na importação:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
    
    Set-Location ..
} else {
    Write-Host "`n❌ Connection string inválida. Deve começar com 'postgresql://'" -ForegroundColor Red
}

# Próximos passos
Write-Host "`n📋 PRÓXIMOS PASSOS:" -ForegroundColor Magenta
Write-Host "1. 🌐 Configure no Vercel:" -ForegroundColor White
Write-Host "   - Backend project → Settings → Environment Variables" -ForegroundColor Gray
Write-Host "   - Adicione: POSTGRES_URL=sua-connection-string" -ForegroundColor Gray
Write-Host "2. 🚀 Redeploy automático será feito" -ForegroundColor White
Write-Host "3. ✅ Teste: https://seu-backend.vercel.app/health" -ForegroundColor White

Write-Host "`n📚 Documentação:" -ForegroundColor Cyan
Write-Host "- POSTGRES-CLOUD-OPTIONS.md - Guia completo" -ForegroundColor Gray
Write-Host "- VERCEL-IMPORT-STEPS.md - Deploy no Vercel" -ForegroundColor Gray

Write-Host "`n🎊 Banco migrado para a nuvem!" -ForegroundColor Green