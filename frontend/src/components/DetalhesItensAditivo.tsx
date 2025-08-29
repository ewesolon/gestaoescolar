import React from "react";
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
  Chip,
} from "@mui/material";
import { AditivoContratoItem } from "../services/aditivosContratos";

interface DetalhesItensAditivoProps {
  itens: AditivoContratoItem[];
  titulo?: string;
}

const DetalhesItensAditivo: React.FC<DetalhesItensAditivoProps> = ({
  itens,
  titulo = "Itens do Aditivo"
}) => {
  const formatarQuantidade = (quantidade: number, unidade?: string) => {
    return `${quantidade.toFixed(3)} ${unidade || ''}`.trim();
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularTotais = () => {
    return itens.reduce((acc, item) => ({
      quantidade_adicional_total: acc.quantidade_adicional_total + item.quantidade_adicional,
      valor_adicional_total: acc.valor_adicional_total + item.valor_adicional
    }), { quantidade_adicional_total: 0, valor_adicional_total: 0 });
  };

  const totais = calcularTotais();

  if (!itens || itens.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Nenhum item encontrado para este aditivo.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {titulo}
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell align="right">Qtd. Original</TableCell>
              <TableCell align="center">Percentual</TableCell>
              <TableCell align="right">Qtd. Adicional</TableCell>
              <TableCell align="right">Qtd. Nova</TableCell>
              <TableCell align="right">Valor Unit.</TableCell>
              <TableCell align="right">Valor Adicional</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {itens.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.produto_nome}
                    </Typography>
                    {item.produto_unidade && (
                      <Typography variant="caption" color="text.secondary">
                        Unidade: {item.produto_unidade}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {formatarQuantidade(item.quantidade_original, item.produto_unidade)}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`+${item.percentual_acrescimo}%`}
                    color="success"
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography color="success.main" fontWeight="bold">
                    +{formatarQuantidade(item.quantidade_adicional, item.produto_unidade)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    {formatarQuantidade(item.quantidade_nova, item.produto_unidade)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {formatarMoeda(item.valor_unitario)}
                </TableCell>
                <TableCell align="right">
                  <Typography color="success.main" fontWeight="bold">
                    {formatarMoeda(item.valor_adicional)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Linha de totais */}
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell colSpan={3}>
                <Typography variant="subtitle2" fontWeight="bold">
                  TOTAIS
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                  +{totais.quantidade_adicional_total.toFixed(3)}
                </Typography>
              </TableCell>
              <TableCell colSpan={2}></TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                  {formatarMoeda(totais.valor_adicional_total)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.contrastText">
          <strong>Explicação:</strong> Para aditivos de quantidade, o percentual é aplicado 
          individualmente sobre a quantidade original de cada item. Por exemplo, se um item 
          tem quantidade 5 e o aditivo é de 10%, a nova quantidade será 5 + (5 × 10%) = 5,5.
        </Typography>
      </Box>
    </Box>
  );
};

export default DetalhesItensAditivo;