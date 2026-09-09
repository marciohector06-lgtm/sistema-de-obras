import { prisma } from "@/lib/prisma";
import { diasRestantes } from "@/lib/utils";
import { calcStatusEstoque } from "@/lib/inventario";
import { agruparGastosPorSemana } from "@/lib/gastos";
import { preverCustoObra } from "@/lib/ia/previsao";
import { ALERTA_TIPO_LABELS, ALERTA_TIPO_VARIANT } from "@/lib/alertas-labels";
import type { AlertaTipo } from "@/types";

export { ALERTA_TIPO_LABELS, ALERTA_TIPO_VARIANT };

const TIERS_ORCAMENTO: AlertaTipo[] = ["ORCAMENTO_70", "ORCAMENTO_85", "ORCAMENTO_100", "ORCAMENTO_ESTOURADO"];

function tierOrcamentoAtual(progresso: number): AlertaTipo | null {
  if (progresso > 100) return "ORCAMENTO_ESTOURADO";
  if (progresso >= 100) return "ORCAMENTO_100";
  if (progresso >= 85) return "ORCAMENTO_85";
  if (progresso >= 70) return "ORCAMENTO_70";
  return null;
}

async function upsertAlerta(params: { obraId: string; tipo: AlertaTipo; titulo: string; mensagem: string }) {
  const existente = await prisma.alerta.findFirst({
    where: { obraId: params.obraId, tipo: params.tipo, lido: false },
  });

  if (existente) {
    if (existente.mensagem !== params.mensagem || existente.titulo !== params.titulo) {
      await prisma.alerta.update({
        where: { id: existente.id },
        data: { titulo: params.titulo, mensagem: params.mensagem },
      });
    }
    return;
  }

  await prisma.alerta.create({ data: params });
}

async function resolverAlerta(obraId: string, tipo: AlertaTipo) {
  await prisma.alerta.updateMany({
    where: { obraId, tipo, lido: false },
    data: { lido: true },
  });
}

export async function verificarAlertasObra(obraId: string): Promise<void> {
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: {
      cliente: true,
      gastos: true,
      pagamentos: true,
      inventarioItens: { include: { item: true } },
    },
  });

  if (!obra) return;

  const monitorada = obra.status === "EM_ANDAMENTO";

  if (monitorada) {
    const gastoTotal = obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0);
    const progresso = Number(obra.valorContrato) > 0 ? (gastoTotal / Number(obra.valorContrato)) * 100 : 0;
    const tierAtual = tierOrcamentoAtual(progresso);

    for (const tier of TIERS_ORCAMENTO) {
      if (tier === tierAtual) {
        await upsertAlerta({
          obraId,
          tipo: tier,
          titulo: ALERTA_TIPO_LABELS[tier],
          mensagem: `${obra.nome} atingiu ${progresso.toFixed(1)}% do orçamento contratado.`,
        });
      } else {
        await resolverAlerta(obraId, tier);
      }
    }

    const dias = diasRestantes(obra.dataTermino);
    if (dias < 0) {
      await upsertAlerta({
        obraId,
        tipo: "PRAZO_VENCIDO",
        titulo: ALERTA_TIPO_LABELS.PRAZO_VENCIDO,
        mensagem: `${obra.nome} está ${Math.abs(dias)} dia(s) além do prazo de término.`,
      });
      await resolverAlerta(obraId, "PRAZO_PROXIMO");
    } else if (dias <= 15) {
      await upsertAlerta({
        obraId,
        tipo: "PRAZO_PROXIMO",
        titulo: ALERTA_TIPO_LABELS.PRAZO_PROXIMO,
        mensagem: `${obra.nome} tem ${dias} dia(s) até o término previsto.`,
      });
      await resolverAlerta(obraId, "PRAZO_VENCIDO");
    } else {
      await resolverAlerta(obraId, "PRAZO_VENCIDO");
      await resolverAlerta(obraId, "PRAZO_PROXIMO");
    }

    const itensBaixos = obra.inventarioItens
      .filter((oi) => calcStatusEstoque(oi.qtdComprada, oi.qtdUsada).status === "baixo")
      .map((oi) => oi.item.nome);

    if (itensBaixos.length > 0) {
      await upsertAlerta({
        obraId,
        tipo: "ESTOQUE_BAIXO",
        titulo: ALERTA_TIPO_LABELS.ESTOQUE_BAIXO,
        mensagem: `Itens com estoque baixo em ${obra.nome}: ${itensBaixos.join(", ")}.`,
      });
    } else {
      await resolverAlerta(obraId, "ESTOQUE_BAIXO");
    }
  }

  const inconsistencias: string[] = [];
  if (!obra.clienteId) inconsistencias.push("obra sem cliente vinculado");
  if (Number(obra.valorContrato) <= 0) inconsistencias.push("valor de contrato zerado ou negativo");
  if (obra.dataTermino < obra.dataInicio) inconsistencias.push("data de término anterior à data de início");
  if (obra.status === "EM_ANDAMENTO" && Number(obra.progresso) > 150) {
    inconsistencias.push("progresso muito acima do esperado (possível lançamento incorreto)");
  }

  if (inconsistencias.length > 0) {
    await upsertAlerta({
      obraId,
      tipo: "DADOS_INCONSISTENTES",
      titulo: ALERTA_TIPO_LABELS.DADOS_INCONSISTENTES,
      mensagem: `${obra.nome}: ${inconsistencias.join("; ")}.`,
    });
  } else {
    await resolverAlerta(obraId, "DADOS_INCONSISTENTES");
  }
}

const PREVISAO_VALIDADE_MS = 24 * 60 * 60 * 1000;

export async function atualizarPrevisaoObra(obraId: string, opts?: { forcar?: boolean }): Promise<void> {
  const obra = await prisma.obra.findUnique({
    where: { id: obraId },
    include: { gastos: true },
  });

  if (!obra || obra.status !== "EM_ANDAMENTO") return;

  const jaAtualizada =
    !opts?.forcar &&
    obra.previsaoAtualizadaEm &&
    Date.now() - obra.previsaoAtualizadaEm.getTime() < PREVISAO_VALIDADE_MS;

  if (jaAtualizada) return;

  const gastosSemanais = agruparGastosPorSemana(obra.gastos.map((g) => ({ data: g.data, valor: Number(g.valor) })));
  const gastoTotal = obra.gastos.reduce((acc, g) => acc + Number(g.valor), 0);
  const progresso = Number(obra.valorContrato) > 0 ? (gastoTotal / Number(obra.valorContrato)) * 100 : 0;

  const previsao = await preverCustoObra({
    nome: obra.nome,
    valorContrato: Number(obra.valorContrato),
    gastoTotal,
    progresso,
    dataInicio: obra.dataInicio,
    dataTermino: obra.dataTermino,
    gastosSemanais,
  });

  await prisma.obra.update({
    where: { id: obraId },
    data: {
      previsaoCusto: previsao.custoPrevisto,
      previsaoJustificativa: previsao.justificativa,
      previsaoAtualizadaEm: new Date(),
    },
  });

  if (previsao.custoPrevisto > Number(obra.valorContrato) * 1.05) {
    await upsertAlerta({
      obraId,
      tipo: "IA_PREVISAO",
      titulo: ALERTA_TIPO_LABELS.IA_PREVISAO,
      mensagem: `${obra.nome}: previsão de custo final é ${previsao.custoPrevisto.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}, acima do contratado. ${previsao.justificativa}`,
    });
  } else {
    await resolverAlerta(obraId, "IA_PREVISAO");
  }
}

export async function verificarTodasObras(): Promise<void> {
  const obras = await prisma.obra.findMany({ select: { id: true } });
  for (const obra of obras) {
    await verificarAlertasObra(obra.id);
    await atualizarPrevisaoObra(obra.id);
  }
}
