// Tipos compartilhados pela aplicação

export type ObraStatus =
  | "PLANEJAMENTO"
  | "EM_ANDAMENTO"
  | "PAUSADA"
  | "CONCLUIDA"
  | "CANCELADA";

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export type TipoObra = "RESIDENCIAL" | "COMERCIAL" | "REFORMA" | "INSTITUCIONAL" | "OUTRO";

export type PrestadorCategoria =
  | "MAO_DE_OBRA_GERAL"
  | "ELETRICA"
  | "HIDRAULICA"
  | "PINTURA"
  | "ALVENARIA"
  | "ACABAMENTO"
  | "OUTRO";

export type GastoCategoria =
  | "MATERIAL"
  | "MAO_DE_OBRA"
  | "EQUIPAMENTO"
  | "CONTRATO"
  | "ADMINISTRATIVO"
  | "OUTRO";

export type PagamentoStatus =
  | "PENDENTE"
  | "EFETUADO"
  | "EM_PROCESSAMENTO"
  | "ATRASADO"
  | "CANCELADO";

export type AlertaTipo =
  | "ORCAMENTO_70"
  | "ORCAMENTO_85"
  | "ORCAMENTO_100"
  | "ORCAMENTO_ESTOURADO"
  | "PRAZO_VENCIDO"
  | "PRAZO_PROXIMO"
  | "ESTOQUE_BAIXO"
  | "DADOS_INCONSISTENTES"
  | "IA_PREVISAO";

export type PropostaStatus = "ATIVA" | "APROVADA" | "REJEITADA";

export type PropostaEventoTipo = "CRIADA" | "EDITADA" | "STATUS_ALTERADO";

export type MovimentoTipo = "ENTRADA" | "SAIDA";

export type ImportacaoEmailTipo = "NFE" | "PIX_INTER" | "GERAL";

export type ImportacaoEmailStatus = "SUCESSO" | "ERRO";

export type Role = "ADMIN" | "GESTOR" | "ENGENHEIRO" | "VIEWER";

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE";

// Status de saúde calculado (semáforo) - usado nos badges de status da obra
export type SaudeObra = "ok" | "atencao" | "atrasado" | "critico";

export interface KpiCardData {
  label: string;
  value: string;
  icon?: string;
  variacao?: {
    valor: number;
    tipo: "positiva" | "negativa" | "neutra";
  };
}
