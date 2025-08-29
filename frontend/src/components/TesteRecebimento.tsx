import React, { useState, useEffect } from 'react';
import { Box, Typography, Alert, Card, CardContent } from '@mui/material';
import { recebimentoModernoService } from '../services/recebimentoModernoService';

interface TesteRecebimentoProps {
  itensPorFornecedor: any;
}

const TesteRecebimento: React.FC<TesteRecebimentoProps> = ({ itensPorFornecedor }) => {
  console.log('🧪 TesteRecebimento - Props recebidas:', itensPorFornecedor);

  if (!itensPorFornecedor) {
    return <Alert severity="warning">itensPorFornecedor é null/undefined</Alert>;
  }

  const fornecedores = Object.values(itensPorFornecedor);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Teste de Recebimento - ID 6
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Dados das Props
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Tipo itensPorFornecedor:</strong> {typeof itensPorFornecedor}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Keys itensPorFornecedor:</strong> {Object.keys(itensPorFornecedor || {}).join(', ')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Quantidade fornecedores:</strong> {fornecedores.length}
          </Typography>
        </CardContent>
      </Card>

      {fornecedores.length === 0 ? (
        <Alert severity="warning">
          Nenhum fornecedor encontrado!
          <br />
          Debug: {JSON.stringify(itensPorFornecedor, null, 2)}
        </Alert>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Fornecedores ({fornecedores.length})
          </Typography>
          
          {fornecedores.map((fornecedorData: any, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {fornecedorData.fornecedor?.nome || 'Nome não encontrado'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>ID:</strong> {fornecedorData.fornecedor?.id}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Quantidade de itens:</strong> {fornecedorData.itens?.length || 0}
                </Typography>
                
                {fornecedorData.itens && fornecedorData.itens.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Itens:
                    </Typography>
                    {fornecedorData.itens.map((item: any, itemIndex: number) => (
                      <Box key={itemIndex} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="body2">
                          <strong>{item.nome_produto}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Esperado: {item.quantidade_esperada} | 
                          Recebido: {item.quantidade_recebida} | 
                          Status: {item.status}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            JSON das Props
          </Typography>
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(itensPorFornecedor, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TesteRecebimento;