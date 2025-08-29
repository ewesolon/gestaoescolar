import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { CarrinhoProvider, useCarrinho } from '../CarrinhoContext';
import { carrinhoService } from '../../services/carrinho';
import { CarrinhoItem, ProdutoContrato, ConfirmarPedidoResponse } from '../../types/carrinho';

// Mock do serviço
vi.mock('../../services/carrinho');

const mockCarrinhoService = vi.mocked(carrinhoService);

// Componente de teste para usar o hook
const TestComponent = () => {
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
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="total-itens">{itens.length}</div>
      <div data-testid="total-grupos">{itensAgrupados.length}</div>
      <div data-testid="total-geral">{totalGeral}</div>
      <button onClick={() => carregarCarrinho()} data-testid="carregar-btn">
        Carregar
      </button>
      <button onClick={() => limparError()} data-testid="limpar-error-btn">
        Limpar Error
      </button>
      <button onClick={() => limparCarrinho()} data-testid="limpar-carrinho-btn">
        Limpar Carrinho
      </button>
    </div>
  );
};

// Dados de teste
const mockProduto: ProdutoContrato = {
  produto_id: 1,
  nome_produto: 'Arroz',
  unidade: 'kg',
  contrato_id: 1,
  numero_contrato: 'CT001',
  fornecedor_id: 1,
  nome_fornecedor: 'Fornecedor A',
  preco_contratual: 5.50,
  quantidade_contratual: 100,
  quantidade_disponivel: 80,
  contrato_ativo: true,
  data_inicio: '2024-01-01',
  data_fim: '2024-12-31'
};

const mockCarrinhoItem: CarrinhoItem = {
  id: 1,
  usuario_id: 1,
  produto_id: 1,
  contrato_id: 1,
  fornecedor_id: 1,
  quantidade: 10,
  preco_unitario: 5.50,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  nome_produto: 'Arroz',
  nome_fornecedor: 'Fornecedor A',
  unidade: 'kg'
};

const mockCarrinhoItem2: CarrinhoItem = {
  id: 2,
  usuario_id: 1,
  produto_id: 2,
  contrato_id: 2,
  fornecedor_id: 2,
  quantidade: 5,
  preco_unitario: 3.00,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  nome_produto: 'Feijão',
  nome_fornecedor: 'Fornecedor B',
  unidade: 'kg'
};

describe('CarrinhoContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Inicialização', () => {
    it('deve inicializar com estado vazio', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([]);

      render(
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('total-itens')).toHaveTextContent('0');
      expect(screen.getByTestId('total-grupos')).toHaveTextContent('0');
      expect(screen.getByTestId('total-geral')).toHaveTextContent('0');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    it('deve carregar itens do carrinho na inicialização', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([mockCarrinhoItem]);

      render(
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('total-itens')).toHaveTextContent('1');
      expect(screen.getByTestId('total-grupos')).toHaveTextContent('1');
      expect(screen.getByTestId('total-geral')).toHaveTextContent('55'); // 10 * 5.50
      expect(mockCarrinhoService.getCarrinho).toHaveBeenCalledTimes(1);
    });

    it('deve tratar erro na inicialização', async () => {
      const errorMessage = 'Erro ao carregar carrinho';
      mockCarrinhoService.getCarrinho.mockRejectedValue(new Error(errorMessage));

      render(
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  describe('Carregar Carrinho', () => {
    it('deve carregar carrinho manualmente', async () => {
      mockCarrinhoService.getCarrinho
        .mockResolvedValueOnce([]) // Inicialização
        .mockResolvedValueOnce([mockCarrinhoItem]); // Carregamento manual

      render(
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      act(() => {
        screen.getByTestId('carregar-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('1');
      });

      expect(mockCarrinhoService.getCarrinho).toHaveBeenCalledTimes(2);
    });
  });

  describe('Adicionar Item', () => {
    it('deve adicionar item ao carrinho', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([]);
      mockCarrinhoService.adicionarItem.mockResolvedValue(mockCarrinhoItem);

      const TestAddComponent = () => {
        const { adicionarItem, itens, totalGeral } = useCarrinho();
        
        return (
          <div>
            <div data-testid="total-itens">{itens.length}</div>
            <div data-testid="total-geral">{totalGeral}</div>
            <button 
              onClick={() => adicionarItem(mockProduto, 10)} 
              data-testid="adicionar-btn"
            >
              Adicionar
            </button>
          </div>
        );
      };

      render(
        <CarrinhoProvider>
          <TestAddComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('0');
      });

      act(() => {
        screen.getByTestId('adicionar-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('total-geral')).toHaveTextContent('55');
      expect(mockCarrinhoService.adicionarItem).toHaveBeenCalledWith({
        produto_id: 1,
        contrato_id: 1,
        fornecedor_id: 1,
        quantidade: 10,
        preco_unitario: 5.50
      });
    });

    it('deve tratar erro ao adicionar item', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([]);
      const errorMessage = 'Erro ao adicionar item';
      mockCarrinhoService.adicionarItem.mockRejectedValue(new Error(errorMessage));

      const TestAddErrorComponent = () => {
        const { adicionarItem, error } = useCarrinho();
        
        return (
          <div>
            <div data-testid="error">{error || 'null'}</div>
            <button 
              onClick={() => adicionarItem(mockProduto, 10)} 
              data-testid="adicionar-btn"
            >
              Adicionar
            </button>
          </div>
        );
      };

      render(
        <CarrinhoProvider>
          <TestAddErrorComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('null');
      });

      act(() => {
        screen.getByTestId('adicionar-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      });
    });
  });

  describe('Atualizar Quantidade', () => {
    it('deve atualizar quantidade de item', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([mockCarrinhoItem]);
      mockCarrinhoService.atualizarQuantidade.mockResolvedValue();

      const TestUpdateComponent = () => {
        const { atualizarQuantidade, itens, totalGeral } = useCarrinho();
        
        return (
          <div>
            <div data-testid="quantidade">{itens[0]?.quantidade || 0}</div>
            <div data-testid="total-geral">{totalGeral}</div>
            <button 
              onClick={() => atualizarQuantidade(1, 20)} 
              data-testid="atualizar-btn"
            >
              Atualizar
            </button>
          </div>
        );
      };

      render(
        <CarrinhoProvider>
          <TestUpdateComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('quantidade')).toHaveTextContent('10');
        expect(screen.getByTestId('total-geral')).toHaveTextContent('55');
      });

      act(() => {
        screen.getByTestId('atualizar-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('quantidade')).toHaveTextContent('20');
        expect(screen.getByTestId('total-geral')).toHaveTextContent('110'); // 20 * 5.50
      });

      expect(mockCarrinhoService.atualizarQuantidade).toHaveBeenCalledWith({
        itemId: 1,
        quantidade: 20
      });
    });
  });

  describe('Remover Item', () => {
    it('deve remover item do carrinho', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([mockCarrinhoItem]);
      mockCarrinhoService.removerItem.mockResolvedValue();

      const TestRemoveComponent = () => {
        const { removerItem, itens, totalGeral } = useCarrinho();
        
        return (
          <div>
            <div data-testid="total-itens">{itens.length}</div>
            <div data-testid="total-geral">{totalGeral}</div>
            <button 
              onClick={() => removerItem(1)} 
              data-testid="remover-btn"
            >
              Remover
            </button>
          </div>
        );
      };

      render(
        <CarrinhoProvider>
          <TestRemoveComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('1');
        expect(screen.getByTestId('total-geral')).toHaveTextContent('55');
      });

      act(() => {
        screen.getByTestId('remover-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('0');
        expect(screen.getByTestId('total-geral')).toHaveTextContent('0');
      });

      expect(mockCarrinhoService.removerItem).toHaveBeenCalledWith(1);
    });
  });

  describe('Confirmar Pedido', () => {
    it('deve confirmar pedido e limpar itens do fornecedor', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([mockCarrinhoItem, mockCarrinhoItem2]);
      
      const mockResponse: ConfirmarPedidoResponse = {
        numero_pedido: 'PC123',
        pedido_id: 1,
        valor_total: 55
      };
      mockCarrinhoService.confirmarPedido.mockResolvedValue(mockResponse);

      const TestConfirmComponent = () => {
        const { confirmarPedido, itens, totalGeral } = useCarrinho();
        
        const handleConfirm = async () => {
          try {
            await confirmarPedido(1); // Fornecedor 1
          } catch (error) {
            // Ignorar erro para o teste
          }
        };
        
        return (
          <div>
            <div data-testid="total-itens">{itens.length}</div>
            <div data-testid="total-geral">{totalGeral}</div>
            <button onClick={handleConfirm} data-testid="confirmar-btn">
              Confirmar
            </button>
          </div>
        );
      };

      render(
        <CarrinhoProvider>
          <TestConfirmComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('2');
        expect(screen.getByTestId('total-geral')).toHaveTextContent('70'); // 55 + 15
      });

      act(() => {
        screen.getByTestId('confirmar-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('1'); // Só restou o item do fornecedor 2
        expect(screen.getByTestId('total-geral')).toHaveTextContent('15'); // 5 * 3.00
      });

      expect(mockCarrinhoService.confirmarPedido).toHaveBeenCalledWith({
        fornecedor_id: 1
      });
    });
  });

  describe('Limpar Carrinho', () => {
    it('deve limpar carrinho completo', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([mockCarrinhoItem]);
      mockCarrinhoService.limparCarrinho.mockResolvedValue();

      render(
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('1');
      });

      act(() => {
        screen.getByTestId('limpar-carrinho-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-itens')).toHaveTextContent('0');
        expect(screen.getByTestId('total-geral')).toHaveTextContent('0');
      });

      expect(mockCarrinhoService.limparCarrinho).toHaveBeenCalled();
    });
  });

  describe('Funções Utilitárias', () => {
    it('deve verificar se item está no carrinho', async () => {
      mockCarrinhoService.getCarrinho.mockResolvedValue([mockCarrinhoItem]);

      const TestUtilComponent = () => {
        const { isItemNoCarrinho, getQuantidadeItem } = useCarrinho();
        
        return (
          <div>
            <div data-testid="item-no-carrinho">
              {isItemNoCarrinho(1, 1).toString()}
            </div>
            <div data-testid="quantidade-item">
              {getQuantidadeItem(1, 1)}
            </div>
            <div data-testid="item-nao-existe">
              {isItemNoCarrinho(999, 999).toString()}
            </div>
          </div>
        );
      };

      render(
        <CarrinhoProvider>
          <TestUtilComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('item-no-carrinho')).toHaveTextContent('true');
        expect(screen.getByTestId('quantidade-item')).toHaveTextContent('10');
        expect(screen.getByTestId('item-nao-existe')).toHaveTextContent('false');
      });
    });
  });

  describe('Tratamento de Erro', () => {
    it('deve limpar erro', async () => {
      const errorMessage = 'Erro de teste';
      mockCarrinhoService.getCarrinho.mockRejectedValue(new Error(errorMessage));

      render(
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
      });

      act(() => {
        screen.getByTestId('limpar-error-btn').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  describe('Hook fora do Provider', () => {
    it('deve lançar erro quando usado fora do provider', () => {
      // Suprimir console.error para este teste
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useCarrinho deve ser usado dentro de um CarrinhoProvider');
      
      consoleSpy.mockRestore();
    });
  });
});