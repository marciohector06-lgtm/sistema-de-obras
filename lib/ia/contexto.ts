import { prisma } from "@/lib/prisma";
import { formatBRL, formatDateBR, diasRestantes } from "@/lib/utils";
import { getObraSaude } from "@/lib/obra";

export async function montarContextoPortfolio(): Promise<string> {
  const obras = await prisma.obra.findMany({
    include: { cliente: true, gastos: { select: { valor: true } }, pagamentos: true },
    orderBy: { createdAt: "desc" },
  });

  const alertasNaoLidos = await prisma.alerta.findMany({
    where: { lido: false },
    include: { obra: { select: { nome: true } } },
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  const linhasObras = obras.map((obra) => {
    const gastoTotal = obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0);
    const saude = getObraSaude({
      progresso: Number(obra.progresso),
      dataTermino: obra.dataTermino,
      status: obra.status,
    });
    const pagamentosAtrasados = obra.pagamentos.filter(
      (p) => p.status !== "EFETUADO" && p.status !== "CANCELADO" && new Date(p.dataVencimento) < new Date()
    ).length;

    return [
      `- ${obra.nome} (cliente: ${obra.cliente?.nome ?? "sem cliente"})`,
      `status ${obra.status}, prioridade ${obra.prioridade}`,
      `progresso ${Number(obra.progresso).toFixed(1)}%`,
      `contrato ${formatBRL(Number(obra.valorContrato))}`,
      `gasto ${formatBRL(gastoTotal)}`,
      `término ${formatDateBR(obra.dataTermino)} (${diasRestantes(obra.dataTermino)} dias)`,
      `saúde: ${saude.label}`,
      `pagamentos atrasados: ${pagamentosAtrasados}`,
      obra.previsaoCusto ? `previsão de custo IA: ${formatBRL(Number(obra.previsaoCusto))}` : null,
    ]
      .filter(Boolean)
      .join(", ");
  });

  const linhasAlertas = alertasNaoLidos.map(
    (a) => `- [${a.tipo}] ${a.titulo}${a.obra ? ` (${a.obra.nome})` : ""}: ${a.mensagem}`
  );

  return [
    "OBRAS DO PORTFÓLIO:",
    linhasObras.join("\n") || "Nenhuma obra cadastrada.",
    "",
    "ALERTAS NÃO LIDOS:",
    linhasAlertas.join("\n") || "Nenhum alerta pendente.",
  ].join("\n");
}
