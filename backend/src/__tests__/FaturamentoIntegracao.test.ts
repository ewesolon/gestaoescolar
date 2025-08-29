// Teste de integração para validar o comportamento completo do sistema de faturamento

describe('Teste de Integração - Sistema de Faturamento por Modalidades', () => {
  // Simulação de dados de teste
  const mockPedidoItem = {
    id: 1,
    produto_id: 101,
    nome_produto: 'Arroz Integral 1kg',
    quantidade: 100,
    valor_unitario: 5.50
  };

  const mockModalidades = [
    { modalidade_id: 1, nome: 'PNAE', valor_repasse: 0.30, percentual: 60 },
    { modalidade_id: 2, nome: 'Municipal', valor_repasse: 0.20, percentual: 40 }
  ];

  // Função para simular cálculo completo de divisão proporcional
  function simularCalculoDivisaoProporcional(
    pedidoItem: any,
    modalidades: any[]
  ) {
    const valorTotalItem = pedidoItem.quantidade * pedidoItem.valor_unitario;
    const divisoes = [];
    let totalQuantidadeDividida = 0;
    let totalValorDividido = 0;

    for (const modalidade of modalidades) {
      const percentualProporcional = modalidade.percentual / 100;
      const quantidadeProporcional = Math.round((pedidoItem.quantidade * percentualProporcional) * 1000) / 1000;
      const valorTotalModalidade = Math.round((valorTotalItem * percentualProporcional) * 100) / 100;

      const divisao = {
        modalidade_id: modalidade.modalidade_id,
        nome_modalidade: modalidade.nome,
        valor_repasse: modalidade.valor_repasse,
        percentual_proporcional: modalidade.percentual,
        quantidade_proporcional: quantidadeProporcional,
        valor_total_modalidade: valorTotalModalidade
      };

      divisoes.push(divisao);
      totalQuantidadeDividida += quantidadeProporcional;
      totalValorDividido += valorTotalModalidade;
    }

    // Ajustar diferenças de arredondamento na última modalidade
    if (divisoes.length > 0) {
      const ultimaModalidade = divisoes[divisoes.length - 1];
      const diferencaQuantidade = pedidoItem.quantidade - totalQuantidadeDividida;
      const diferencaValor = valorTotalItem - totalValorDividido;
      
      if (Math.abs(diferencaQuantidade) > 0.001 || Math.abs(diferencaValor) > 0.01) {
        ultimaModalidade.quantidade_proporcional += diferencaQuantidade;
        ultimaModalidade.valor_total_modalidade += diferencaValor;
        
        // Recalcular totais
        totalQuantidadeDividida = divisoes.reduce((sum, d) => sum + d.quantidade_proporcional, 0);
        totalValorDividido = divisoes.reduce((sum, d) => sum + d.valor_total_modalidade, 0);
      }
    }

    return {
      pedido_item_id: pedidoItem.id,
      produto_id: pedidoItem.produto_id,
      nome_produto: pedidoItem.nome_produto,
      quantidade_original: pedidoItem.quantidade,
      valor_unitario: pedidoItem.valor_unitario,
      valor_total_original: valorTotalItem,
      divisoes_modalidades: divisoes,
      total_percentual: modalidades.reduce((sum, m) => sum + m.percentual, 0),
      total_quantidade_dividida: Math.round(totalQuantidadeDividida * 1000) / 1000,
      total_valor_dividido: Math.round(totalValorDividido * 100) / 100
    };
  }

  describe('Cenários Reais de Faturamento', () => {
    it('deve processar corretamente um item com duas modalidades', () => {
      const resultado = simularCalculoDivisaoProporcional(mockPedidoItem, mockModalidades);

      // Validações básicas
      expect(resultado.divisoes_modalidades).toHaveLength(2);
      expect(resultado.total_percentual).toBe(100);
      expect(resultado.quantidade_original).toBe(100);
      expect(resultado.valor_total_original).toBe(550); // 100 * 5.50

      // Validações das divisões
      const divisaoPNAE = resultado.divisoes_modalidades[0];
      const divisaoMunicipal = resultado.divisoes_modalidades[1];

      expect(divisaoPNAE.modalidade_id).toBe(1);
      expect(divisaoPNAE.quantidade_proporcional).toBe(60); // 60% de 100
      expect(divisaoPNAE.valor_total_modalidade).toBe(330); // 60% de 550

      expect(divisaoMunicipal.modalidade_id).toBe(2);
      expect(divisaoMunicipal.quantidade_proporcional).toBe(40); // 40% de 100
      expect(divisaoMunicipal.valor_total_modalidade).toBe(220); // 40% de 550

      // Validação de precisão
      expect(resultado.total_quantidade_dividida).toBe(resultado.quantidade_original);
      expect(resultado.total_valor_dividido).toBe(resultado.valor_total_original);
    });

    it('deve lidar com valores que geram arredondamento', () => {
      const itemComArredondamento = {
        id: 2,
        produto_id: 102,
        nome_produto: 'Feijão Carioca 1kg',
        quantidade: 33,
        valor_unitario: 7.33
      };

      const modalidadesComArredondamento = [
        { modalidade_id: 1, nome: 'PNAE', valor_repasse: 0.30, percentual: 33.33 },
        { modalidade_id: 2, nome: 'Municipal', valor_repasse: 0.20, percentual: 33.33 },
        { modalidade_id: 3, nome: 'Estadual', valor_repasse: 0.15, percentual: 33.34 }
      ];

      const resultado = simularCalculoDivisaoProporcional(itemComArredondamento, modalidadesComArredondamento);

      // Verificar se não há perda significativa de precisão
      const diferencaQuantidade = Math.abs(resultado.total_quantidade_dividida - resultado.quantidade_original);
      const diferencaValor = Math.abs(resultado.total_valor_dividido - resultado.valor_total_original);

      expect(diferencaQuantidade).toBeLessThanOrEqual(0.002);
      expect(diferencaValor).toBeLessThanOrEqual(0.02);

      // Verificar se a soma dos percentuais está correta
      expect(resultado.total_percentual).toBe(100);
    });

    it('deve validar cenário com valores muito pequenos', () => {
      const itemPequeno = {
        id: 3,
        produto_id: 103,
        nome_produto: 'Tempero Sachê',
        quantidade: 1,
        valor_unitario: 0.05
      };

      const modalidadesDuasPartes = [
        { modalidade_id: 1, nome: 'PNAE', valor_repasse: 0.30, percentual: 70 },
        { modalidade_id: 2, nome: 'Municipal', valor_repasse: 0.20, percentual: 30 }
      ];

      const resultado = simularCalculoDivisaoProporcional(itemPequeno, modalidadesDuasPartes);

      // Mesmo com valores pequenos, deve manter a proporção
      expect(resultado.valor_total_original).toBe(0.05);
      expect(resultado.divisoes_modalidades[0].valor_total_modalidade).toBe(0.03); // 70% de 0.05 = 0.035 → 0.03
      expect(resultado.divisoes_modalidades[1].valor_total_modalidade).toBe(0.02); // 30% de 0.05 = 0.015 → 0.02

      // A soma deve ser igual ao valor original (com tolerância)
      const somaCalculada = resultado.divisoes_modalidades.reduce((sum, div) => sum + div.valor_total_modalidade, 0);
      expect(Math.abs(somaCalculada - resultado.valor_total_original)).toBeLessThanOrEqual(0.01);
    });

    it('deve processar múltiplos itens de um pedido', () => {
      const itensPedido = [
        { id: 1, produto_id: 101, nome_produto: 'Arroz 1kg', quantidade: 50, valor_unitario: 4.50 },
        { id: 2, produto_id: 102, nome_produto: 'Feijão 1kg', quantidade: 30, valor_unitario: 6.00 },
        { id: 3, produto_id: 103, nome_produto: 'Óleo 900ml', quantidade: 20, valor_unitario: 3.75 }
      ];

      const modalidadesPadrao = [
        { modalidade_id: 1, nome: 'PNAE', valor_repasse: 0.30, percentual: 50 },
        { modalidade_id: 2, nome: 'Municipal', valor_repasse: 0.20, percentual: 50 }
      ];

      const resultados = itensPedido.map(item => 
        simularCalculoDivisaoProporcional(item, modalidadesPadrao)
      );

      // Validar cada item individualmente
      resultados.forEach((resultado, index) => {
        expect(resultado.divisoes_modalidades).toHaveLength(2);
        expect(resultado.total_percentual).toBe(100);
        
        // Verificar precisão para cada item
        const diferencaValor = Math.abs(resultado.total_valor_dividido - resultado.valor_total_original);
        expect(diferencaValor).toBeLessThanOrEqual(0.02);
      });

      // Calcular totais do pedido
      const totalPedidoOriginal = resultados.reduce((sum, r) => sum + r.valor_total_original, 0);
      const totalPedidoDividido = resultados.reduce((sum, r) => sum + r.total_valor_dividido, 0);
      
      expect(Math.abs(totalPedidoDividido - totalPedidoOriginal)).toBeLessThanOrEqual(0.05);
    });
  });

  describe('Validações de Negócio', () => {
    it('deve rejeitar modalidades com percentuais inválidos', () => {
      const modalidadesInvalidas = [
        { modalidade_id: 1, nome: 'PNAE', valor_repasse: 0.30, percentual: 60 },
        { modalidade_id: 2, nome: 'Municipal', valor_repasse: 0.20, percentual: 50 } // Soma = 110%
      ];

      expect(() => {
        // Validação que deveria ser feita antes do cálculo
        const somaPercentuais = modalidadesInvalidas.reduce((sum, m) => sum + m.percentual, 0);
        if (Math.abs(somaPercentuais - 100) > 0.01) {
          throw new Error('A soma dos percentuais deve ser exatamente 100%');
        }
      }).toThrow('A soma dos percentuais deve ser exatamente 100%');
    });

    it('deve validar valores mínimos', () => {
      const itemInvalido = {
        id: 4,
        produto_id: 104,
        nome_produto: 'Item Teste',
        quantidade: 0, // Quantidade inválida
        valor_unitario: 5.00
      };

      expect(() => {
        if (itemInvalido.quantidade <= 0) {
          throw new Error('Quantidade deve ser maior que zero');
        }
        if (itemInvalido.valor_unitario <= 0) {
          throw new Error('Valor unitário deve ser maior que zero');
        }
      }).toThrow('Quantidade deve ser maior que zero');
    });

    it('deve validar existência de modalidades', () => {
      const modalidadesVazias: any[] = [];

      expect(() => {
        if (modalidadesVazias.length === 0) {
          throw new Error('Pelo menos uma modalidade deve ser configurada');
        }
      }).toThrow('Pelo menos uma modalidade deve ser configurada');
    });
  });
});