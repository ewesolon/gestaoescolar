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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Alert,
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  ExpandMore,
  Gavel,
  Schedule,
  TrendingUp,
  AttachMoney,
  Visibility,
  ArrowBack,
  ArrowForward,
  Info,
  Settings,
  Assignment,
  Done,
} from "@mui/icons-material";
import {
  listarAditivosContrato,
  criarAditivo,
  editarAditivo,
  removerAditivo,
  aprovarAditivo,
  validarLimitesAditivo,
  obterProdutosContrato,
  AditivoContrato,
  ProdutoContrato,
  ItemEspecificoAditivo,
} from "../services/aditivosContratos";
import DetalhesItensAditivo from "./DetalhesItensAditivo";
import SeletorItensAditivo from "./SeletorItensAditivo";
import { formatDateForInput } from "../utils/dateUtils";

interface AditivosContratoProps {
  contratoId: number;
  contratoNumero: string;
  contratoValorTotal?: number;
  contratoDataFim?: string; // Data de fim atual do contrato
  onAditivoChange?: () => void; // Callback para notificar mudanças
}

const AditivosContrato: React.FC<AditivosContratoProps> = ({
  contratoId,
  contratoNumero,
  contratoValorTotal = 0,
  contratoDataFim,
  onAditivoChange,
}) => {
  const [aditivos, setAditivos] = useState<AditivoContrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAditivo, setEditingAditivo] = useState<AditivoContrato | null>(null);
  const [validacao, setValidacao] = useState<any>(null);
  const [aditivoDetalhes, setAditivoDetalhes] = useState<AditivoContrato | null>(null);
  const [openDetalhes, setOpenDetalhes] = useState(false);
  
  // Estados para seleção de itens específicos
  const [produtosContrato, setProdutosContrato] = useState<ProdutoContrato[]>([]);
  const [modoGlobal, setModoGlobal] = useState(true);
  const [itensEspecificos, setItensEspecificos] = useState<ItemEspecificoAditivo[]>([]);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  
  // Estados do Stepper
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Definição dos passos do stepper
  const steps = [
    {
      label: "Informações Básicas",
      description: "Número, tipo e datas do aditivo",
      icon: <Info />,
    },
    {
      label: "Configuração Específica",
      description: "Detalhes baseados no tipo de aditivo",
      icon: <Settings />,
    },
    {
      label: "Seleção de Itens",
      description: "Escolha dos produtos afetados",
      icon: <Assignment />,
    },
    {
      label: "Revisão e Confirmação",
      description: "Validação final e justificativas",
      icon: <Done />,
    },
  ];
  
  const [formData, setFormData] = useState({
    numero_aditivo: "",
    tipo: "",
    data_assinatura: "",
    data_inicio_vigencia: "",
    data_fim_vigencia: "",
    prazo_adicional_dias: "",
    nova_data_fim: "",
    percentual_acrescimo: "",
    valor_original: "0",
    valor_aditivo: "0",
    valor_total_atualizado: "0",
    justificativa: "",
    fundamentacao_legal: "",
    numero_processo: "",
    observacoes: "",
  });

  // Calcular valor total do contrato baseado nos produtos
  const calcularValorTotalContrato = () => {
    console.log('Calculando valor total:', { contratoValorTotal, produtosContrato });
    if (contratoValorTotal && contratoValorTotal > 0) {
      console.log('Usando contratoValorTotal:', contratoValorTotal);
      return Number(contratoValorTotal) || 0;
    }
    // Se não há valor total do contrato, calcular baseado nos produtos
    const valorCalculado = produtosContrato.reduce((total, produto) => {
      const valorProduto = (Number(produto.limite) || 0) * (Number(produto.preco) || 0);
      console.log('Produto:', produto.nome, 'Limite:', produto.limite, 'Preço:', produto.preco, 'Valor:', valorProduto);
      return total + valorProduto;
    }, 0);
    console.log('Valor total calculado:', valorCalculado);
    return Number(valorCalculado) || 0;
  };

  // Atualizar valor original quando produtos são carregados ou contratoValorTotal muda
  useEffect(() => {
    const valorTotal = calcularValorTotalContrato();
    
    // Verificar se o valor é válido antes de atualizar
    if (isNaN(valorTotal) || !isFinite(valorTotal) || valorTotal < 0) {
      console.error('Valor total inválido no useEffect:', valorTotal);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      valor_original: Number(valorTotal).toString()
    }));
  }, [contratoValorTotal, produtosContrato]);

  useEffect(() => {
    carregarAditivos();
  }, [contratoId]);

  const carregarAditivos = async () => {
    try {
      setLoading(true);
      const data = await listarAditivosContrato(contratoId);
      setAditivos(data);
    } catch (error) {
      setError("Erro ao carregar aditivos");
    } finally {
      setLoading(false);
    }
  };

  const carregarProdutosContrato = async () => {
    try {
      setLoadingProdutos(true);
      const produtos = await obterProdutosContrato(contratoId);
      setProdutosContrato(produtos);
    } catch (error) {
      console.error("Erro ao carregar produtos do contrato:", error);
      setError("Erro ao carregar produtos do contrato");
    } finally {
      setLoadingProdutos(false);
    }
  };

  const handleOpenDialog = async (aditivo?: AditivoContrato) => {
    // Carregar produtos do contrato quando abrir o dialog
    await carregarProdutosContrato();
    
    if (aditivo) {
      setEditingAditivo(aditivo);
      setFormData({
        numero_aditivo: aditivo.numero_aditivo,
        tipo: aditivo.tipo,
        data_assinatura: formatDateForInput(aditivo.data_assinatura),
        data_inicio_vigencia: formatDateForInput(aditivo.data_inicio_vigencia),
        data_fim_vigencia: formatDateForInput(aditivo.data_fim_vigencia),
        prazo_adicional_dias: aditivo.prazo_adicional_dias?.toString() || "",
        nova_data_fim: formatDateForInput(aditivo.nova_data_fim),
        percentual_acrescimo: aditivo.percentual_acrescimo?.toString() || "",
        valor_original: aditivo.valor_original?.toString() || "",
        valor_aditivo: aditivo.valor_aditivo?.toString() || "",
        valor_total_atualizado: aditivo.valor_total_atualizado?.toString() || "",
        justificativa: aditivo.justificativa,
        fundamentacao_legal: aditivo.fundamentacao_legal,
        numero_processo: aditivo.numero_processo || "",
        observacoes: aditivo.observacoes || "",
      });
    } else {
      setEditingAditivo(null);
      setFormData({
        numero_aditivo: "",
        tipo: "",
        data_assinatura: "",
        data_inicio_vigencia: "",
        data_fim_vigencia: "",
        prazo_adicional_dias: "",
        nova_data_fim: "",
        percentual_acrescimo: "",
        valor_original: (contratoValorTotal || 0).toString(),
        valor_aditivo: "",
        valor_total_atualizado: "",
        justificativa: "",
        fundamentacao_legal: "",
        numero_processo: "",
        observacoes: "",
      });
    }
    
    // Reset dos estados de seleção
    setModoGlobal(true);
    setItensEspecificos([]);
    setValidacao(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAditivo(null);
    setError(null);
    setValidacao(null);
    setModoGlobal(true);
    setItensEspecificos([]);
    setActiveStep(0);
    setCompletedSteps([]);
  };
  
  // Funções de navegação do stepper
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => [...prev, activeStep]);
      setActiveStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleStepClick = (step: number) => {
    // Permite navegar apenas para passos já completados ou o próximo passo
    if (step <= activeStep || completedSteps.includes(step)) {
      setActiveStep(step);
    }
  };
  
  // Validação do passo atual
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Informações Básicas
        return !!(formData.numero_aditivo && formData.tipo && formData.data_assinatura && formData.data_inicio_vigencia);
      case 1: // Configuração Específica
        if (formData.tipo === 'PRAZO' || formData.tipo === 'MISTO') {
          return !!formData.nova_data_fim;
        }
        // Para aditivos de quantidade/valor, a validação será feita na seleção de itens
        return true;
      case 2: // Seleção de Itens
        if (formData.tipo === 'PRAZO') return true; // Passo não aplicável para aditivo de prazo
        // Verificar se há itens selecionados ou modo global
        if (!modoGlobal && itensEspecificos.length === 0) return false;
        // Se for modo global, verificar se o percentual foi definido
        if (modoGlobal && (formData.tipo === 'QUANTIDADE' || formData.tipo === 'VALOR' || formData.tipo === 'MISTO')) {
          return !!formData.percentual_acrescimo && parseFloat(formData.percentual_acrescimo) > 0;
        }
        return true;
      case 3: // Revisão e Confirmação
        return !!(formData.justificativa && formData.fundamentacao_legal);
      default:
        return true;
    }
  };
  
  // Verifica se o passo deve ser exibido
  const isStepApplicable = (stepIndex: number): boolean => {
    if (stepIndex === 2) { // Seleção de Itens
      return formData.tipo === 'QUANTIDADE' || formData.tipo === 'VALOR' || formData.tipo === 'MISTO';
    }
    return true;
  };
  
  // Pula passos não aplicáveis
  const getNextApplicableStep = (currentStep: number): number => {
    let nextStep = currentStep + 1;
    while (nextStep < steps.length && !isStepApplicable(nextStep)) {
      nextStep++;
    }
    return nextStep;
  };
  
  const getPreviousApplicableStep = (currentStep: number): number => {
    let prevStep = currentStep - 1;
    while (prevStep >= 0 && !isStepApplicable(prevStep)) {
      prevStep--;
    }
    return prevStep;
  };
  
  // Renderização do conteúdo de cada passo
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Informações Básicas
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Número do Aditivo *"
                value={formData.numero_aditivo}
                onChange={(e) => setFormData({ ...formData, numero_aditivo: e.target.value })}
                fullWidth
                placeholder="Ex: 001/2024"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Aditivo *</InputLabel>
                <Select
                  value={formData.tipo}
                  label="Tipo de Aditivo *"
                  onChange={(e) => handleTipoChange(e.target.value)}
                >
                  <MenuItem value="PRAZO">Prazo</MenuItem>
                  <MenuItem value="QUANTIDADE">Quantidade</MenuItem>
                  <MenuItem value="VALOR">Valor</MenuItem>
                  <MenuItem value="MISTO">Misto (Prazo + Valor)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Assinatura *"
                type="date"
                value={formData.data_assinatura}
                onChange={(e) => setFormData({ ...formData, data_assinatura: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Início da Vigência do Aditivo *"
                type="date"
                value={formData.data_inicio_vigencia}
                onChange={(e) => setFormData({ ...formData, data_inicio_vigencia: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                helperText="Quando este aditivo entra em vigor"
              />
            </Grid>
          </Grid>
        );
        
      case 1: // Configuração Específica
        return (
          <Grid container spacing={2}>
            {/* Campos específicos para aditivo de prazo */}
            {(formData.tipo === 'PRAZO' || formData.tipo === 'MISTO') && (
              <>
                {contratoDataFim && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Data de fim atual do contrato:</strong> {new Date(contratoDataFim).toLocaleDateString('pt-BR')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Selecione a nova data de fim do contrato. O prazo adicional (dias) será calculado automaticamente.
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nova Data de Fim do Contrato *"
                    type="date"
                    value={formData.nova_data_fim}
                    onChange={(e) => handleNovaDataFimChange(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    helperText="Data até quando o contrato será válido após o aditivo"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Prazo Adicional (dias)"
                    type="number"
                    value={formData.prazo_adicional_dias}
                    onChange={(e) => setFormData({ ...formData, prazo_adicional_dias: e.target.value })}
                    fullWidth
                    InputProps={{
                      readOnly: !!contratoDataFim,
                    }}
                    helperText={
                      contratoDataFim 
                        ? "Calculado automaticamente baseado na nova data de fim" 
                        : "Digite manualmente o número de dias"
                    }
                    sx={{
                      '& .MuiInputBase-input': {
                        backgroundColor: contratoDataFim ? '#f5f5f5' : 'transparent',
                      }
                    }}
                  />
                </Grid>
              </>
            )}
            
            {/* Informação sobre configuração de valores */}
            {(formData.tipo === 'QUANTIDADE' || formData.tipo === 'VALOR' || formData.tipo === 'MISTO') && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Os valores e percentuais serão configurados na próxima etapa (Seleção de Itens).
                </Alert>
              </Grid>
            )}
          </Grid>
        );
        
      case 2: // Seleção de Itens
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Seleção de Itens
              </Typography>
              {loadingProdutos ? (
                <Typography>Carregando produtos...</Typography>
              ) : (
                <SeletorItensAditivo
                  produtos={produtosContrato}
                  onItensChange={setItensEspecificos}
                  percentualGlobal={parseFloat(formData.percentual_acrescimo) || 0}
                  onPercentualGlobalChange={(percentual) => {
                    setFormData(prev => ({ ...prev, percentual_acrescimo: percentual.toString() }));
                    handlePercentualChange(percentual.toString());
                  }}
                  modoGlobal={modoGlobal}
                  onModoChange={setModoGlobal}
                />
              )}
            </Grid>
            
            {/* Validação de limites - apenas para modo global */}
            {validacao && modoGlobal && (
              <Grid item xs={12}>
                <Alert 
                  severity={validacao.valido ? "success" : "error"}
                  sx={{ mb: 2 }}
                >
                  {validacao.valido ? (
                    <>
                      Percentual válido! Percentual acumulado: {(validacao.percentualAcumulado || 0).toFixed(2)}%
                      <br />
                      Percentual disponível: {(validacao.percentualDisponivel || 0).toFixed(2)}%
                    </>
                  ) : (
                    validacao.erro
                  )}
                </Alert>
              </Grid>
            )}
          </Grid>
        );
        
      case 3: // Revisão e Confirmação
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Aditivo
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Número:</Typography>
                      <Typography variant="body1">{formData.numero_aditivo}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Tipo:</Typography>
                      <Typography variant="body1">{formData.tipo}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Data de Assinatura:</Typography>
                      <Typography variant="body1">
                        {formData.data_assinatura ? new Date(formData.data_assinatura).toLocaleDateString('pt-BR') : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Início da Vigência:</Typography>
                      <Typography variant="body1">
                        {formData.data_inicio_vigencia ? new Date(formData.data_inicio_vigencia).toLocaleDateString('pt-BR') : '-'}
                      </Typography>
                    </Grid>
                    {formData.nova_data_fim && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Nova Data de Fim:</Typography>
                        <Typography variant="body1">
                          {new Date(formData.nova_data_fim).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Grid>
                    )}
                    {formData.percentual_acrescimo && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Percentual de Acréscimo:</Typography>
                        <Typography variant="body1">{formData.percentual_acrescimo}%</Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Justificativa *"
                value={formData.justificativa}
                onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Descreva os motivos que justificam este aditivo..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Fundamentação Legal *"
                value={formData.fundamentacao_legal}
                onChange={(e) => setFormData({ ...formData, fundamentacao_legal: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder="Ex: Art. 124 da Lei 14.133/21..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Número do Processo"
                value={formData.numero_processo}
                onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Observações"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  const handleTipoChange = (tipo: string) => {
    setFormData({ ...formData, tipo });
    
    // Limpar campos específicos quando mudar o tipo
    if (tipo === 'PRAZO') {
      setFormData(prev => ({
        ...prev,
        tipo,
        percentual_acrescimo: "",
        valor_aditivo: "",
        valor_total_atualizado: "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        tipo,
        prazo_adicional_dias: "",
        nova_data_fim: "",
      }));
    }
  };

  // Função para calcular dias adicionais automaticamente
  const calcularDiasAdicionais = (novaDataFim: string): number => {
    if (!contratoDataFim || !novaDataFim) return 0;
    
    const dataFimAtual = new Date(contratoDataFim);
    const novaData = new Date(novaDataFim);
    
    // Calcular diferença em milissegundos e converter para dias
    const diferencaMs = novaData.getTime() - dataFimAtual.getTime();
    const diferencaDias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diferencaDias); // Não permitir valores negativos
  };

  // Handler para mudança na nova data de fim
  const handleNovaDataFimChange = (novaDataFim: string) => {
    const diasAdicionais = calcularDiasAdicionais(novaDataFim);
    
    setFormData({
      ...formData,
      nova_data_fim: novaDataFim,
      prazo_adicional_dias: diasAdicionais.toString()
    });
  };

  const handlePercentualChange = async (percentual: string) => {
    console.log('handlePercentualChange chamada com:', percentual);
    const valorOriginal = calcularValorTotalContrato();
    console.log('Valor original obtido:', valorOriginal);
    
    // Verificar se valorOriginal é um número válido
    if (isNaN(valorOriginal) || valorOriginal < 0) {
      console.error('Valor original inválido:', valorOriginal);
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      percentual_acrescimo: percentual,
      valor_original: valorOriginal.toString()
    }));
    
    if (percentual && valorOriginal > 0 && modoGlobal) {
      const percentualNum = parseFloat(percentual);
      
      // Verificar se o percentual é um número válido
      if (isNaN(percentualNum) || percentualNum < 0) {
        console.error('Percentual inválido:', percentual, percentualNum);
        return;
      }
      
      const valorAditivo = (valorOriginal * percentualNum) / 100;
      const valorTotalAtualizado = valorOriginal + valorAditivo;
      
      console.log('Calculando valores:', {
        percentualNum,
        valorOriginal,
        valorAditivo,
        valorTotalAtualizado
      });
      
      // Verificar se os valores são números válidos antes de usar toFixed
      if (isNaN(valorAditivo) || isNaN(valorTotalAtualizado) || !isFinite(valorAditivo) || !isFinite(valorTotalAtualizado)) {
        console.error('Valores calculados são inválidos:', { valorAditivo, valorTotalAtualizado, valorOriginal, percentualNum });
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        percentual_acrescimo: percentual,
        valor_original: valorOriginal.toString(),
        valor_aditivo: Number(valorAditivo).toFixed(2),
        valor_total_atualizado: Number(valorTotalAtualizado).toFixed(2),
      }));

      // Validar limites apenas no modo global
      try {
        // Durante a edição, excluir o aditivo atual da validação
        const aditivoIdExcluir = editingAditivo ? editingAditivo.id : undefined;
        const validacaoResult = await validarLimitesAditivo(contratoId, formData.tipo, percentualNum, aditivoIdExcluir);
        setValidacao(validacaoResult);
      } catch (error) {
        console.error('Erro ao validar limites:', error);
      }
    } else {
      console.log('Condições não atendidas:', { percentual, valorOriginal, modoGlobal });
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.numero_aditivo || !formData.tipo || !formData.data_assinatura || 
          !formData.data_inicio_vigencia || !formData.justificativa || !formData.fundamentacao_legal) {
        setError("Preencha todos os campos obrigatórios");
        return;
      }

      // Validações específicas para modo específico
      if (!modoGlobal && (formData.tipo === 'QUANTIDADE' || formData.tipo === 'MISTO')) {
        if (itensEspecificos.length === 0) {
          setError("Selecione pelo menos um item para o aditivo específico");
          return;
        }
      }

      const aditivoData = {
        contrato_id: contratoId,
        numero_aditivo: formData.numero_aditivo,
        tipo: formData.tipo as 'PRAZO' | 'QUANTIDADE' | 'VALOR' | 'MISTO',
        data_assinatura: formData.data_assinatura,
        data_inicio_vigencia: formData.data_inicio_vigencia,
        data_fim_vigencia: formData.data_fim_vigencia || undefined,
        prazo_adicional_dias: formData.prazo_adicional_dias ? parseInt(formData.prazo_adicional_dias) : undefined,
        nova_data_fim: formData.nova_data_fim || undefined,
        percentual_acrescimo: modoGlobal && formData.percentual_acrescimo ? parseFloat(formData.percentual_acrescimo) : undefined,
        valor_original: formData.valor_original ? parseFloat(formData.valor_original) : undefined,
        valor_aditivo: formData.valor_aditivo ? parseFloat(formData.valor_aditivo) : undefined,
        valor_total_atualizado: formData.valor_total_atualizado ? parseFloat(formData.valor_total_atualizado) : undefined,
        justificativa: formData.justificativa,
        fundamentacao_legal: formData.fundamentacao_legal,
        numero_processo: formData.numero_processo || undefined,
        observacoes: formData.observacoes || undefined,
        ativo: true,
        // Adicionar itens específicos se não for modo global
        itens_especificos: !modoGlobal ? itensEspecificos : undefined,
      };

      if (editingAditivo) {
        await editarAditivo(editingAditivo.id, aditivoData);
      } else {
        await criarAditivo(aditivoData);
      }

      await carregarAditivos();
      handleCloseDialog();
      
      // Notificar o componente pai sobre a mudança
      if (onAditivoChange) {
        onAditivoChange();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Erro ao salvar aditivo");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este aditivo?")) {
      try {
        await removerAditivo(id);
        await carregarAditivos();
        
        // Notificar o componente pai sobre a mudança
        if (onAditivoChange) {
          onAditivoChange();
        }
      } catch (error) {
        setError("Erro ao remover aditivo");
      }
    }
  };

  const handleAprovar = async (id: number) => {
    try {
      await aprovarAditivo(id);
      await carregarAditivos();
    } catch (error) {
      setError("Erro ao aprovar aditivo");
    }
  };

  const handleVerDetalhes = (aditivo: AditivoContrato) => {
    setAditivoDetalhes(aditivo);
    setOpenDetalhes(true);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'PRAZO': return <Schedule />;
      case 'QUANTIDADE': return <TrendingUp />;
      case 'VALOR': return <AttachMoney />;
      case 'MISTO': return <Gavel />;
      default: return <Gavel />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'PRAZO': return 'info';
      case 'QUANTIDADE': return 'warning';
      case 'VALOR': return 'success';
      case 'MISTO': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return <Typography>Carregando aditivos...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">
          Aditivos Contratuais
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Novo Aditivo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {aditivos.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Nenhum aditivo contratual encontrado.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Data Assinatura</TableCell>
                <TableCell>Vigência</TableCell>
                <TableCell>Valor/Prazo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aditivos.map((aditivo) => (
                <TableRow key={aditivo.id}>
                  <TableCell>{aditivo.numero_aditivo}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getTipoIcon(aditivo.tipo)}
                      label={aditivo.tipo}
                      color={getTipoColor(aditivo.tipo) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(aditivo.data_assinatura).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(aditivo.data_inicio_vigencia).toLocaleDateString()}
                    {aditivo.data_fim_vigencia && (
                      <> até {new Date(aditivo.data_fim_vigencia).toLocaleDateString()}</>
                    )}
                  </TableCell>
                  <TableCell>
                    {aditivo.tipo === 'PRAZO' ? (
                      `+${aditivo.prazo_adicional_dias} dias`
                    ) : (
                      <>
                        {aditivo.percentual_acrescimo ? `${aditivo.percentual_acrescimo}%` : 'Específico'}
                        <br />
                        {aditivo.itens && aditivo.itens.length > 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            {aditivo.itens.length} itens afetados
                            {aditivo.itens.length < produtosContrato.length && (
                              <Chip 
                                label="Específico" 
                                size="small" 
                                color="info" 
                                sx={{ ml: 1, height: 16, fontSize: '0.7rem' }}
                              />
                            )}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            R$ {aditivo.valor_aditivo && !isNaN(Number(aditivo.valor_aditivo)) ? Number(aditivo.valor_aditivo).toFixed(2) : '0.00'}
                          </Typography>
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {aditivo.aprovado_por ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Aprovado"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Pendente"
                        color="warning"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {(aditivo.tipo === 'QUANTIDADE' || aditivo.tipo === 'MISTO') && aditivo.itens && aditivo.itens.length > 0 && (
                      <IconButton
                        size="small"
                        onClick={() => handleVerDetalhes(aditivo)}
                        title="Ver Detalhes dos Itens"
                        color="info"
                      >
                        <Visibility />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(aditivo)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    {!aditivo.aprovado_por && (
                      <IconButton
                        size="small"
                        onClick={() => handleAprovar(aditivo.id)}
                        title="Aprovar"
                        color="success"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(aditivo.id)}
                      title="Excluir"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog para criar/editar aditivo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAditivo ? "Editar Aditivo" : "Novo Aditivo"} - Contrato {contratoNumero}
        </DialogTitle>
        <DialogContent>
          {/* Stepper */}
          <Box sx={{ mb: 3 }}>
            <Stepper activeStep={activeStep} orientation="horizontal">
              {steps.map((step, index) => {
                const isApplicable = isStepApplicable(index);
                const isCompleted = completedSteps.includes(index);
                
                return (
                  <Step 
                    key={step.label} 
                    completed={isCompleted}
                    sx={{
                      opacity: isApplicable ? 1 : 0.5,
                      cursor: isApplicable ? 'pointer' : 'default'
                    }}
                  >
                    <StepLabel 
                      onClick={() => isApplicable && handleStepClick(index)}
                      icon={step.icon}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontSize: '0.875rem',
                          fontWeight: activeStep === index ? 600 : 400
                        }
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
                          {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>

          {/* Conteúdo do passo atual */}
          <Box sx={{ minHeight: 400 }}>
            {renderStepContent(activeStep)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          
          {/* Navegação do Stepper */}
          <Box sx={{ flexGrow: 1 }} />
          
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
          )}
          
          {activeStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              endIcon={<ArrowForward />}
              variant="contained"
              disabled={!validateCurrentStep()}
            >
              Próximo
            </Button>
          ) : (
            <Button 
              onClick={handleSave} 
              variant="contained"
              disabled={!validateCurrentStep() || (validacao && !validacao.valido && modoGlobal)}
              startIcon={<Done />}
            >
              Salvar Aditivo
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog para mostrar detalhes dos itens */}
      <Dialog 
        open={openDetalhes} 
        onClose={() => setOpenDetalhes(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Detalhes do Aditivo - {aditivoDetalhes?.numero_aditivo}
        </DialogTitle>
        <DialogContent>
          {aditivoDetalhes && aditivoDetalhes.itens && (
            <DetalhesItensAditivo 
              itens={aditivoDetalhes.itens}
              titulo={`Itens Afetados pelo Aditivo de ${aditivoDetalhes.tipo}`}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalhes(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AditivosContrato;