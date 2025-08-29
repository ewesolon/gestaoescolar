import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Restaurant,
  Visibility,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { listarRefeicoes, criarRefeicao, editarRefeicao, deletarRefeicao } from '../services/refeicoes';
import { Refeicao } from '../types/refeicao';

const RefeicoesPage = () => {
  const navigate = useNavigate();
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingRefeicao, setEditingRefeicao] = useState<Refeicao | null>(null);
  const [refeicaoToDelete, setRefeicaoToDelete] = useState<Refeicao | null>(null);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    tipo: 'almoco' as const,
    ativo: true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    carregarRefeicoes();
  }, []);

  const carregarRefeicoes = async () => {
    try {
      setLoading(true);
      const data = await listarRefeicoes();
      setRefeicoes(data);
    } catch (error: any) {
      console.error('Erro ao carregar refeições:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar refeições. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const refeicoesFiltradas = refeicoes.filter(refeicao =>
    refeicao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (refeicao.descricao && refeicao.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const abrirModal = () => {
    setForm({ nome: '', descricao: '', tipo: 'almoco' as const, ativo: true });
    setEditingRefeicao(null);
    setModalOpen(true);
  };

  const abrirModalEdicao = (refeicao: Refeicao) => {
    setForm({
      nome: refeicao.nome,
      descricao: refeicao.descricao || '',
      tipo: refeicao.tipo,
      ativo: refeicao.ativo
    });
    setEditingRefeicao(refeicao);
    setModalOpen(true);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditingRefeicao(null);
    setForm({ nome: '', descricao: '', tipo: 'almoco' as const, ativo: true });
  };

  const salvarRefeicao = async () => {
    try {
      const dadosRefeicao = {
        nome: form.nome,
        descricao: form.descricao || undefined,
        tipo: form.tipo,
        ativo: form.ativo
      };

      if (editingRefeicao) {
        await editarRefeicao(editingRefeicao.id, dadosRefeicao);
        setSnackbar({
          open: true,
          message: 'Refeição atualizada com sucesso!',
          severity: 'success'
        });
      } else {
        await criarRefeicao(dadosRefeicao);
        setSnackbar({
          open: true,
          message: 'Refeição criada com sucesso!',
          severity: 'success'
        });
      }

      await carregarRefeicoes();
      fecharModal();
    } catch (error: any) {
      console.error('Erro ao salvar refeição:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Erro desconhecido';
      setSnackbar({
        open: true,
        message: `Erro ao salvar refeição: ${errorMessage}`,
        severity: 'error'
      });
    }
  };

  const abrirModalDelete = (refeicao: Refeicao) => {
    setRefeicaoToDelete(refeicao);
    setDeleteModalOpen(true);
  };

  const fecharModalDelete = () => {
    setDeleteModalOpen(false);
    setRefeicaoToDelete(null);
  };

  const confirmarDelete = async () => {
    if (refeicaoToDelete) {
      try {
        await deletarRefeicao(refeicaoToDelete.id);
        await carregarRefeicoes();
        fecharModalDelete();
        setSnackbar({
          open: true,
          message: 'Refeição excluída com sucesso!',
          severity: 'success'
        });
      } catch (error: any) {
        console.error('Erro ao deletar refeição:', error);
        fecharModalDelete();
        
        // Verifica se é erro de constraint (refeição sendo usada)
        const errorMessage = error?.message || error?.response?.data?.message || 'Erro desconhecido';
        
        if (errorMessage.includes('está sendo usada em cardápio') || 
            errorMessage.includes('constraint') || 
            error?.response?.status === 409) {
          setSnackbar({
            open: true,
            message: `Não é possível excluir a refeição "${refeicaoToDelete.nome}" pois ela está sendo utilizada em cardápios. Remova-a dos cardápios primeiro.`,
            severity: 'warning'
          });
        } else {
          setSnackbar({
            open: true,
            message: `Erro ao excluir refeição: ${errorMessage}`,
            severity: 'error'
          });
        }
      }
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTipo = (tipo: string) => {
    const tipos = {
      'cafe_manha': 'Café da Manhã',
      'almoco': 'Almoço',
      'lanche_tarde': 'Lanche da Tarde',
      'jantar': 'Jantar',
      'ceia': 'Ceia'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const verDetalhes = (refeicaoId: number) => {
    navigate(`/refeicoes/${refeicaoId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        Refeições
      </Typography>

      {/* Filtros e Busca */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar refeições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={abrirModal}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Nova Refeição
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Refeições ({refeicoesFiltradas.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                   <TableRow>
                     <TableCell>Refeição</TableCell>
                     <TableCell>Tipo</TableCell>
                     <TableCell>Status</TableCell>
                     <TableCell>Data Criação</TableCell>
                     <TableCell align="center">Ações</TableCell>
                   </TableRow>
                 </TableHead>
                <TableBody>
                  {refeicoesFiltradas.map((refeicao) => (
                    <TableRow key={refeicao.id}>
                       <TableCell>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Restaurant color="primary" fontSize="small" />
                           <Box>
                             <Typography variant="body2" fontWeight="bold">
                               {refeicao.nome}
                             </Typography>
                             {refeicao.descricao && (
                               <Typography variant="caption" color="text.secondary">
                                 {refeicao.descricao}
                               </Typography>
                             )}
                           </Box>
                         </Box>
                       </TableCell>
                       <TableCell>
                         <Typography variant="body2">
                           {formatarTipo(refeicao.tipo)}
                         </Typography>
                       </TableCell>
                       <TableCell>
                         <Chip
                           label={refeicao.ativo ? 'Ativo' : 'Inativo'}
                           size="small"
                           color={refeicao.ativo ? 'success' : 'error'}
                           variant="outlined"
                         />
                       </TableCell>
                       <TableCell>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <CalendarToday fontSize="small" color="action" />
                           <Typography variant="body2">
                             {formatarData(refeicao.created_at)}
                           </Typography>
                         </Box>
                       </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton
                              size="small"
                              onClick={() => verDetalhes(refeicao.id)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => abrirModalEdicao(refeicao)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remover">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => abrirModalDelete(refeicao)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {refeicoesFiltradas.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={5} align="center">
                         <Typography color="text.secondary">
                           Nenhuma refeição encontrada
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

      {/* Modal de Cadastro/Edição */}
      <Dialog open={modalOpen} onClose={fecharModal} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRefeicao ? 'Editar Refeição' : 'Nova Refeição'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nome da Refeição"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Descrição"
              value={form.descricao || ''}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              select
              label="Tipo de Refeição"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="cafe_manha">Café da Manhã</option>
              <option value="almoco">Almoço</option>
              <option value="lanche_tarde">Lanche da Tarde</option>
              <option value="jantar">Jantar</option>
              <option value="ceia">Ceia</option>
            </TextField>
            <TextField
              select
              label="Status"
              value={form.ativo ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, ativo: e.target.value === 'true' })}
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModal}>Cancelar</Button>
          <Button
            onClick={salvarRefeicao}
            variant="contained"
            disabled={!form.nome.trim()}
          >
            {editingRefeicao ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação de Delete */}
      <Dialog open={deleteModalOpen} onClose={fecharModalDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a refeição "{refeicaoToDelete?.nome}"?
            Esta ação não pode ser desfeita.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Se esta refeição estiver sendo usada em cardápios, 
              ela não poderá ser excluída. Remova-a dos cardápios primeiro.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalDelete}>Cancelar</Button>
          <Button onClick={confirmarDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RefeicoesPage;
