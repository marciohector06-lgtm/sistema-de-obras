import { Type } from "@google/genai";
import { gerarJsonIA, isGeminiConfigurado } from "@/lib/ia/gemini";
import { formatBRL, formatDateBR } from "@/lib/utils";

export interface PrevisaoCusto {
  custoPrevisto: number;
  justificativa: string;
  fonte: "gemini" | "local";
}

interface PrevisaoInput {
  nome: string;
  valorContrato: number;
  gastoTotal: number;
  progresso: number;
  dataInicio: Date;
  dataTermino: Date;
  gastosSemanais: { semana: string; total: number }[];
}

function semanasRestantes(dataTermino: Date): number {
  const diffMs = dataTermino.getTime() - Date.now();
  return Math.max(diffMs / (1000 * 60 * 60 * 24 * 7), 0);
}

function preverCustoLocal(input: PrevisaoInput): PrevisaoCusto {
  const semanasComDados = input.gastosSemanais.slice(-6);

  if (semanasComDados.length < 2) {
    return {
      custoPrevisto: input.gastoTotal,
      justificativa: "Dados insuficientes para projetar tendência (menos de 2 semanas de gastos registrados).",
      fonte: "local",
    };
  }

  const mediaSemanal =
    semanasComDados.reduce((acc, s) => acc + s.total, 0) / semanasComDados.length;
  const restantes = semanasRestantes(input.dataTermino);
  const custoPrevisto = input.gastoTotal + mediaSemanal * restantes;

  return {
    custoPrevisto,
    justificativa: `Estimativa local: média de ${formatBRL(mediaSemanal)}/semana nas últimas ${semanasComDados.length} semanas, projetada para as ${restantes.toFixed(1)} semanas restantes até o término.`,
    fonte: "local",
  };
}

export async function preverCustoObra(input: PrevisaoInput): Promise<PrevisaoCusto> {
  const estimativaLocal = preverCustoLocal(input);

  if (!isGeminiConfigurado()) return estimativaLocal;

  const prompt = `Você é um analista de custos de uma construtora. Analise os dados abaixo e projete o custo final da obra.

Obra: ${input.nome}
Valor do contrato: ${formatBRL(input.valorContrato)}
Gasto até agora: ${formatBRL(input.gastoTotal)} (${input.progresso.toFixed(1)}% do contrato)
Início: ${formatDateBR(input.dataInicio)}
Término previsto: ${formatDateBR(input.dataTermino)}
Gastos por semana (mais recente por último): ${JSON.stringify(input.gastosSemanais)}
Estimativa local de referência: ${formatBRL(estimativaLocal.custoPrevisto)}

Responda com o custo final previsto em reais (número) e uma justificativa curta (1-2 frases, em português) considerando a tendência de gastos e o tempo restante.`;

  try {
    const resultado = await gerarJsonIA<{ custoPrevisto: number; justificativa: string }>({
      prompt,
      systemInstruction:
        "Você é um analista financeiro de obras. Responda sempre em português, de forma objetiva.",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          custoPrevisto: { type: Type.NUMBER },
          justificativa: { type: Type.STRING },
        },
        required: ["custoPrevisto", "justificativa"],
      },
    });

    if (!resultado || !Number.isFinite(resultado.custoPrevisto)) return estimativaLocal;

    return {
      custoPrevisto: resultado.custoPrevisto,
      justificativa: resultado.justificativa,
      fonte: "gemini",
    };
  } catch {
    return estimativaLocal;
  }
}
