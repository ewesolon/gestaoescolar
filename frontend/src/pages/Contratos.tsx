import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Visibility, Search, Clear } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listarContratos } from "../services/contratos";
import { listarFornecedores } from "../services/fornecedores";
import { listarAditivosContrato } from "../services/aditivosContratos";

interface Contrato {
  id: number;
  fornecedor_id: number;
  numero: string;
  contratante: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  valor_total_contrato?: number;
}

interface Fornecedor {
  id: number;
  nome: string;
}

const Contratos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fornecedorIdParam = searchParams.get('fornecedor_id');
  
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [aditivosMap, setAditivosMap] = useState<Map<number, any[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    busca: "",
    fornecedor_id: fornecedorIdParam ? Number(fornecedorIdParam) : "",
    status: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [contratosData, fornecedoresData] = await Promise.all([
        listarContratos(),
        listarFornecedores(),
      ]);
      setContratos(contratosData);
      setFornecedores(fornecedoresData);

      // Carregar aditivos para todos os contratos
      const aditivosPromises = contratosData.map(async (contrato: Contrato) => {
        try {
          const aditivos = await listarAditivosContrato(contrato.id);
          return { contratoId: contrato.id, aditivos };
        } catch (error) {
          return { contratoId: contrato.id, aditivos: [] };
        }
      });

      const aditivosResults = await Promise.all(aditivosPromises);
      const newAditivosMap = new Map();
      aditivosResults.forEach(({ contratoId, aditivos }) => {
        newAditivosMap.set(contratoId, aditivos);
      });
      setAditivosMap(newAditivosMap);

    } catch (error) {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const fornecedorMap = new Map(fornecedores.map((f) => [f.id, f.nome]));

  // Funções para calcular status considerando aditivos
  function getDataFimFinal(contrato: Contrato, aditivos: any[]) {
    if (!contrato) return null;

    // Verificar se há aditivos de prazo aprovados
    const aditivosPrazoAprovados = aditivos.filter(
      (aditivo) => 
        (aditivo.tipo === 'PRAZO' || aditivo.tipo === 'MISTO') && 
        aditivo.aprovado_por && 
        aditivo.ativo &&
        aditivo.nova_data_fim
    );

    // Se há aditivos de prazo, usar a data mais recente
    if (aditivosPrazoAprovados.length > 0) {
      const datasNovasFim = aditivosPrazoAprovados
        .map((a: any) => new Date(a.nova_data_fim))
        .sort((a, b) => b.getTime() - a.getTime());
      
      return {
        dataFinal: datasNovasFim[0],
        temAditivo: true,
        dataOriginal: new Date(contrato.data_fim)
      };
    }

    return {
      dataFinal: new Date(contrato.data_fim),
      temAditivo: false,
      dataOriginal: new Date(contrato.data_fim)
    };
  }

  function getStatusContrato(contrato: Contrato, aditivos: any[]) {
    if (!contrato) return { status: "Desconhecido", color: "default" };

    const hoje = new Date();
    const inicio = new Date(contrato.data_inicio);
    const infoDataFim = getDataFimFinal(contrato, aditivos);
    
    if (!infoDataFim) return { status: "Desconhecido", color: "default" };

    if (!contrato.ativo) return { status: "Inativo", color: "error" };
    if (hoje < inicio) return { status: "Pendente", color: "warning" };
    
    // Se passou da data original mas tem aditivo aprovado
    if (hoje > infoDataFim.dataOriginal && infoDataFim.temAditivo) {
      if (hoje <= infoDataFim.dataFinal) {
        return { status: "Prorrogado", color: "info" };
      } else {
        return { status: "Expirado (Prorrogado)", color: "error" };
      }
    }
    
    if (hoje > infoDataFim.dataFinal) return { status: "Expirado", color: "error" };
    return { status: "Ativo", color: "success" };
  }

  const contratosFiltrados = contratos.filter((contrato) => {
    const matchBusca = !filtros.busca || 
      contrato.numero.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      contrato.contratante.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      fornecedorMap.get(contrato.fornecedor_id)?.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchFornecedor = !filtros.fornecedor_id || 
      contrato.fornecedor_id === filtros.fornecedor_id;
    
    // Usar status calculado para filtros
    const aditivos = aditivosMap.get(contrato.id) || [];
    const status = getStatusContrato(contrato, aditivos);
    
    const matchStatus = !filtros.status || 
      (filtros.status === "ativo" && (status.status === "Ativo" || status.status === "Prorrogado")) ||
      (filtros.status === "inativo" && status.status === "Inativo") ||
      (filtros.status === "expirado" && (status.status === "Expirado" || status.status === "Expirado (Prorrogado)")) ||
      (filtros.status === "prorrogado" && status.status === "Prorrogado");

    return matchBusca && matchFornecedor && matchStatus;
  });

  const limparFiltros = () => {
    setFiltros({
      busca: "",
      fornecedor_id: "",
      status: "",
    });
    // Remove o parâmetro da URL se existir
    if (fornecedorIdParam) {
      navigate('/contratos', { replace: true });
    }
  };

  const handleVerDetalhes = (id: number) => {
    navigate(`/contratos/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Contratos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/contratos/novo')}
        >
          Novo Contrato
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            label="Buscar"
            value={filtros.busca}
            onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Fornecedor</InputLabel>
            <Select
              value={filtros.fornecedor_id}
              label="Fornecedor"
              onChange={(e) => setFiltros({ ...filtros, fornecedor_id: e.target.value as number })}
            >
              <MenuItem value="">Todos</MenuItem>
              {fornecedores.map((fornecedor) => (
                <MenuItem key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filtros.status}
              label="Status"
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="prorrogado">Prorrogado</MenuItem>
              <MenuItem value="expirado">Expirado</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={limparFiltros}
          >
            Limpar
          </Button>
        </Box>
      </Paper>

      {/* Tabela de Contratos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número</TableCell>
              <TableCell>Fornecedor</TableCell>
              <TableCell>Contratante</TableCell>
              <TableCell>Data Início</TableCell>
              <TableCell>Data Fim</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contratosFiltrados.map((contrato) => (
              <TableRow key={contrato.id}>
                <TableCell>{contrato.numero}</TableCell>
                <TableCell>
                  {fornecedorMap.get(contrato.fornecedor_id) || "N/A"}
                </TableCell>
                <TableCell>{contrato.contratante}</TableCell>
                <TableCell>
                  {new Date(contrato.data_inicio).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {(() => {
                    const aditivos = aditivosMap.get(contrato.id) || [];
                    const infoDataFim = getDataFimFinal(contrato, aditivos);
                    
                    if (infoDataFim?.temAditivo) {
                      return (
                        <Box>
                          <Box component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.8rem' }}>
                            {new Date(contrato.data_fim).toLocaleDateString()}
                          </Box>
                          <br />
                          <Box component="span" sx={{ color: 'info.main', fontWeight: 'bold' }}>
                            {infoDataFim.dataFinal.toLocaleDateString()}
                          </Box>
                        </Box>
                      );
                    }
                    
                    return new Date(contrato.data_fim).toLocaleDateString();
                  })()}
                </TableCell>
                <TableCell align="right">
                  R$ {(Number(contrato.valor_total_contrato) || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  {(() => {
                    const aditivos = aditivosMap.get(contrato.id) || [];
                    const status = getStatusContrato(contrato, aditivos);
                    return (
                      <Chip
                        label={status.status}
                        color={status.color as any}
                        size="small"
                      />
                    );
                  })()}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleVerDetalhes(contrato.id)}
                    title="Ver Detalhes"
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {contratosFiltrados.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {contratos.length === 0 
              ? "Nenhum contrato encontrado." 
              : "Nenhum contrato corresponde aos filtros aplicados."
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Contratos;