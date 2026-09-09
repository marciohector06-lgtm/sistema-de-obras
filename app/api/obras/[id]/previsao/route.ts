import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { atualizarPrevisaoObra } from "@/lib/alertas";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  await atualizarPrevisaoObra(id, { forcar: true });

  const obra = await prisma.obra.findUnique({
    where: { id },
    select: { previsaoCusto: true, previsaoJustificativa: true, previsaoAtualizadaEm: true },
  });

  if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

  return NextResponse.json(obra);
}
