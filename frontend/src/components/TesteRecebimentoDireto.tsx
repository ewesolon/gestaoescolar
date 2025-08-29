import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';

// Dados de teste baseados na resposta da API
const dadosTesteDireto = {
  "1": {
    "fornecedor": {
      "id": 1,
      "nome": "ewenunes"
    },
    "itens": [
      {
        "id": 10,
        "nome_produto": "CEREAL EM PÓ DE ARROZ E AVEIA INFANTIL",
        "quantidade_esperada": 50,
        "quantidade_recebida": 0,
        "status": "PENDENTE"
      }
    ],
    "totais": {
      "quantidade_esperada": 50,
      "quantidade_recebida": 0,
      "valor_total_esperado": 125,
      "valor_total_recebido": 0,
      "percentual_recebido": 0
    }
  },
  "7": {
    "fornecedor": {
      "id": 7,
      "nome": "Amanda Nunes Dax"
    },
    "itens": [
      {
        "id": 11,
        "nome_produto": "OVO DE GALINHA",
        "quantidade_esperada": 50,
        "quantidade_recebida": 0,
        "status": "PENDENTE"
      }
    ],
    "totais": {
      "quantidade_esperada": 50,
      "quantidade_recebida": 0,
      "valor_total_esperado": 25,
      "valor_total_recebido": 0,
      "percentual_recebido": 0
    }
  }
};

const TesteRecebimentoDireto: React.FC = () => {
  console.log('🧪 TesteRecebimentoDireto - Renderizando com dados fixos');

  const fornecedores = Object.values(dadosTesteDireto);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, color: '#1976d2' }}>
        🧪 Teste com Dados Diretos (Hardcoded)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Este componente usa dados fixos da API para testar a renderização.
        <br />
        Fornecedores: {fornecedores.length}
      </Alert>

      {fornecedores.map((fornecedorData, index) => (
        <Card key={index} sx={{ mb: 2, border: '2px solid #2196f3' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
              🏢 {fornecedorData.fornecedor.nome}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>ID:</strong> {fornecedorData.fornecedor.id} | 
              <strong> Itens:</strong> {fornecedorData.itens.length}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                📦 Itens:
              </Typography>
              {fornecedorData.itens.map((item, itemIndex) => (
                <Box key={itemIndex} sx={{ ml: 2, mb: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.nome_produto}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Esperado: {item.quantidade_esperada} | 
                    Recebido: {item.quantidade_recebida} | 
                    Status: {item.status}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ p: 1, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="subtitle2">💰 Totais:</Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Qtd Esperada: {fornecedorData.totais.quantidade_esperada}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Qtd Recebida: {fornecedorData.totais.quantidade_recebida}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Valor Esperado: R$ {fornecedorData.totais.valor_total_esperado.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Percentual: {fornecedorData.totais.percentual_recebido.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Alert severity="success" sx={{ mt: 3 }}>
        ✅ Se você está vendo este conteúdo, a renderização está funcionando!
        <br />
        O problema pode estar na passagem de dados da API para o componente.
      </Alert>
    </Box>
  );
};

export default TesteRecebimentoDireto;