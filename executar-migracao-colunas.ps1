# Script para executar migração de colunas faltantes
Write-Host "🔄 Executando migração de colunas faltantes..." -ForegroundColor Yellow

# Verificar se o PostgreSQL está acessível
try {
    $testConnection = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 5
    $healthData = $testConnection.Content | ConvertFrom-Json
    
    if ($healthData.status -eq "ok" -and $healthData.dbConnection -eq "connected") {
        Write-Host "✅ PostgreSQL conectado" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL não está conectado" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Não foi possível conectar ao backend" -ForegroundColor Red
    Write-Host "   Certifique-se que o backend está rodando em http://localhost:3000" -ForegroundColor Yellow
    exit 1
}

# Executar migração via API
try {
    Write-Host "📋 Executando migração SQL..." -ForegroundColor Cyan
    
    # Ler o arquivo de migração
    $migrationContent = Get-Content "backend/migrations/023_adicionar_colunas_faltantes.sql" -Raw
    
    # Executar via endpoint de teste (vamos criar um endpoint temporário)
    $body = @{
        sql = $migrationContent
    } | ConvertTo-Json
    
    # Por enquanto, vamos executar usando psql se disponível
    Write-Host "🔧 Tentando executar com psql..." -ForegroundColor Yellow
    
    # Verificar se psql está disponível
    try {
        $psqlVersion = & psql --version 2>$null
        Write-Host "✅ psql encontrado: $psqlVersion" -ForegroundColor Green
        
        # Executar migração
        $env:PGPASSWORD = "admin123"
        & psql -h localhost -p 5432 -U postgres -d alimentacao_escolar -f "backend/migrations/023_adicionar_colunas_faltantes.sql"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migração executada com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao executar migração" -ForegroundColor Red
            exit 1
        }
        
    } catch {
        Write-Host "⚠️ psql não encontrado, tentando método alternativo..." -ForegroundColor Yellow
        
        # Método alternativo: executar via Node.js
        Write-Host "🔧 Executando via Node.js..." -ForegroundColor Cyan
        
        $nodeScript = @"
const db = require('./backend/src/database');
const fs = require('fs');

async function executeMigration() {
    try {
        console.log('📋 Lendo arquivo de migração...');
        const sql = fs.readFileSync('./backend/migrations/023_adicionar_colunas_faltantes.sql', 'utf8');
        
        console.log('🔄 Executando migração...');
        await db.query(sql);
        
        console.log('✅ Migração executada com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
        process.exit(1);
    }
}

executeMigration();
"@
        
        $nodeScript | Out-File -FilePath "temp_migration.js" -Encoding UTF8
        
        try {
            & node temp_migration.js
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Migração executada com sucesso via Node.js!" -ForegroundColor Green
            } else {
                Write-Host "❌ Erro ao executar migração via Node.js" -ForegroundColor Red
                exit 1
            }
        } finally {
            # Limpar arquivo temporário
            if (Test-Path "temp_migration.js") {
                Remove-Item "temp_migration.js" -Force
            }
        }
    }
    
    # Limpar variável de ambiente
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Erro ao executar migração: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Testar se as APIs funcionam agora
Write-Host ""
Write-Host "🧪 Testando APIs após migração..." -ForegroundColor Cyan

try {
    Write-Host "📋 Testando /api/escolas..." -ForegroundColor White
    $escolasTest = Invoke-WebRequest -Uri "http://localhost:5173/api/escolas" -Method GET -TimeoutSec 10
    $escolasData = $escolasTest.Content | ConvertFrom-Json
    
    if ($escolasData.success) {
        Write-Host "✅ API de escolas funcionando - Total: $($escolasData.total)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API de escolas retornou erro: $($escolasData.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao testar API de escolas: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Write-Host "📋 Testando /api/produtos..." -ForegroundColor White
    $produtosTest = Invoke-WebRequest -Uri "http://localhost:5173/api/produtos" -Method GET -TimeoutSec 10
    $produtosData = $produtosTest.Content | ConvertFrom-Json
    
    if ($produtosData.success) {
        Write-Host "✅ API de produtos funcionando - Total: $($produtosData.total)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API de produtos retornou erro: $($produtosData.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao testar API de produtos: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Migração concluída!" -ForegroundColor Green
Write-Host "   As colunas faltantes foram adicionadas às tabelas" -ForegroundColor Cyan
Write-Host "   Triggers de updated_at foram criados" -ForegroundColor Cyan
Write-Host "   Códigos de acesso foram gerados para escolas" -ForegroundColor Cyan