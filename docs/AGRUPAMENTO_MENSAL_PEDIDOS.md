# Sistema de Agrupamento Mensal de Pedidos

## Visão Geral

O Sistema de Agrupamento Mensal de Pedidos foi desenvolvido para resolver o problema de faturamento parcial por fornecedor, permitindo maior controle e consistência dos dados.

## Problema Resolvido

**Situação Anterior:**
- Pedidos eram criados com múltiplos fornecedores
- Faturamento era feito por pedido completo
- Quando um fornecedor não entregava, o faturamento ficava pendente
- Dificuldade para rastrear status por fornecedor
- Perda de controle sobre entregas parciais

**Solução Implementada:**
- Agrupamento automático de pedidos por mês
- Controle de faturamento independente por fornecedor
- Rastreamento detalhado do status de cada fornecedor
- Faturamento parcial sem perder consistência
- Visão consolidada por período

## Arquitetura do Sistema

### Tabelas Principais

1. **agrupamentos_mensais**
   - Agrupa pedidos por mês/ano
   - Controla totais e status geral

2. **agrupamentos_pedidos**
   - Vincula pedidos específicos aos agrupamentos
   - Garante que cada pedido pertence a um agrupamento

3. **agrupamentos_faturamentos**
   - Controla status de faturamento por fornecedor
   - Calcula percentuais e valores faturados

4. **pedidos_faturamentos_controle**
   - Rastreia faturamento individual por pedido/fornecedor
   - Permite faturamento granular

### Fluxo de Funcionamento

```
1. Pedido Criado → 2. Auto-agrupado por Mês → 3. Controles por Fornecedor → 4. Faturamento Independente
```

## Como Usar

### 1. Executar Migração

```bash
cd backend
node executar_migracao_agrupamento.js
```

### 2. Acessar Interface

No frontend, acesse o módulo "Agrupamentos Mensais" para:

- Visualizar pedidos organizados por mês
- Acompanhar status de faturamento por fornecedor
- Realizar faturamentos parciais
- Monitorar progresso de entregas

### 3. Fluxo de Trabalho

#### Criação de Pedidos
1. Adicione produtos ao carrinho normalmente
2. Confirme o pedido
3. Sistema automaticamente:
   - Cria agrupamento mensal (se não existir)
   - Adiciona pedido ao agrupamento
   - Cria controles por fornecedor

#### Faturamento
1. Acesse o agrupamento mensal desejado
2. Visualize fornecedores e seus status
3. Faça faturamento por fornecedor independentemente
4. Acompanhe progresso em tempo real

## API Endpoints

### Agrupamentos Mensais

```typescript
GET /api/agrupamentos-mensais
// Lista agrupamentos com filtros opcionais

GET /api/agrupamentos-mensais/:id
// Detalhes completos do agrupamento

POST /api/agrupamentos-mensais
// Criar novo agrupamento

POST /api/agrupamentos-mensais/adicionar-pedido
// Adicionar pedido ao agrupamento

POST /api/agrupamentos-mensais/faturar-fornecedor
// Faturar fornecedor específico

GET /api/agrupamentos-mensais/pendentes
// Listar pedidos pendentes para agrupamento
```

### Carrinho Integrado

```typescript
POST /api/carrinho/confirmar
// Confirma pedido e adiciona automaticamente ao agrupamento mensal
```

## Benefícios

### Para Gestores
- **Visão Consolidada**: Todos os pedidos organizados por mês
- **Controle Granular**: Status individual por fornecedor
- **Faturamento Flexível**: Não precisa esperar todos os fornecedores
- **Relatórios Precisos**: Dados consistentes e rastreáveis

### Para Operação
- **Processo Simplificado**: Agrupamento automático
- **Menos Erros**: Controles automatizados
- **Maior Agilidade**: Faturamento independente por fornecedor
- **Melhor Rastreamento**: Histórico completo de operações

## Componentes Frontend

### ListaAgrupamentos
- Exibe cards com resumo de cada agrupamento
- Mostra progresso de faturamento
- Permite navegação para detalhes

### DetalhesAgrupamento
- Visão completa do agrupamento
- Tabelas de fornecedores e pedidos
- Ações de faturamento por fornecedor
- Indicadores visuais de progresso

### Integração com Carrinho
- Confirmação de pedidos integrada
- Adição automática ao agrupamento mensal
- Criação de controles por fornecedor

## Status e Indicadores

### Status de Agrupamento
- **ATIVO**: Agrupamento em operação
- **FECHADO**: Agrupamento finalizado

### Status de Faturamento por Fornecedor
- **PENDENTE**: Nenhum pedido faturado
- **PARCIAL**: Alguns pedidos faturados
- **COMPLETO**: Todos os pedidos faturados

### Indicadores Visuais
- Barras de progresso por fornecedor
- Chips coloridos por status
- Contadores de pedidos faturados/total
- Valores monetários formatados

## Manutenção e Monitoramento

### Funções Automáticas
- `criar_agrupamento_mensal()`: Cria agrupamentos automaticamente
- `atualizar_totais_agrupamento()`: Recalcula totais e status
- Triggers automáticos para manter consistência

### Relatórios Disponíveis
- Resumo mensal por agrupamento
- Status detalhado por fornecedor
- Histórico de faturamentos
- Pedidos pendentes por período

## Troubleshooting

### Problemas Comuns

1. **Pedido não aparece no agrupamento**
   - Verificar se o pedido foi criado corretamente
   - Confirmar se existe agrupamento para o mês
   - Executar função de atualização de totais

2. **Status de faturamento incorreto**
   - Verificar controles de faturamento
   - Executar recálculo de totais
   - Confirmar integridade dos dados

3. **Performance lenta**
   - Verificar índices das tabelas
   - Analisar queries complexas
   - Considerar paginação para grandes volumes

### Comandos Úteis

```sql
-- Recalcular totais de um agrupamento
SELECT atualizar_totais_agrupamento(ID_DO_AGRUPAMENTO);

-- Verificar consistência dos dados
SELECT 
  am.id,
  am.total_pedidos,
  COUNT(ap.pedido_id) as pedidos_reais
FROM agrupamentos_mensais am
LEFT JOIN agrupamentos_pedidos ap ON am.id = ap.agrupamento_id
GROUP BY am.id, am.total_pedidos
HAVING am.total_pedidos != COUNT(ap.pedido_id);
```

## Próximas Melhorias

1. **Relatórios Avançados**
   - Dashboard executivo
   - Análise de tendências
   - Comparativos mensais

2. **Automações**
   - Alertas de atraso
   - Lembretes de faturamento
   - Fechamento automático de períodos

3. **Integrações**
   - Sistema de entrega
   - Controle de estoque
   - Módulo financeiro

## Suporte

Para dúvidas ou problemas:
1. Consulte este documento
2. Verifique logs do sistema
3. Execute comandos de diagnóstico
4. Entre em contato com a equipe técnica