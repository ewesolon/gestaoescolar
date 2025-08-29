import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import TabelaPedidoCompleta from './TabelaPedidoCompleta';

// Dados de exemplo para demonstrar o componente
const dadosExemplo = {
  numero_pedido: "2024-001",
  data_criacao: "2024-01-15T10:30:00Z",
  nome_usuario: "João Silva",
  valor_total: 15750.80,
  status: "ATIVO",
  fornecedores: [
    {
      fornecedor_id: 1,
      nome_fornecedor: "Fornecedor ABC Ltda",
      status_geral: "PARCIAL",
      status_faturamento: "PENDENTE",
      valor_total: 8500.50,
      progresso_recebimento: 75,
      itens: [
        {
          id: 1,
          produto_id: 101,
          nome_produto: "Arroz Branco 5kg",
          quantidade: 100,
          preco_unitario: 25.50,
          subtotal: 2550.00,
          unidade: "PCT",
          status_recebimento: "RECEBIDO",
          quantidade_recebida: 100
        },
        {
          id: 2,
          produto_id: 102,
          nome_produto: "Feijão Preto 1kg",
          quantidade: 200,
          preco_unitario: 12.75,
          subtotal: 2550.00,
          unidade: "PCT",
          status_recebimento: "PARCIAL",
          quantidade_recebida: 150
        },
        {
          id: 3,
          produto_id: 103,
          nome_produto: "Óleo de Soja 900ml",
          quantidade: 80,
          preco_unitario: 8.90,
          subtotal: 712.00,
          unidade: "UN",
          status_recebimento: "RECEBIDO",
          quantidade_recebida: 80
        },
        {
          id: 4,
          produto_id: 104,
          nome_produto: "Açúcar Cristal 1kg",
          quantidade: 150,
          preco_unitario: 4.20,
          subtotal: 630.00,
          unidade: "PCT",
          status_recebimento: "PENDENTE",
          quantidade_recebida: 0
        }
      ]
    },
    {
      fornecedor_id: 2,
      nome_fornecedor: "Distribuidora XYZ S.A.",
      status_geral: "RECEBIDO",
      status_faturamento: "FATURADO",
      valor_total: 4250.30,
      progresso_recebimento: 100,
      itens: [
        {
          id: 5,
          produto_id: 201,
          nome_produto: "Macarrão Espaguete 500g",
          quantidade: 120,
          preco_unitario: 3.80,
          subtotal: 456.00,
          unidade: "PCT",
          status_recebimento: "RECEBIDO",
          quantidade_recebida: 120
        },
        {
          id: 6,
          produto_id: 202,
          nome_produto: "Molho de Tomate 340g",
          quantidade: 90,
          preco_unitario: 2.50,
          subtotal: 225.00,
          unidade: "UN",
          status_recebimento: "RECEBIDO",
          quantidade_recebida: 90
        },
        {
          id: 7,
          produto_id: 203,
          nome_produto: "Leite Integral 1L",
          quantidade: 200,
          preco_unitario: 4.75,
          subtotal: 950.00,
          unidade: "UN",
          status_recebimento: "RECEBIDO",
          quantidade_recebida: 200
        }
      ]
    },
    {
      fornecedor_id: 3,
      nome_fornecedor: "Comercial 123 Eireli",
      status_geral: "PENDENTE",
      status_faturamento: "PENDENTE",
      valor_total: 3000.00,
      progresso_recebimento: 0,
      itens: [
        {
          id: 8,
          produto_id: 301,
          nome_produto: "Carne Bovina 1kg",
          quantidade: 50,
          preco_unitario: 35.00,
          subtotal: 1750.00,
          unidade: "KG",
          status_recebimento: "PENDENTE",
          quantidade_recebida: 0
        },
        {
          id: 9,
          produto_id: 302,
          nome_produto: "Frango Congelado 1kg",
          quantidade: 60,
          preco_unitario: 12.50,
          subtotal: 750.00,
          unidade: "KG",
          status_recebimento: "PENDENTE",
          quantidade_recebida: 0
        },
        {
          id: 10,
          produto_id: 303,
          nome_produto: "Peixe Filé 500g",
          quantidade: 40,
          preco_unitario: 12.50,
          subtotal: 500.00,
          unidade: "PCT",
          status_recebimento: "PENDENTE",
          quantidade_recebida: 0
        }
      ]
    }
  ]
};

const ExemploTabelaPedido: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
          Tabela Completa de Pedido
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Exemplo de componente que exibe informações completas do pedido com cabeçalho, 
          itens agrupados por fornecedor, status de recebimento e faturamento.
        </Typography>
      </Box>
      
      <TabelaPedidoCompleta pedidoInfo={dadosExemplo} />
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Funcionalidades do Componente:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
          <li>Cabeçalho com informações gerais do pedido (número, data, usuário, valor total)</li>
          <li>Tabela principal com fornecedores agrupados</li>
          <li>Status visual de recebimento e faturamento para cada fornecedor</li>
          <li>Barra de progresso mostrando percentual de recebimento</li>
          <li>Expansão/colapso para visualizar itens detalhados de cada fornecedor</li>
          <li>Tabela secundária com informações detalhadas de cada item</li>
          <li>Status individual de recebimento para cada produto</li>
          <li>Cores e ícones intuitivos para diferentes status</li>
        </Typography>
      </Box>
    </Container>
  );
};

export default ExemploTabelaPedido;