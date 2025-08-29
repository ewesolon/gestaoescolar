import { apiWithRetry } from "./api";

export interface AditivoContrato {
  id: number;
  contrato_id: number;
  numero_aditivo: string;
  tipo: 'PRAZO' | 'QUANTIDADE' | 'VALOR' | 'MISTO';
  data_assinatura: string;
  data_inicio_vigencia: string;
  data_fim_vigencia?: string;
  
  // Aditivo de Prazo
  prazo_adicional_dias?: number;
  nova_data_fim?: string;
  
  // Aditivo de Quantidade/Valor
  percentual_acrescimo?: number;
  valor_original?: number;
  valor_aditivo?: number;
  valor_total_atualizado?: number;
  
  // Justificativas e documentação
  justificativa: string;
  fundamentacao_legal: string;
  numero_processo?: string;
  
  // Controle
  ativo: boolean;
  criado_por: number;
  aprovado_por?: number;
  data_aprovacao?: string;
  observacoes?: string;
  
  // Campos adicionais do JOIN
  criado_por_nome?: string;
  aprovado_por_nome?: string;
  
  // Itens do aditivo (para aditivos de quantidade)
  itens?: AditivoContratoItem[];
}

export interface AditivoContratoItem {
  id: number;
  aditivo_id: number;
  contrato_produto_id: number;
  quantidade_original: number;
  percentual_acrescimo: number;
  quantidade_adicional: number;
  quantidade_nova: number;
  valor_unitario: number;
  valor_adicional: number;
  
  // Campos adicionais do JOIN
  produto_nome?: string;
  produto_unidade?: string;
}

export interface QuantidadeComAditivos {
  contrato_produto_id: number;
  produto_id: number;
  quantidade_original: number;
  quantidade_final: number;
  quantidade_adicional_total: number;
  preco: number;
  produto_nome: string;
  unidade: string;
  aditivos_aplicados: {
    aditivo_id: number;
    quantidade_adicional: number;
  }[];
}

export interface ProdutoContrato {
  contrato_produto_id: number;
  produto_id: number;
  quantidade_atual: number;
  preco: number;
  produto_nome: string;
  produto_unidade: string;
  valor_total: number;
}

export interface ItemEspecificoAditivo {
  contrato_produto_id: number;
  percentual_acrescimo: number;
}

export async function listarAditivosContrato(contrato_id: number) {
  const { data } = await apiWithRetry.get(`/aditivos-contratos/contrato/${contrato_id}`);
  return data.data || data; // Handle both new format {success, data, total} and old format
}

export async function buscarAditivo(id: number) {
  const { data } = await apiWithRetry.get(`/aditivos-contratos/${id}`);
  return data.data || data; // Handle both new format {success, data} and old format
}

export async function criarAditivo(aditivo: Omit<AditivoContrato, 'id' | 'criado_por' | 'criado_por_nome' | 'aprovado_por_nome'> & { itens_especificos?: ItemEspecificoAditivo[] }) {
  const { data } = await apiWithRetry.post("/aditivos-contratos", aditivo);
  return data.data || data; // Handle both new format {success, data} and old format
}

export async function editarAditivo(id: number, aditivo: Partial<AditivoContrato>) {
  const { data } = await apiWithRetry.put(`/aditivos-contratos/${id}`, aditivo);
  return data.data || data; // Handle both new format {success, data} and old format
}

export async function removerAditivo(id: number) {
  await apiWithRetry.delete(`/aditivos-contratos/${id}`);
}

export async function aprovarAditivo(id: number, observacoes?: string) {
  const { data } = await apiWithRetry.put(`/aditivos-contratos/${id}/aprovar`, { observacoes });
  return data.data || data; // Handle both new format {success, data} and old format
}

export async function validarLimitesAditivo(contrato_id: number, tipo: string, percentual_acrescimo?: number, aditivo_id_excluir?: number) {
  const params = new URLSearchParams();
  params.append('tipo', tipo);
  if (percentual_acrescimo) {
    params.append('percentual_acrescimo', percentual_acrescimo.toString());
  }
  if (aditivo_id_excluir) {
    params.append('aditivo_id_excluir', aditivo_id_excluir.toString());
  }
  
  const { data } = await apiWithRetry.get(`/aditivos-contratos/validar-limites/${contrato_id}?${params}`);
  return data.data || data; // Handle both new format {success, data} and old format
}

export async function obterQuantidadesComAditivos(contrato_id: number): Promise<{
  contrato_id: number;
  produtos: QuantidadeComAditivos[];
}> {
  const { data } = await apiWithRetry.get(`/aditivos-contratos/contrato/${contrato_id}/quantidades`);
  return data.data || data; // Handle both new format {success, data} and old format
}

export async function obterProdutosContrato(contrato_id: number): Promise<ProdutoContrato[]> {
  const { data } = await apiWithRetry.get(`/aditivos-contratos/contrato/${contrato_id}/produtos`);
  return data.data || data; // Handle both new format {success, data} and old format
}