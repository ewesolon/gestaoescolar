import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useCarrinho } from '../useCarrinho';
import { CarrinhoProvider } from '../../context/CarrinhoContext';
import { carrinhoService } from '../../services/carrinho';

// Mock do serviço
vi.mock('../../services/carrinho');

const mockCarrinhoService = vi.mocked(carrinhoService);

// Componente de teste
const TestComponent = () => {
  const carrinho = useCarrinho();
  
  return (
    <div>
      <div data-testid="hook-loaded">
        {typeof carrinho.adicionarItem === 'function' ? 'loaded' : 'not-loaded'}
      </div>
    </div>
  );
};

describe('useCarrinho Hook', () => {
  it('deve retornar o contexto quando usado dentro do provider', async () => {
    mockCarrinhoService.getCarrinho.mockResolvedValue([]);

    const { getByTestId } = render(
      <CarrinhoProvider>
        <TestComponent />
      </CarrinhoProvider>
    );

    expect(getByTestId('hook-loaded')).toHaveTextContent('loaded');
  });

  it('deve lançar erro quando usado fora do provider', () => {
    // Suprimir console.error para este teste
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCarrinho deve ser usado dentro de um CarrinhoProvider');
    
    consoleSpy.mockRestore();
  });

  it('deve exportar todas as funções necessárias', async () => {
    mockCarrinhoService.getCarrinho.mockResolvedValue([]);

    const TestFunctionsComponent = () => {
      const {
        itens,
        itensAgrupados,
        loading,
        error,
        totalGeral,
        adicionarItem,
        atualizarQuantidade,
        removerItem,
        confirmarPedido,
        carregarCarrinho,
        limparCarrinho,
        limparError,
        getItensPorFornecedor,
        getTotalGeral,
        isItemNoCarrinho,
        getQuantidadeItem
      } = useCarrinho();
      
      return (
        <div>
          <div data-testid="has-itens">{Array.isArray(itens) ? 'true' : 'false'}</div>
          <div data-testid="has-itens-agrupados">{Array.isArray(itensAgrupados) ? 'true' : 'false'}</div>
          <div data-testid="has-loading">{typeof loading === 'boolean' ? 'true' : 'false'}</div>
          <div data-testid="has-error">{error === null || typeof error === 'string' ? 'true' : 'false'}</div>
          <div data-testid="has-total-geral">{typeof totalGeral === 'number' ? 'true' : 'false'}</div>
          <div data-testid="has-adicionar-item">{typeof adicionarItem === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-atualizar-quantidade">{typeof atualizarQuantidade === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-remover-item">{typeof removerItem === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-confirmar-pedido">{typeof confirmarPedido === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-carregar-carrinho">{typeof carregarCarrinho === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-limpar-carrinho">{typeof limparCarrinho === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-limpar-error">{typeof limparError === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-get-itens-por-fornecedor">{typeof getItensPorFornecedor === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-get-total-geral">{typeof getTotalGeral === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-is-item-no-carrinho">{typeof isItemNoCarrinho === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-get-quantidade-item">{typeof getQuantidadeItem === 'function' ? 'true' : 'false'}</div>
        </div>
      );
    };

    const { getByTestId } = render(
      <CarrinhoProvider>
        <TestFunctionsComponent />
      </CarrinhoProvider>
    );

    // Verificar se todas as propriedades estão disponíveis
    expect(getByTestId('has-itens')).toHaveTextContent('true');
    expect(getByTestId('has-itens-agrupados')).toHaveTextContent('true');
    expect(getByTestId('has-loading')).toHaveTextContent('true');
    expect(getByTestId('has-error')).toHaveTextContent('true');
    expect(getByTestId('has-total-geral')).toHaveTextContent('true');
    expect(getByTestId('has-adicionar-item')).toHaveTextContent('true');
    expect(getByTestId('has-atualizar-quantidade')).toHaveTextContent('true');
    expect(getByTestId('has-remover-item')).toHaveTextContent('true');
    expect(getByTestId('has-confirmar-pedido')).toHaveTextContent('true');
    expect(getByTestId('has-carregar-carrinho')).toHaveTextContent('true');
    expect(getByTestId('has-limpar-carrinho')).toHaveTextContent('true');
    expect(getByTestId('has-limpar-error')).toHaveTextContent('true');
    expect(getByTestId('has-get-itens-por-fornecedor')).toHaveTextContent('true');
    expect(getByTestId('has-get-total-geral')).toHaveTextContent('true');
    expect(getByTestId('has-is-item-no-carrinho')).toHaveTextContent('true');
    expect(getByTestId('has-get-quantidade-item')).toHaveTextContent('true');
  });
});