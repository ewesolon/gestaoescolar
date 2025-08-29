# Configuração de Rede
param(
    [string]$BackendIP = "192.168.1.100"
)

Write-Host "Configurando ambiente de rede..." -ForegroundColor Cyan
Write-Host "IP do Backend: $BackendIP" -ForegroundColor Yellow

# Criar config.json
$config = @{
    development = @{
        backend = @{
            host = "0.0.0.0"
            port = 3000
            cors = @{
                origin = @("http://*:5173", "http://localhost:5173", "http://${BackendIP}:5173")
                credentials = $true
            }
        }
        frontend = @{
            apiUrl = "http://${BackendIP}:3000/api"
            proxy = @{
                target = "http://${BackendIP}:3000"
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
}

$config | ConvertTo-Json -Depth 10 | Out-File -FilePath "config.json" -Encoding UTF8
Write-Host "config.json criado" -ForegroundColor Green

# Criar backend/.env
$backendEnv = @"
NODE_ENV=development
HOST=0.0.0.0
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=alimentacao_escolar
DB_USER=postgres
DB_PASSWORD=admin123
DB_SSL=false

JWT_SECRET=seu-jwt-secret-super-seguro-aqui
JWT_EXPIRES_IN=24h

UPLOADS_PATH=./uploads
MAX_FILE_SIZE=10485760
"@

$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "backend/.env criado" -ForegroundColor Green

# Criar frontend/.env
$frontendEnv = @"
VITE_API_URL=http://${BackendIP}:3000/api
VITE_MOCK_DATA=false
"@

$frontendEnv | Out-File -FilePath "frontend\.env" -Encoding UTF8
Write-Host "frontend/.env criado" -ForegroundColor Green

Write-Host ""
Write-Host "Configuracao de rede aplicada!" -ForegroundColor Cyan
Write-Host "Backend: ${BackendIP}:3000 (acessivel de qualquer IP)" -ForegroundColor White
Write-Host "Frontend: localhost:5173 (proxy para ${BackendIP}:3000)" -ForegroundColor White
Write-Host "Database: localhost:5432/alimentacao_escolar" -ForegroundColor White
Write-Host ""
Write-Host "Para usar de outro computador:" -ForegroundColor Yellow
Write-Host "1. Acesse http://${BackendIP}:5173 no navegador" -ForegroundColor Gray
Write-Host "2. Certifique-se que o firewall permite conexoes na porta 3000 e 5173" -ForegroundColor Gray