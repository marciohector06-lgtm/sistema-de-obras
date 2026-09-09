import type { AlertaTipo } from "@/types";

export const ALERTA_TIPO_LABELS: Record<AlertaTipo, string> = {
  ORCAMENTO_70: "Orçamento em 70%",
  ORCAMENTO_85: "Orçamento em 85%",
  ORCAMENTO_100: "Orçamento em 100%",
  ORCAMENTO_ESTOURADO: "Orçamento Estourado",
  PRAZO_VENCIDO: "Prazo Vencido",
  PRAZO_PROXIMO: "Prazo Próximo",
  ESTOQUE_BAIXO: "Estoque Baixo",
  DADOS_INCONSISTENTES: "Dados Inconsistentes",
  IA_PREVISAO: "Previsão da IA",
};

export const ALERTA_TIPO_VARIANT: Record<AlertaTipo, "success" | "warning" | "danger" | "info"> = {
  ORCAMENTO_70: "info",
  ORCAMENTO_85: "warning",
  ORCAMENTO_100: "warning",
  ORCAMENTO_ESTOURADO: "danger",
  PRAZO_VENCIDO: "danger",
  PRAZO_PROXIMO: "warning",
  ESTOQUE_BAIXO: "warning",
  DADOS_INCONSISTENTES: "danger",
  IA_PREVISAO: "info",
};
