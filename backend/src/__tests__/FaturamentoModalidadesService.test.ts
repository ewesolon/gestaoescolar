// Teste unitário simples para validações de cálculos proporcionais

describe('Validações de Cálculos Proporcionais', () => {
  // Função auxiliar para validar percentuais
  function validarPercentuais(percentuais: number[]): void {
    for (const percentual of percentuais) {
      if (percentual < 0 || percentual > 100) {
        throw new Error('Percentuais devem estar entre 0 e 100');
      }
    }

    const soma = percentuais.reduce((acc, val) => acc + val, 0);
    if (Math.abs(soma - 100) > 0.01) {
      throw new Error('A soma dos percentuais deve ser exatamente 100%');
    }
  }

  // Função auxiliar para calcular valores por modalidade
  function calcularValoresPorModalidade(
    valorItem: number,
    modalidades: any[],
    percentuais: number[]
  ): Array<{ modalidade_id: number; percentual: number; valor_calculado: number }> {
    if (modalidades.length !== percentuais.length) {
      throw new Error('Número de modalidades deve corresponder ao número de percentuais');
    }

    validarPercentuais(percentuais);

    return modalidades.map((modalidade, index) => ({
      modalidade_id: modalidade.modalidade_id,
      percentual: percentuais[index],
      valor_calculado: Math.round((valorItem * percentuais[index] / 100) * 100) / 100
    }));
  }

  // Função auxiliar para verificar precisão
  function verificarPrecisaoCalculos(
    valorOriginal: number,
    divisoes: Array<{ valor_calculado: number }>
  ): void {
    const somaCalculada = divisoes.reduce((sum, div) => sum + div.valor_calculado, 0);
    const diferenca = Math.abs(somaCalculada - valorOriginal);
    
    if (diferenca > 0.05) {
      throw new Error(`Perda de precisão detectada: diferença de R$ ${diferenca.toFixed(4)}`);
    }
  }

  describe('Cálculo de Valores Proporcionais', () => {
    it('deve calcular valores proporcionais corretamente', () => {
      const valorItem = 100;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' },
        { modalidade_id: 2, nome: 'Modalidade B' }
      ];
      const percentuais = [60, 40];

      const resultado = calcularValoresPorModalidade(valorItem, modalidades, percentuais);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].valor_calculado).toBe(60);
      expect(resultado[1].valor_calculado).toBe(40);
      expect(resultado[0].modalidade_id).toBe(1);
      expect(resultado[1].modalidade_id).toBe(2);
    });

    it('deve arredondar valores corretamente', () => {
      const valorItem = 100;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' },
        { modalidade_id: 2, nome: 'Modalidade B' }
      ];
      const percentuais = [33.33, 66.67];

      const resultado = calcularValoresPorModalidade(valorItem, modalidades, percentuais);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].valor_calculado).toBe(33.33);
      expect(resultado[1].valor_calculado).toBe(66.67);
    });

    it('deve validar entrada de dados', () => {
      const valorItem = 100;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' }
      ];
      const percentuais = [60, 40]; // Mais percentuais que modalidades

      expect(() => {
        calcularValoresPorModalidade(valorItem, modalidades, percentuais);
      }).toThrow('Número de modalidades deve corresponder ao número de percentuais');
    });

    it('deve validar soma de percentuais', () => {
      const valorItem = 100;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' },
        { modalidade_id: 2, nome: 'Modalidade B' }
      ];
      const percentuais = [60, 50]; // Soma = 110%

      expect(() => {
        calcularValoresPorModalidade(valorItem, modalidades, percentuais);
      }).toThrow('A soma dos percentuais deve ser exatamente 100%');
    });
  });

  describe('Validação de Percentuais', () => {
    it('deve validar percentuais corretos', () => {
      const percentuais = [60, 40];
      expect(() => validarPercentuais(percentuais)).not.toThrow();
    });

    it('deve rejeitar percentuais negativos', () => {
      const percentuais = [-10, 110];
      expect(() => validarPercentuais(percentuais))
        .toThrow('Percentuais devem estar entre 0 e 100');
    });

    it('deve rejeitar percentuais maiores que 100', () => {
      const percentuais = [50, 150];
      expect(() => validarPercentuais(percentuais))
        .toThrow('Percentuais devem estar entre 0 e 100');
    });

    it('deve rejeitar soma diferente de 100', () => {
      const percentuais = [30, 30, 30];
      expect(() => validarPercentuais(percentuais))
        .toThrow('A soma dos percentuais deve ser exatamente 100%');
    });

    it('deve aceitar percentuais com casas decimais que somam 100', () => {
      const percentuais = [33.33, 33.33, 33.34];
      expect(() => validarPercentuais(percentuais)).not.toThrow();
    });
  });

  describe('Verificação de Precisão', () => {
    it('deve detectar perda de precisão significativa', () => {
      const valorOriginal = 100;
      const divisoes = [
        { valor_calculado: 50 },
        { valor_calculado: 49 } // Diferença de 1 real
      ];

      expect(() => {
        verificarPrecisaoCalculos(valorOriginal, divisoes);
      }).toThrow('Perda de precisão detectada');
    });

    it('deve aceitar diferenças mínimas de arredondamento', () => {
      const valorOriginal = 100;
      const divisoes = [
        { valor_calculado: 50.01 },
        { valor_calculado: 49.99 }
      ];

      expect(() => {
        verificarPrecisaoCalculos(valorOriginal, divisoes);
      }).not.toThrow();
    });
  });

  describe('Cenários de Teste Complexos', () => {
    it('deve lidar com valores pequenos e arredondamento', () => {
      const valorItem = 0.03;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' },
        { modalidade_id: 2, nome: 'Modalidade B' }
      ];
      const percentuais = [33.33, 66.67];

      const resultado = calcularValoresPorModalidade(valorItem, modalidades, percentuais);
      const somaCalculada = resultado.reduce((sum: number, item: any) => sum + item.valor_calculado, 0);
      
      // Verificar se a diferença é mínima (tolerância de 1 centavo)
      expect(Math.abs(somaCalculada - valorItem)).toBeLessThanOrEqual(0.01);
    });

    it('deve lidar com valores pequenos em múltiplas modalidades', () => {
      const valorItem = 0.99;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' },
        { modalidade_id: 2, nome: 'Modalidade B' },
        { modalidade_id: 3, nome: 'Modalidade C' }
      ];
      const percentuais = [50, 30, 20];

      const resultado = calcularValoresPorModalidade(valorItem, modalidades, percentuais);
      
      expect(resultado[0].valor_calculado).toBe(0.50); // 50% de 0.99
      expect(resultado[1].valor_calculado).toBe(0.30); // 30% de 0.99
      expect(resultado[2].valor_calculado).toBe(0.20); // 20% de 0.99
    });

    it('deve lidar com valores grandes', () => {
      const valorItem = 999999.99;
      const modalidades = [
        { modalidade_id: 1, nome: 'Modalidade A' },
        { modalidade_id: 2, nome: 'Modalidade B' }
      ];
      const percentuais = [70, 30];

      const resultado = calcularValoresPorModalidade(valorItem, modalidades, percentuais);
      
      expect(resultado[0].valor_calculado).toBe(699999.99); // 70% de 999999.99
      expect(resultado[1].valor_calculado).toBe(300000.00); // 30% de 999999.99
      
      const soma = resultado[0].valor_calculado + resultado[1].valor_calculado;
      expect(Math.abs(soma - valorItem)).toBeLessThanOrEqual(0.01);
    });

    it('deve validar cálculos com múltiplas modalidades', () => {
      const valorItem = 1000;
      const modalidades = [
        { modalidade_id: 1, nome: 'PNAE' },
        { modalidade_id: 2, nome: 'Municipal' },
        { modalidade_id: 3, nome: 'Estadual' },
        { modalidade_id: 4, nome: 'Federal' }
      ];
      const percentuais = [25, 25, 25, 25];

      const resultado = calcularValoresPorModalidade(valorItem, modalidades, percentuais);
      
      expect(resultado).toHaveLength(4);
      resultado.forEach(item => {
        expect(item.valor_calculado).toBe(250);
      });
      
      const somaTotal = resultado.reduce((sum, item) => sum + item.valor_calculado, 0);
      expect(somaTotal).toBe(valorItem);
    });
  });
});