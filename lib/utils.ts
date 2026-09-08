export { cn } from "cn";

// Formata um valor numérico como moeda brasileira (R$ 1.234,56)
export function formatBRL(value: number | string): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue ?? 0);
}

// Formata uma data no padrão brasileiro (dd/mm/aaaa)
export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

// Calcula o progresso percentual de uma obra com base no gasto total e valor do contrato
export function calcProgresso(gastoTotal: number, valorContrato: number): number {
  if (!valorContrato || valorContrato <= 0) return 0;
  return (gastoTotal / valorContrato) * 100;
}

// Retorna a cor semântica de acordo com o percentual de progresso
export function corProgresso(percentual: number): "success" | "warning" | "danger" {
  if (percentual >= 100) return "danger";
  if (percentual >= 70) return "warning";
  return "success";
}

// Retorna o número de dias entre hoje e uma data futura (negativo se já passou)
export function diasRestantes(dataTermino: Date | string): number {
  const termino = typeof dataTermino === "string" ? new Date(dataTermino) : dataTermino;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  termino.setHours(0, 0, 0, 0);
  const diffMs = termino.getTime() - hoje.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
