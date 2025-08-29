# Configuração Local Simples
Write-Host "Configurando ambiente local..." -ForegroundColor Cyan

# Criar config.json
$config = @{
    development = @{
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
}

$config | ConvertTo-Json -Depth 10 | Out-File -FilePath "config.json" -Encoding UTF8
Write-Host "config.json criado" -ForegroundColor Green

# Criar backend/.env
$backendEnv = @"
NODE_ENV=development
HOST=localhost
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

New-Item -ItemType Directory -Path "backend" -Force | Out-Null
$backendEnv | Out-File -FilePath "backend\.env" -Encoding UTF8
Write-Host "backend/.env criado" -ForegroundColor Green

# Criar frontend/.env
$frontendEnv = @"
VITE_API_URL=http://localhost:3000/api
VITE_MOCK_DATA=false
"@

New-Item -ItemType Directory -Path "frontend" -Force | Out-Null
$frontendEnv | Out-File -FilePath "frontend\.env" -Encoding UTF8
Write-Host "frontend/.env criado" -ForegroundColor Green

Write-Host ""
Write-Host "Configuracao local aplicada!" -ForegroundColor Cyan
Write-Host "Backend: localhost:3000" -ForegroundColor White
Write-Host "Frontend: localhost:5173" -ForegroundColor White
Write-Host "Database: localhost:5432/alimentacao_escolar" -ForegroundColor White