import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { atualizarPrevisaoObra } from "@/lib/alertas";
import { protegido } from "@/lib/api-handler";

export const POST = protegido(
  async (_request, contexto) => {
    const { id } = await contexto.params;

    await atualizarPrevisaoObra(id, { forcar: true });

    const obra = await prisma.obra.findUnique({
      where: { id },
      select: { previsaoCusto: true, previsaoJustificativa: true, previsaoAtualizadaEm: true },
    });

    if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

    return NextResponse.json(obra);
  },
  { nivel: "escrita", rateLimit: { limite: 10, janelaMs: 60_000 } }
);
