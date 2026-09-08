import type { PagamentoStatus } from "@/types";

export const PAGAMENTO_STATUS_LABELS: Record<PagamentoStatus, string> = {
  PENDENTE: "Pendente",
  EFETUADO: "Efetuado",
  EM_PROCESSAMENTO: "Em Processamento",
  ATRASADO: "Atrasado",
  CANCELADO: "Cancelado",
};

export const PAGAMENTO_STATUS_VARIANT: Record<PagamentoStatus, "success" | "warning" | "danger" | "info" | "neutral"> = {
  PENDENTE: "info",
  EFETUADO: "success",
  EM_PROCESSAMENTO: "warning",
  ATRASADO: "danger",
  CANCELADO: "neutral",
};

// Um pagamento pendente/em processamento cujo vencimento já passou é tratado como "Atrasado" na exibição,
// mesmo que o status gravado no banco ainda não tenha sido atualizado manualmente.
export function getPagamentoStatusEfetivo(status: PagamentoStatus, dataVencimento: Date | string): PagamentoStatus {
  if (status !== "PENDENTE" && status !== "EM_PROCESSAMENTO") return status;
  const vencimento = typeof dataVencimento === "string" ? new Date(dataVencimento) : dataVencimento;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return vencimento < hoje ? "ATRASADO" : status;
}

// Início da semana (domingo) contendo a data informada
export function getInicioSemana(data: Date): Date {
  const inicio = new Date(data);
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() - inicio.getDay());
  return inicio;
}

export function formatIntervaloSemana(inicio: Date): string {
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  const formatar = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${formatar(inicio)} - ${formatar(fim)}`;
}
