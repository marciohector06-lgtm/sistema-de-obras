// Tipos compartilhados pela aplicação

export type ObraStatus =
  | "PLANEJAMENTO"
  | "EM_ANDAMENTO"
  | "PAUSADA"
  | "CONCLUIDA"
  | "CANCELADA";

export type Prioridade = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

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
