import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  FormControlLabel,
  Alert,
  Chip,
  Switch,
  Grid,
} from "@mui/material";
import { ProdutoContrato, ItemEspecificoAditivo } from "../services/aditivosContratos";

interface SeletorItensAditivoProps {
  produtos: ProdutoContrato[];
  onItensChange: (itens: ItemEspecificoAditivo[]) => void;
  percentualGlobal?: number;
  onPercentualGlobalChange?: (percentual: number) => void;
  modoGlobal: boolean;
  onModoChange: (global: boolean) => void;
}

interface ItemSelecionado {
  contrato_produto_id: number;
  selecionado: boolean;
  percentual_acrescimo: number;
  produto_nome: string;
  produto_unidade: string;
  quantidade_atual: number;
  preco: number;
}

const SeletorItensAditivo: React.FC<SeletorItensAditivoProps> = ({
  produtos,
  onItensChange,
  percentualGlobal = 0,
  onPercentualGlobalChange,
  modoGlobal,
  onModoChange,
}) => {
  const [itensSelecionados, setItensSelecionados] = useState<ItemSelecionado[]>([]);

  useEffect(() => {
    // Inicializar itens com dados dos produtos
    const itensIniciais = produtos.map(produto => ({
      contrato_produto_id: produto.contrato_produto_id,
      selecionado: modoGlobal, // Se modo global, selecionar todos
      percentual_acrescimo: percentualGlobal,
      produto_nome: produto.produto_nome || '',
      produto_unidade: produto.produto_unidade || '',
      quantidade_atual: Number(produto.quantidade_atual) || 0,
      preco: Number(produto.preco) || 0,
    }));
    
    setItensSelecionados(itensIniciais);
  }, [produtos, modoGlobal, percentualGlobal]);

  useEffect(() => {
    // Quando muda para modo global, selecionar todos os itens
    if (modoGlobal) {
      setItensSelecionados(prev => 
        prev.map(item => ({ 
          ...item, 
          selecionado: true,
          percentual_acrescimo: percentualGlobal 
        }))
      );
    }
  }, [modoGlobal, percentualGlobal]);

  useEffect(() => {
    // Notificar mudanças nos itens selecionados
    if (!modoGlobal) {
      const itensEspecificos = itensSelecionados
        .filter(item => item.selecionado && item.percentual_acrescimo > 0)
        .map(item => ({
          contrato_produto_id: item.contrato_produto_id,
          percentual_acrescimo: item.percentual_acrescimo,
        }));
      
      onItensChange(itensEspecificos);
    } else {
      onItensChange([]);
    }
  }, [itensSelecionados, modoGlobal, onItensChange]);

  const handleSelecionarItem = (contrato_produto_id: number, selecionado: boolean) => {
    setItensSelecionados(prev => 
      prev.map(item => 
        item.contrato_produto_id === contrato_produto_id 
          ? { ...item, selecionado }
          : item
      )
    );
  };

  const handlePercentualChange = (contrato_produto_id: number, percentual: number) => {
    setItensSelecionados(prev => 
      prev.map(item => 
        item.contrato_produto_id === contrato_produto_id 
          ? { ...item, percentual_acrescimo: percentual }
          : item
      )
    );
  };

  const handleSelecionarTodos = (selecionado: boolean) => {
    setItensSelecionados(prev => 
      prev.map(item => ({ ...item, selecionado }))
    );
  };

  const handlePercentualGlobal = (percentual: number) => {
    setItensSelecionados(prev => 
      prev.map(item => ({ ...item, percentual_acrescimo: percentual }))
    );
    // Comunicar mudança ao componente pai
    if (onPercentualGlobalChange) {
      onPercentualGlobalChange(percentual);
    }
  };

  const calcularPrevisao = (item: ItemSelecionado) => {
    if (!item.selecionado || item.percentual_acrescimo <= 0) return null;
    
    const quantidadeAtual = item.quantidade_atual || 0;
    const preco = item.preco || 0;
    const quantidadeAdicional = (quantidadeAtual * item.percentual_acrescimo) / 100;
    const quantidadeNova = quantidadeAtual + quantidadeAdicional;
    const valorAdicional = quantidadeAdicional * preco;
    
    return {
      quantidadeAdicional,
      quantidadeNova,
      valorAdicional,
    };
  };

  const formatarQuantidade = (quantidade: number | string | undefined, unidade: string) => {
    const qtd = Number(quantidade) || 0;
    return `${qtd.toFixed(3)} ${unidade}`.trim();
  };

  const formatarMoeda = (valor: number | string) => {
    const num = Number(valor) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  const itensSelecionadosCount = itensSelecionados.filter(item => item.selecionado).length;
  const valorTotalAdicional = itensSelecionados
    .filter(item => item.selecionado)
    .reduce((total, item) => {
      const previsao = calcularPrevisao(item);
      return total + (previsao?.valorAdicional || 0);
    }, 0);

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={modoGlobal}
                onChange={(e) => onModoChange(e.target.checked)}
                color="primary"
              />
            }
            label={modoGlobal ? "Modo Global (todos os itens)" : "Modo Específico (itens selecionados)"}
          />
        </Grid>
        
        {!modoGlobal && (
          <Grid item xs={12} sm={6}>
            <Alert severity="info" sx={{ py: 0.5 }}>
              {itensSelecionadosCount} de {produtos.length} itens selecionados
            </Alert>
          </Grid>
        )}
      </Grid>

      {modoGlobal && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            No modo global, o percentual será aplicado a todos os produtos do contrato.
          </Alert>
          <TextField
            label="Percentual de Acréscimo Global (%) *"
            type="number"
            value={percentualGlobal || ''}
            onChange={(e) => handlePercentualGlobal(parseFloat(e.target.value) || 0)}
            fullWidth
            inputProps={{ step: "0.01", max: "25" }}
            helperText="Este percentual será aplicado a todos os produtos"
          />
        </Box>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        {!modoGlobal && (
          <FormControlLabel
            control={
              <Checkbox
                checked={itensSelecionados.every(item => item.selecionado)}
                indeterminate={
                  itensSelecionados.some(item => item.selecionado) && 
                  !itensSelecionados.every(item => item.selecionado)
                }
                onChange={(e) => handleSelecionarTodos(e.target.checked)}
              />
            }
            label="Selecionar Todos"
          />
        )}
        
        {!modoGlobal && (
          <TextField
            label="Percentual Global (%)"
            type="number"
            size="small"
            sx={{ width: 150 }}
            inputProps={{ step: "0.01", max: "25" }}
            onChange={(e) => handlePercentualGlobal(parseFloat(e.target.value) || 0)}
            helperText="Aplicar a todos"
          />
        )}
        
        {valorTotalAdicional > 0 && (
          <Chip
            label={`Valor adicional total: ${formatarMoeda(valorTotalAdicional)}`}
            color="success"
            variant="outlined"
          />
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Selecionar</TableCell>
                  <TableCell>Produto</TableCell>
                  <TableCell align="right">Qtd. Atual</TableCell>
                  <TableCell align="center">Percentual (%)</TableCell>
                  <TableCell align="right">Qtd. Adicional</TableCell>
                  <TableCell align="right">Qtd. Nova</TableCell>
                  <TableCell align="right">Valor Adicional</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itensSelecionados.map((item) => {
                  const previsao = calcularPrevisao(item);
                  
                  return (
                    <TableRow 
                      key={item.contrato_produto_id}
                      sx={{ 
                        backgroundColor: item.selecionado ? 'action.selected' : 'inherit',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={item.selecionado}
                          onChange={(e) => handleSelecionarItem(item.contrato_produto_id, e.target.checked)}
                          disabled={modoGlobal}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.produto_nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatarMoeda(item.preco)}/{item.produto_unidade}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatarQuantidade(item.quantidade_atual, item.produto_unidade)}
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          size="small"
                          value={item.percentual_acrescimo}
                          onChange={(e) => handlePercentualChange(
                            item.contrato_produto_id, 
                            parseFloat(e.target.value) || 0
                          )}
                          disabled={modoGlobal || !item.selecionado}
                          inputProps={{ 
                            step: "0.01", 
                            max: "25",
                            style: { textAlign: 'center', width: '80px' }
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {previsao ? (
                          <Typography color="success.main" fontWeight="bold">
                            +{formatarQuantidade(previsao.quantidadeAdicional, item.produto_unidade)}
                          </Typography>
                        ) : (
                          <Typography color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {previsao ? (
                          <Typography fontWeight="bold">
                            {formatarQuantidade(previsao.quantidadeNova, item.produto_unidade)}
                          </Typography>
                        ) : (
                          <Typography color="text.disabled">
                            {formatarQuantidade(item.quantidade_atual, item.produto_unidade)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {previsao ? (
                          <Typography color="success.main" fontWeight="bold">
                            {formatarMoeda(previsao.valorAdicional)}
                          </Typography>
                        ) : (
                          <Typography color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

      {!modoGlobal && itensSelecionadosCount === 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Selecione pelo menos um item para criar o aditivo específico.
        </Alert>
      )}
    </Box>
  );
};

export default SeletorItensAditivo;