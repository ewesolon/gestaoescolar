# CarrinhoContext - Documentação

O `CarrinhoContext` é um contexto React que gerencia o estado global do carrinho de compras no módulo de Pedido de Compra. Ele fornece funcionalidades completas para adicionar, remover, atualizar itens e confirmar pedidos.

## Instalação e Configuração

### 1. Instalar Dependências

As dependências necessárias já estão incluídas no projeto:
- React Context API (nativo)
- Axios para chamadas API
- TypeScript para tipagem

### 2. Configurar o Provider

Envolva sua aplicação ou a parte que precisa do carrinho com o `CarrinhoProvider`:

```tsx
import { CarrinhoProvider } from './context/CarrinhoContext';

function App() {
  return (
    <CarrinhoProvider>
      {/* Seus componentes aqui */}
    </CarrinhoProvider>
  );
}
```

### 3. Usar o Hook

Use o hook `useCarrinho` em qualquer componente dentro do provider:

```tsx
import { useCarrinho } from '../hooks/useCarrinho';

function MeuComponente() {
  const { itens, adicionarItem, loading } = useCarrinho();
  
  // Usar as funcionalidades do carrinho
}
```

## API do Context

### Estado

- `itens: CarrinhoItem[]` - Lista de todos os itens no carrinho
- `itensAgrupados: CarrinhoAgrupado[]` - Itens agrupados por fornecedor
- `loading: boolean` - Indica se há operação em andamento
- `error: string | null` - Mensagem de erro atual
- `totalGeral: number` - Valor total de todos os itens

### Funções Principais

#### `adicionarItem(produto: ProdutoContrato, quantidade: number): Promise<void>`
Adiciona um produto ao carrinho.

```tsx
const produto = {
  produto_id: 1,
  nome_produto: 'Arroz',
  preco_contratual: 5.50,
  // ... outros campos
};

await adicionarItem(produto, 10);
```

#### `atualizarQuantidade(itemId: number, quantidade: number): Promise<void>`
Atualiza a quantidade de um item específico.

```tsx
await atualizarQuantidade(itemId, 15);
```

#### `removerItem(itemId: number): Promise<void>`
Remove um item do carrinho.

```tsx
await removerItem(itemId);
```

#### `confirmarPedido(fornecedorId: number): Promise<ConfirmarPedidoResponse>`
Confirma um pedido para um fornecedor específico.

```tsx
const resultado = await confirmarPedido(fornecedorId);
console.log('Pedido criado:', resultado.numero_pedido);
```

#### `carregarCarrinho(): Promise<void>`
Recarrega os itens do carrinho do servidor.

```tsx
await carregarCarrinho();
```

#### `limparCarrinho(): Promise<void>`
Remove todos os itens do carrinho.

```tsx
await limparCarrinho();
```

### Funções Utilitárias

#### `isItemNoCarrinho(produtoId: number, contratoId: number): boolean`
Verifica se um produto específico está no carrinho.

```tsx
const estaNoCarrinho = isItemNoCarrinho(1, 1);
```

#### `getQuantidadeItem(produtoId: number, contratoId: number): number`
Retorna a quantidade de um produto específico no carrinho.

```tsx
const quantidade = getQuantidadeItem(1, 1);
```

#### `getItensPorFornecedor(): CarrinhoAgrupado[]`
Retorna os itens agrupados por fornecedor.

```tsx
const grupos = getItensPorFornecedor();
```

#### `getTotalGeral(): number`
Retorna o valor total do carrinho.

```tsx
const total = getTotalGeral();
```

#### `limparError(): void`
Limpa a mensagem de erro atual.

```tsx
limparError();
```

## Tipos TypeScript

### CarrinhoItem
```tsx
interface CarrinhoItem {
  id: number;
  usuario_id: number;
  produto_id: number;
  contrato_id: number;
  fornecedor_id: number;
  quantidade: number;
  preco_unitario: number;
  created_at: string;
  updated_at: string;
  nome_produto?: string;
  nome_fornecedor?: string;
  unidade?: string;
}
```

### CarrinhoAgrupado
```tsx
interface CarrinhoAgrupado {
  fornecedor_id: number;
  nome_fornecedor: string;
  itens: CarrinhoItem[];
  subtotal: number;
}
```

### ProdutoContrato
```tsx
interface ProdutoContrato {
  produto_id: number;
  nome_produto: string;
  unidade: string;
  contrato_id: number;
  numero_contrato: string;
  fornecedor_id: number;
  nome_fornecedor: string;
  preco_contratual: number;
  quantidade_contratual: number;
  quantidade_disponivel: number;
  contrato_ativo: boolean;
  data_inicio: string;
  data_fim: string;
}
```

## Exemplo Completo

```tsx
import React from 'react';
import { useCarrinho } from '../hooks/useCarrinho';
import { Button, Typography, Box } from '@mui/material';

const CarrinhoComponent: React.FC = () => {
  const {
    itens,
    itensAgrupados,
    loading,
    error,
    totalGeral,
    adicionarItem,
    confirmarPedido,
    limparError
  } = useCarrinho();

  const produto = {
    produto_id: 1,
    nome_produto: 'Arroz Branco',
    unidade: 'kg',
    contrato_id: 1,
    numero_contrato: 'CT001',
    fornecedor_id: 1,
    nome_fornecedor: 'Fornecedor ABC',
    preco_contratual: 5.50,
    quantidade_contratual: 100,
    quantidade_disponivel: 80,
    contrato_ativo: true,
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31'
  };

  const handleAdicionarItem = async () => {
    try {
      await adicionarItem(produto, 10);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const handleConfirmarPedido = async (fornecedorId: number) => {
    try {
      const resultado = await confirmarPedido(fornecedorId);
      alert(`Pedido confirmado! Número: ${resultado.numero_pedido}`);
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
    }
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box>
      {error && (
        <Box color="error.main" mb={2}>
          <Typography>Erro: {error}</Typography>
          <Button onClick={limparError}>Limpar Erro</Button>
        </Box>
      )}

      <Typography variant="h6">
        Carrinho ({itens.length} itens) - Total: R$ {totalGeral.toFixed(2)}
      </Typography>

      <Button onClick={handleAdicionarItem} variant="contained">
        Adicionar Produto
      </Button>

      {itensAgrupados.map((grupo) => (
        <Box key={grupo.fornecedor_id} mt={2}>
          <Typography variant="h6">{grupo.nome_fornecedor}</Typography>
          <Typography>Subtotal: R$ {grupo.subtotal.toFixed(2)}</Typography>
          <Button 
            onClick={() => handleConfirmarPedido(grupo.fornecedor_id)}
            variant="contained"
            color="success"
          >
            Confirmar Pedido
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default CarrinhoComponent;
```

## Tratamento de Erros

O contexto trata automaticamente os erros das operações e os disponibiliza através da propriedade `error`. Os erros são limpos automaticamente quando uma operação é bem-sucedida, ou podem ser limpos manualmente com `limparError()`.

## Testes

O contexto possui testes unitários abrangentes que cobrem:
- Inicialização e carregamento de dados
- Todas as operações CRUD do carrinho
- Tratamento de erros
- Funções utilitárias
- Uso do hook fora do provider

Para executar os testes:
```bash
npm run test:run
```

## Performance

O contexto utiliza:
- `useCallback` para memoizar funções
- `useReducer` para gerenciamento de estado complexo
- Cálculos otimizados de totais
- Atualizações locais de estado para melhor UX

## Integração com Backend

O contexto se integra com as seguintes APIs:
- `GET /api/carrinho` - Buscar itens do carrinho
- `POST /api/carrinho/adicionar` - Adicionar item
- `PUT /api/carrinho/alterar` - Atualizar quantidade
- `DELETE /api/carrinho/:id` - Remover item
- `DELETE /api/carrinho/limpar` - Limpar carrinho
- `POST /api/pedidos` - Confirmar pedido