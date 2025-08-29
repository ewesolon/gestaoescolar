# Script de Configuração de Ambiente
# Sistema de Gerenciamento de Alimentação Escolar

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "network", "production")]
    [string]$Environment,
    [string]$BackendHost = "localhost",
    [int]$BackendPort = 3000,
    [string]$DatabaseHost = "localhost",
    [int]$DatabasePort = 5432,
    [string]$DatabaseName = "alimentacao_escolar"
)

Write-Host "🔧 CONFIGURAÇÃO DE AMBIENTE" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Configurações por ambiente
$configs = @{
    "local" = @{
        backend = @{
            host = "localhost"
            port = 3000
            cors = @{
                origin = @("http://localhost:5173", "http://127.0.0.1:5173")
                credentials = $true
            }
        }
        frontend = @{
            apiUrl = "http://localhost:3000/api"
            proxy = @{
                target = "http://localhost:3000"
                changeOrigin = $true
            }
        }
        database = @{
            host = "localhost"
            port = 5432
            name = "alimentacao_escolar"
            user = "postgres"
            ssl = $false
        }
    }
    "network" = @{
        backend = @{
            host = "0.0.0.0"
            port = 3000
            cors = @{
                origin = @("http://*:5173", "http://localhost:5173")
                credentials = $true
            }
        }
        frontend = @{
            apiUrl = "http://${BackendHost}:3000/api"
            proxy = @{
                target = "http://${BackendHost}:3000"
                changeOrigin = $true
            }
        }
        database = @{
            host = $DatabaseHost
            port = $DatabasePort
            name = $DatabaseName
            user = "postgres"
            ssl = $false
        }
    }
    "production" = @{
        backend = @{
            host = "0.0.0.0"
            port = 3000
            cors = @{
                origin = @("https://yourdomain.com")
                credentials = $true
            }
        }
        frontend = @{
            apiUrl = "/api"
            proxy = $null
        }
        database = @{
            host = $DatabaseHost
            port = $DatabasePort
            name = $DatabaseName
            user = "postgres"
            ssl = $true
        }
    }
}

$selectedConfig = $configs[$Environment]

# Atualizar config.json
Write-Host "📝 Atualizando config.json..." -ForegroundColor Yellow

$configJson = @{
    development = $selectedConfig
    production = $configs["production"]
}

$configJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "config.json" -Encoding UTF8

Write-Host "config.json atualizado" -ForegroundColor Green

# Criar/atualizar .env do backend
Write-Host "📝 Atualizando backend/.env..." -ForegroundColor Yellow

$backendEnv = @"
# Configuração gerada automaticamente - $Environment
NODE_ENV=development
HOST=$($selectedConfig.backend.host)
PORT=$($selectedConfig.backend.port)

DB_HOST=$($selectedConfig.database.host)
DB_PORT=$($selectedConfig.database.port)
DB_NAME=$($selectedConfig.database.name)
DB_USER=$($selectedConfig.database.user)
DB_PASSWORD=admin123
DB_SSL=$($selectedConfig.database.ssl.ToString().ToLower())

JWT_SECRET=seu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=24h

UPLOADS_PATH=./uploads
MAX_FILE_SIZE=10485760
"@

$backendEnv | Out-File -FilePath "backend/.env" -Encoding UTF8

Write-Host "backend/.env atualizado" -ForegroundColor Green

# Criar/atualizar .env do frontend
Write-Host "📝 Atualizando frontend/.env..." -ForegroundColor Yellow

$frontendEnv = @"
# Configuração gerada automaticamente - $Environment
VITE_API_URL=$($selectedConfig.frontend.apiUrl)
VITE_MOCK_DATA=false
"@

$frontendEnv | Out-File -FilePath "frontend/.env" -Encoding UTF8

Write-Host "frontend/.env atualizado" -ForegroundColor Green

# Mostrar resumo
Write-Host ""
Write-Host "📋 CONFIGURAÇÃO APLICADA:" -ForegroundColor Cyan
Write-Host "   Ambiente: $Environment" -ForegroundColor White
Write-Host "   Backend: $($selectedConfig.backend.host):$($selectedConfig.backend.port)" -ForegroundColor White
Write-Host "   Database: $($selectedConfig.database.host):$($selectedConfig.database.port)/$($selectedConfig.database.name)" -ForegroundColor White
Write-Host "   Frontend API: $($selectedConfig.frontend.apiUrl)" -ForegroundColor White

if ($selectedConfig.frontend.proxy) {
    Write-Host "   Proxy: $($selectedConfig.frontend.proxy.target)" -ForegroundColor White
}

Write-Host ""
Write-Host "🚀 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   2. cd frontend && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 DICA: Use 'network' para acessar de outros dispositivos na rede" -ForegroundColor Green

Write-Host ""
Write-Host "📋 EXEMPLOS DE USO:" -ForegroundColor Yellow
Write-Host "   # Configuração local (padrão):"
Write-Host "   .\setup-environment.ps1 -Environment local" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Configuração para rede (acessível de outros PCs):"
Write-Host "   .\setup-environment.ps1 -Environment network -BackendHost '192.168.1.100'" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Configuração para produção:"
Write-Host "   .\setup-environment.ps1 -Environment production -DatabaseHost 'db.server.com'" -ForegroundColor Gray