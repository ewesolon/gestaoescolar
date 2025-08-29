import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buscarContrato,
  editarContrato,
  removerContrato,
} from "../services/contratos";
import { listarFornecedores } from "../services/fornecedores";
import { listarProdutos } from "../services/produtos";
import { formatDateForInput } from "../utils/dateUtils";
import {
  listarContratoProdutos,
  adicionarContratoProduto,
  editarContratoProduto,
  removerContratoProduto,
} from "../services/contratos";
import { listarAditivosContrato } from "../services/aditivosContratos";
import {
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InventoryIcon from "@mui/icons-material/Inventory";
import AditivosContrato from "../components/AditivosContrato";

const produtoVazio = {
  produto_id: "",
  limite: "",
  preco: "",
};

const contratoVazio = {
  fornecedor_id: "",
  numero: "",
  contratante: "",
  data_inicio: "",
  data_fim: "",
  ativo: true,
};

export default function ContratoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contrato, setContrato] = useState<any>(null);
  const [fornecedor, setFornecedor] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produtosContrato, setProdutosContrato] = useState<any[]>([]);
  const [aditivos, setAditivos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [openProduto, setOpenProduto] = useState(false);
  const [formProduto, setFormProduto] = useState<any>(produtoVazio);
  const [editandoProduto, setEditandoProduto] = useState<any | null>(null);
  const [removerId, setRemoverId] = useState<number | null>(null);
  const [removerDialog, setRemoverDialog] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [formContrato, setFormContrato] = useState<any>(contratoVazio);
  const [removerContratoDialog, setRemoverContratoDialog] = useState(false);
  const [dependenciasContrato, setDependenciasContrato] = useState<any>(null);
  const [forceDelete, setForceDelete] = useState(false);

  // Função para calcular o valor total do contrato
  function calcularValorTotalContrato(produtos: any[]) {
    return produtos.reduce((total, produto) => {
      const valorProduto = (produto.limite || 0) * (produto.preco || 0);
      return total + valorProduto;
    }, 0);
  }

  async function carregarDados() {
    if (!id || isNaN(Number(id))) {
      setErro("ID do contrato inválido");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const contratoData = await buscarContrato(Number(id));
      setContrato(contratoData);

      // Carregar fornecedor
      const fornecedores = await listarFornecedores();
      const fornecedorData = fornecedores.find(
        (f: any) => f.id === contratoData.fornecedor_id
      );
      setFornecedor(fornecedorData);

      // Carregar produtos disponíveis
      const produtosData = await listarProdutos();
      setProdutos(produtosData);

      // Carregar produtos do contrato
      const produtosContratoData = await listarContratoProdutos(Number(id));
      // Calcular valor_total para cada produto se não estiver presente
      const produtosComValorTotal = produtosContratoData.map((produto: any) => ({
        ...produto,
        valor_total: produto.valor_total || (produto.limite * produto.preco)
      }));
      setProdutosContrato(produtosComValorTotal);

      // Carregar aditivos do contrato
      const aditivosData = await listarAditivosContrato(Number(id));
      setAditivos(aditivosData);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar dados do contrato");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, [id]);

  function abrirModalProduto(produto?: any) {
    if (produto) {
      setFormProduto({
        produto_id: produto.produto_id,
        limite: produto.limite,
        preco: produto.preco,
      });
      setEditandoProduto(produto);
    } else {
      setFormProduto(produtoVazio);
      setEditandoProduto(null);
    }
    setOpenProduto(true);
  }

  function fecharModalProduto() {
    setOpenProduto(false);
    setFormProduto(produtoVazio);
    setEditandoProduto(null);
  }

  async function salvarProduto() {
    try {
      if (
        !formProduto.produto_id ||
        !formProduto.limite ||
        !formProduto.preco
      ) {
        setErro("Produto, limite e preço são obrigatórios");
        return;
      }
      if (Number(formProduto.limite) < 0 || Number(formProduto.preco) < 0) {
        setErro("Limite e preço devem ser positivos");
        return;
      }

      if (editandoProduto) {
        await editarContratoProduto(editandoProduto.id, {
          ...formProduto,
          contrato_id: editandoProduto.contrato_id,
          saldo: formProduto.limite, // Saldo sempre igual ao limite
        });
      } else {
        await adicionarContratoProduto({
          ...formProduto,
          contrato_id: Number(id),
          saldo: formProduto.limite, // Saldo sempre igual ao limite
        });
      }
      fecharModalProduto();
      carregarDados(); // Recarregar dados para mostrar o novo produto
    } catch (error: any) {
      setErro(error.message || "Erro ao salvar produto");
    }
  }

  function confirmarRemoverProduto(id: number) {
    setRemoverId(id);
    setRemoverDialog(true);
  }

  async function removerProduto() {
    if (removerId) {
      try {
        await removerContratoProduto(removerId);
        setRemoverDialog(false);
        setRemoverId(null);
        carregarDados();
      } catch (error: any) {
        setErro(error.message || "Erro ao remover produto");
      }
    }
  }

  function abrirModalEditar() {
    setFormContrato({ 
      ...contrato,
      data_inicio: formatDateForInput(contrato.data_inicio),
      data_fim: formatDateForInput(contrato.data_fim)
    });
    setOpenEditar(true);
  }

  function fecharModalEditar() {
    setOpenEditar(false);
    setFormContrato(contratoVazio);
  }

  async function salvarContratoEditado() {
    try {
      if (
        !formContrato.numero ||
        !formContrato.contratante ||
        !formContrato.data_inicio ||
        !formContrato.data_fim
      ) {
        setErro("Todos os campos obrigatórios devem ser preenchidos");
        return;
      }
      if (
        new Date(formContrato.data_fim) <= new Date(formContrato.data_inicio)
      ) {
        setErro("Data de fim deve ser posterior à data de início");
        return;
      }
      await editarContrato(contrato.id, formContrato);
      fecharModalEditar();
      carregarDados();
    } catch (error: any) {
      setErro(error.message || "Erro ao editar contrato");
    }
  }

  function confirmarRemoverContrato() {
    setRemoverContratoDialog(true);
  }

  async function removerContratoConfirmado() {
    try {
      await removerContrato(contrato.id, forceDelete);
      setRemoverContratoDialog(false);
      setDependenciasContrato(null);
      setForceDelete(false);
      navigate("/contratos");
    } catch (error: any) {
      // Se o erro contém informações sobre dependências, mostrar opção de força
      if (error.response?.data?.dependencias) {
        setDependenciasContrato(error.response.data);
        setErro(null); // Limpar erro anterior
      } else {
        setErro(error.response?.data?.message || error.message || "Erro ao remover contrato");
      }
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleDateString("pt-BR");
  }

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  function getDataFimFinal(contrato: any, aditivos: any[]) {
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
        .map(a => new Date(a.nova_data_fim))
        .sort((a, b) => b.getTime() - a.getTime()); // Ordenar da mais recente para mais antiga
      
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

  function getStatusContrato(contrato: any, aditivos: any[]) {
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

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (erro) return <Alert severity="error">{erro}</Alert>;
  if (!contrato) return <Alert severity="error">Contrato não encontrado</Alert>;

  const status = getStatusContrato(contrato, aditivos);

  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            fornecedor && navigate(`/fornecedores/${fornecedor.id}`)
          }
          sx={{ mb: 2 }}
        >
          Voltar para Fornecedor
        </Button>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
            onClick={abrirModalEditar}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={confirmarRemoverContrato}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      {/* Informações do Contrato */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography
            variant="h4"
            sx={{ mb: 2, display: "flex", alignItems: "center" }}
          >
            <BusinessIcon sx={{ mr: 1 }} />
            Contrato #{contrato.id}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Fornecedor:</strong> {fornecedor?.nome || "N/A"}
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 1, display: "flex", alignItems: "center" }}
              >
                <CalendarTodayIcon sx={{ mr: 1, fontSize: "small" }} />
                <strong>Início:</strong> {formatarData(contrato.data_inicio)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Número:</strong> {contrato.numero}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Contratante:</strong> {contrato.contratante}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="body1"
                sx={{ mb: 1, display: "flex", alignItems: "center" }}
              >
                <CalendarTodayIcon sx={{ mr: 1, fontSize: "small" }} />
                <strong>Fim:</strong> 
                {(() => {
                  const infoDataFim = getDataFimFinal(contrato, aditivos);
                  if (infoDataFim?.temAditivo) {
                    return (
                      <Box component="span" sx={{ ml: 1 }}>
                        <Box component="span" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          {formatarData(contrato.data_fim)}
                        </Box>
                        <Box component="span" sx={{ ml: 1, color: 'info.main', fontWeight: 'bold' }}>
                          → {formatarData(infoDataFim.dataFinal.toISOString())}
                        </Box>
                        <Chip 
                          label="Prorrogado" 
                          size="small" 
                          color="info" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    );
                  }
                  return <Box component="span" sx={{ ml: 1 }}>{formatarData(contrato.data_fim)}</Box>;
                })()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={status.status}
                  color={status.color as any}
                  size="small"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary">
                  Valor total do contrato:{" "}
                  {formatarMoeda(calcularValorTotalContrato(produtosContrato))}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Produtos do Contrato */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">
          Produtos ({produtosContrato.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => abrirModalProduto()}
        >
          Adicionar Produto
        </Button>
      </Box>

      {produtosContrato.length === 0 ? (
        <Alert severity="info">
          Este contrato ainda não possui produtos vinculados.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Limite</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Valor Total</TableCell>
                <TableCell>Saldo</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtosContrato.map((produto) => {
                const produtoInfo = produtos.find(
                  (p: any) => p.id === produto.produto_id
                );
                return (
                  <TableRow key={produto.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {produtoInfo?.nome ||
                            `Produto #${produto.produto_id}`}
                        </Typography>
                        {produto.produto_nome && (
                          <Typography variant="caption" color="textSecondary">
                            {produto.produto_nome}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{produto.limite}</TableCell>
                    <TableCell>{formatarMoeda(produto.preco)}</TableCell>
                    <TableCell>
                      {formatarMoeda(produto.valor_total || 0)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={produto.saldo}
                        color={produto.saldo > 0 ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => abrirModalProduto(produto)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => confirmarRemoverProduto(produto.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Seção de Aditivos Contratuais */}
      <Box sx={{ mt: 4 }}>
        <AditivosContrato 
          contratoId={contrato.id} 
          contratoNumero={contrato.numero}
          contratoValorTotal={contrato.valor_total}
          contratoDataFim={contrato.data_fim}
          onAditivoChange={carregarDados}
        />
      </Box>

      {/* Modal para adicionar/editar produto */}
      <Dialog open={openProduto} onClose={fecharModalProduto}>
        <DialogTitle>
          {editandoProduto ? "Editar Produto" : "Adicionar Produto"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Produto</InputLabel>
            <Select
              value={formProduto.produto_id}
              label="Produto"
              onChange={(e) =>
                setFormProduto({ ...formProduto, produto_id: e.target.value })
              }
              required
            >
              {produtos.map((produto) => (
                <MenuItem key={produto.id} value={produto.id}>
                  {produto.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Limite"
            type="number"
            value={formProduto.limite}
            onChange={(e) =>
              setFormProduto({ ...formProduto, limite: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Preço"
            type="number"
            value={formProduto.preco}
            onChange={(e) =>
              setFormProduto({ ...formProduto, preco: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
            required
            inputProps={{ min: 0, step: 0.01 }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalProduto}>Cancelar</Button>
          <Button onClick={salvarProduto} variant="contained">
            {editandoProduto ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de remoção */}
      <Dialog open={removerDialog} onClose={() => setRemoverDialog(false)}>
        <DialogTitle>Remover Produto</DialogTitle>
        <DialogContent>
          Tem certeza que deseja remover este produto do contrato?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoverDialog(false)}>Cancelar</Button>
          <Button onClick={removerProduto} color="error" variant="contained">
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de edição do contrato */}
      <Dialog open={openEditar} onClose={fecharModalEditar}>
        <DialogTitle>Editar Contrato</DialogTitle>
        <DialogContent>
          <TextField
            label="Número do Contrato"
            value={formContrato.numero}
            onChange={(e) =>
              setFormContrato({ ...formContrato, numero: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Contratante"
            value={formContrato.contratante}
            onChange={(e) =>
              setFormContrato({ ...formContrato, contratante: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Data Início"
            type="date"
            value={formContrato.data_inicio}
            onChange={(e) =>
              setFormContrato({ ...formContrato, data_inicio: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Data Fim"
            type="date"
            value={formContrato.data_fim}
            onChange={(e) =>
              setFormContrato({ ...formContrato, data_fim: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalEditar}>Cancelar</Button>
          <Button onClick={salvarContratoEditado} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de confirmação de remoção do contrato */}
      <Dialog
        open={removerContratoDialog}
        onClose={() => {
          setRemoverContratoDialog(false);
          setDependenciasContrato(null);
          setForceDelete(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remover Contrato</DialogTitle>
        <DialogContent>
          {!dependenciasContrato ? (
            <Typography>
              Tem certeza que deseja remover este contrato? Esta ação não pode ser desfeita.
            </Typography>
          ) : (
            <Box>
              <Typography color="error" gutterBottom>
                {dependenciasContrato.message}
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
                Dependências encontradas:
              </Typography>
              <Box sx={{ pl: 2 }}>
                {dependenciasContrato.dependencias.produtos > 0 && (
                  <Typography variant="body2">
                    • {dependenciasContrato.dependencias.produtos} produtos vinculados
                  </Typography>
                )}
                {dependenciasContrato.dependencias.aditivos > 0 && (
                  <Typography variant="body2">
                    • {dependenciasContrato.dependencias.aditivos} aditivos vinculados
                  </Typography>
                )}
                {dependenciasContrato.dependencias.pedidos_itens > 0 && (
                  <Typography variant="body2">
                    • {dependenciasContrato.dependencias.pedidos_itens} itens de pedidos vinculados
                  </Typography>
                )}
                {dependenciasContrato.dependencias.movimentacoes > 0 && (
                  <Typography variant="body2">
                    • {dependenciasContrato.dependencias.movimentacoes} movimentações vinculadas
                  </Typography>
                )}
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    color="error"
                  />
                }
                label="Forçar exclusão (removerá todas as dependências)"
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setRemoverContratoDialog(false);
              setDependenciasContrato(null);
              setForceDelete(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={removerContratoConfirmado}
            color="error"
            variant="contained"
            disabled={dependenciasContrato && !forceDelete}
          >
            {dependenciasContrato && forceDelete ? "Forçar Remoção" : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
