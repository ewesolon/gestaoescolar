import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import {
  ArrowBack,
  Add,
  Business,
  Phone,
  Email,
  LocationOn,
  Description,
  Visibility,
  Edit,
} from "@mui/icons-material";
import { buscarFornecedor } from "../services/fornecedores";
import { listarContratos } from "../services/contratos";
import { listarAditivosContrato } from "../services/aditivosContratos";

interface Fornecedor {
  id: number;
  nome: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: boolean;
}

interface Contrato {
  id: number;
  numero: string;
  contratante: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  valor_total_contrato?: number;
}

export default function FornecedorDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [aditivosMap, setAditivosMap] = useState<Map<number, any[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Carregar dados do fornecedor
      const fornecedorData = await buscarFornecedor(Number(id));
      setFornecedor(fornecedorData);
      
      // Carregar contratos do fornecedor
      const contratosData = await listarContratos();
      const contratosFornecedor = contratosData.filter(
        (contrato: Contrato) => contrato.fornecedor_id === Number(id)
      );
      setContratos(contratosFornecedor);

      // Carregar aditivos para todos os contratos do fornecedor
      const aditivosPromises = contratosFornecedor.map(async (contrato: Contrato) => {
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
      
    } catch (error: any) {
      setError(error.message || "Erro ao carregar dados do fornecedor");
    } finally {
      setLoading(false);
    }
  };

  const handleNovoContrato = () => {
    navigate(`/contratos/novo?fornecedor_id=${id}`);
  };

  const handleVerContrato = (contratoId: number) => {
    navigate(`/contratos/${contratoId}`);
  };

  const handleEditarFornecedor = () => {
    navigate(`/fornecedores?edit=${id}`);
  };



  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

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

  const getStatusContrato = (contrato: Contrato, aditivos: any[]) => {
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
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!fornecedor) {
    return <Alert severity="error">Fornecedor não encontrado</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/fornecedores")}
          sx={{ mb: 2 }}
        >
          Voltar para Fornecedores
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>

          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEditarFornecedor}
          >
            Editar Fornecedor
          </Button>
        </Box>
      </Box>

      {/* Informações do Fornecedor */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Business sx={{ mr: 1, fontSize: 32, color: "primary.main" }} />
            <Typography variant="h4">
              {fornecedor.nome}
            </Typography>
            <Chip
              label={fornecedor.ativo ? "Ativo" : "Inativo"}
              color={fornecedor.ativo ? "success" : "error"}
              sx={{ ml: 2 }}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  CNPJ
                </Typography>
                <Typography variant="body1">
                  {fornecedor.cnpj}
                </Typography>
              </Box>

              {fornecedor.telefone && (
                <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                  <Phone sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Telefone
                    </Typography>
                    <Typography variant="body1">
                      {fornecedor.telefone}
                    </Typography>
                  </Box>
                </Box>
              )}

              {fornecedor.email && (
                <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                  <Email sx={{ mr: 1, fontSize: 20, color: "text.secondary" }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      E-mail
                    </Typography>
                    <Typography variant="body1">
                      {fornecedor.email}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {fornecedor.endereco && (
                <Box sx={{ mb: 2, display: "flex", alignItems: "flex-start" }}>
                  <LocationOn sx={{ mr: 1, fontSize: 20, color: "text.secondary", mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Endereço
                    </Typography>
                    <Typography variant="body1">
                      {fornecedor.endereco}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" color="primary">
                  {contratos.length} contrato(s) cadastrado(s)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Valor total: {formatarMoeda(
                    contratos.reduce((total, contrato) => 
                      total + (contrato.valor_total_contrato || 0), 0
                    )
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Contratos */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
              <Description sx={{ mr: 1 }} />
              Contratos ({contratos.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNovoContrato}
            >
              Novo Contrato
            </Button>
          </Box>

          {contratos.length === 0 ? (
            <Alert severity="info">
              Este fornecedor ainda não possui contratos cadastrados.
              <br />
              Clique em "Novo Contrato" para cadastrar o primeiro contrato.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Número</TableCell>
                    <TableCell>Contratante</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Valor Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contratos.map((contrato) => {
                    const aditivos = aditivosMap.get(contrato.id) || [];
                    const status = getStatusContrato(contrato, aditivos);
                    return (
                      <TableRow key={contrato.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {contrato.numero}
                          </Typography>
                        </TableCell>
                        <TableCell>{contrato.contratante}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatarData(contrato.data_inicio)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            até {(() => {
                              const infoDataFim = getDataFimFinal(contrato, aditivos);
                              if (infoDataFim?.temAditivo) {
                                return (
                                  <Box component="span">
                                    <Box component="span" sx={{ textDecoration: 'line-through' }}>
                                      {formatarData(contrato.data_fim)}
                                    </Box>
                                    <Box component="span" sx={{ ml: 1, color: 'info.main', fontWeight: 'bold' }}>
                                      → {formatarData(infoDataFim.dataFinal.toISOString())}
                                    </Box>
                                  </Box>
                                );
                              }
                              return formatarData(contrato.data_fim);
                            })()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {contrato.valor_total_contrato 
                            ? formatarMoeda(contrato.valor_total_contrato)
                            : "N/A"
                          }
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={status.status}
                            color={status.color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleVerContrato(contrato.id)}
                            title="Ver Detalhes"
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}