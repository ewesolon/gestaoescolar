import React, { useEffect, useState } from "react";
import { listarCardapios } from "../services/cardapios";
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  MenuBook,
  Visibility,
  CheckCircle,
  Cancel,
  CalendarToday,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Cardapio {
  id: number;
  nome: string;
  periodo_dias: number;
  data_inicio: string;
  data_fim: string;
  modalidade_id?: number;
  modalidade_nome?: string;
  ativo: boolean;
}

const CardapiosPage = () => {
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const carregarCardapios = async () => {
    try {
      setLoading(true);
      const data = await listarCardapios();
      setCardapios(data);
      setErro("");
    } catch (error) {
      console.error('Erro ao carregar cardápios:', error);
      setErro("Erro ao carregar cardápios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCardapios();
  }, []);

  const cardapiosFiltrados = cardapios.filter(cardapio =>
    cardapio.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBook color="primary" />
          Cardápios
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/cardapios/novo")}
        >
          Adicionar Cardápio
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Buscar cardápios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cardápios ({cardapiosFiltrados.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : erro ? (
            <Alert severity="error" sx={{ mt: 2 }}>{erro}</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Cardápio</TableCell>
                    <TableCell>Modalidade</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Vigência</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cardapiosFiltrados.map((cardapio) => (
                    <TableRow key={cardapio.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MenuBook color="primary" fontSize="small" />
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {cardapio.nome}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {cardapio.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {cardapio.modalidade_nome || 'Não definida'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            {cardapio.periodo_dias} dias
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatarData(cardapio.data_inicio)} até {formatarData(cardapio.data_fim)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={cardapio.ativo ? <CheckCircle /> : <Cancel />}
                          label={cardapio.ativo ? 'Ativo' : 'Inativo'}
                          color={cardapio.ativo ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalhes">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/cardapios/${cardapio.id}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cardapiosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">
                          {searchTerm ? 'Nenhum cardápio encontrado com os filtros aplicados' : 'Nenhum cardápio cadastrado'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CardapiosPage;
