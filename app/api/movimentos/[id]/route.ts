import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protegido } from "@/lib/api-handler";

export const DELETE = protegido(
  async (_request, contexto) => {
    const { id } = await contexto.params;
    await prisma.movimentoFinanceiro.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  },
  { nivel: "escrita" }
);
