# Script para atualizar o GitHub com as correções dos aditivos

Write-Host "Atualizando GitHub com correções dos aditivos..." -ForegroundColor Green

# Verificar se estamos em um repositório git
if (-not (Test-Path ".git")) {
    Write-Host "Não é um repositório Git. Inicializando..." -ForegroundColor Red
    git init
    git remote add origin https://github.com/seu-usuario/seu-repositorio.git
}

# Adicionar todos os arquivos modificados
Write-Host "Adicionando arquivos modificados..." -ForegroundColor Yellow
git add .

# Verificar status
Write-Host "Status do repositório:" -ForegroundColor Cyan
git status

# Fazer commit das alterações
$commitMessage = "fix: Corrigir sistema de aditivos de contratos

- Implementar controller completo de aditivos
- Corrigir queries para usar colunas corretas (quantidade_contratada, preco_unitario)
- Criar tabela aditivos_contratos_itens
- Corrigir modelo AditivoContrato para PostgreSQL
- Adicionar logs de debug
- Implementar aplicação de aditivos globais e específicos
- Corrigir interface frontend para mostrar produtos corretamente"

Write-Host "Fazendo commit..." -ForegroundColor Yellow
git commit -m "$commitMessage"

# Push para o GitHub
Write-Host "Enviando para GitHub..." -ForegroundColor Green
git push origin main

Write-Host "Atualização concluída!" -ForegroundColor Green
Write-Host "Verifique as alterações no GitHub" -ForegroundColor Cyan