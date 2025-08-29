import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';

import { pedidoModernoService } from '../services/pedidoModernoService';

const TesteStatusItens: React.FC = () => {
  const [pedidoId, setPedidoId] = useState<number>(11);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dados, setDados] = useState<any>(null);

  const testarStatusItens = async () => {
    setLoading(true);
    setError(null);
    setDados(null);

    try {
      console.log('Testando busca de status dos itens para pedido:', pedidoId);
      const response = await pedidoModernoService.buscarStatusItensPedido(pedidoId);
      console.log('Resposta recebida:', response);
      setDados(response);
    } catch (err: any) {
      console.error('Erro no teste:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Teste - Status dos Itens do Pedido
      </Typography>

      {/* Controles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="ID do Pedido"
              type="number"
              value={pedidoId}
              onChange={(e) => setPedidoId(parseInt(e.target.value) || 0)}
              size="small"
              sx={{ minWidth: 150 }}
            />
            
            <Button
              startIcon={loading ? <CircularProgress size={16} /> : <Search />}
              onClick={testarStatusItens}
              variant="contained"
              disabled={loading || !pedidoId || pedidoId <= 0}
            >
              {loading ? 'Testando...' : 'Testar'}
            </Button>
            
            <Button
              startIcon={<Refresh />}
              onClick={() => {
                setError(null);
                setDados(null);
              }}
              variant="outlined"
            >
              Limpar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Erro:</strong> {error}
          </Typography>
        </Alert>
      )}

      {/* Dados */}
      {dados && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Resultado do Teste
            </Typography>
            
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Dados carregados com sucesso!
            </Alert>

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Pedido ID:</strong> {dados.data?.pedido_id}
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Fornecedores encontrados:</strong> {Object.keys(dados.data?.itensPorFornecedor || {}).length}
            </Typography>

            {dados.data?.itensPorFornecedor && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Detalhes por Fornecedor:
                </Typography>
                
                {Object.entries(dados.data.itensPorFornecedor).map(([fornecedorId, fornecedorData]: [string, any]) => (
                  <Card key={fornecedorId} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {fornecedorData.fornecedor?.nome || 'Nome não encontrado'}
                        </Typography>
                        <Chip 
                          label={fornecedorData.fornecedor?.status || 'Status não definido'} 
                          size="small" 
                          color="primary"
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Total de itens:</strong> {fornecedorData.itens?.length || 0}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Valor total esperado:</strong> R$ {(fornecedorData.resumo?.valor_total_esperado || 0).toFixed(2)}
                      </Typography>

                      {fornecedorData.itens && fornecedorData.itens.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Itens:
                          </Typography>
                          <List dense>
                            {fornecedorData.itens.slice(0, 3).map((item: any, index: number) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemText
                                  primary={item.nome_produto}
                                  secondary={`Qtd: ${item.quantidade} ${item.unidade} - R$ ${(item.subtotal || 0).toFixed(2)}`}
                                />
                              </ListItem>
                            ))}
                            {fornecedorData.itens.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                ... e mais {fornecedorData.itens.length - 3} itens
                              </Typography>
                            )}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}

            {/* Debug Info */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Debug - Dados completos:
              </Typography>
              <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(dados, null, 2)}
              </pre>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TesteStatusItens;