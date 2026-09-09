import { prisma } from "@/lib/prisma";

export interface PixDetectado {
  valor: number;
  nomePagador: string | null;
}

const REGEX_VALOR = /R\$\s*([\d.]+,\d{2})/;
const REGEX_NOME = /(?:recebido de|pagador|remetente|de)\s*:?\s*([A-ZÀ-Ú][A-Za-zÀ-ú' .-]{2,60})/i;

export function extrairPixInter(corpoTexto: string): PixDetectado | null {
  const valorMatch = corpoTexto.match(REGEX_VALOR);
  if (!valorMatch) return null;

  const valor = Number(valorMatch[1].replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(valor) || valor <= 0) return null;

  const nomeMatch = corpoTexto.match(REGEX_NOME);
  const nomePagador = nomeMatch ? nomeMatch[1].trim() : null;

  return { valor, nomePagador };
}

export async function importarPixComoMovimento(pix: PixDetectado, dataRecebimento: Date): Promise<void> {
  let prestadorId: string | null = null;

  if (pix.nomePagador) {
    const prestador = await prisma.prestador.findFirst({
      where: { nome: { contains: pix.nomePagador, mode: "insensitive" } },
    });
    prestadorId = prestador?.id ?? null;
  }

  await prisma.movimentoFinanceiro.create({
    data: {
      tipo: "ENTRADA",
      descricao: pix.nomePagador ? `Pix recebido de ${pix.nomePagador}` : "Pix recebido",
      valor: pix.valor,
      data: dataRecebimento,
      categoria: "Pix Banco Inter",
      prestadorId,
    },
  });
}
