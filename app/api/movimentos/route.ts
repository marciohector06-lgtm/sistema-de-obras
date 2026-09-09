import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { movimentoFinanceiroSchema } from "@/lib/validations";
import type { MovimentoTipo } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo") as MovimentoTipo | null;
  const obraId = searchParams.get("obraId");
  const prestadorId = searchParams.get("prestadorId");
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  const movimentos = await prisma.movimentoFinanceiro.findMany({
    where: {
      ...(tipo ? { tipo } : {}),
      ...(obraId ? { obraId } : {}),
      ...(prestadorId ? { prestadorId } : {}),
      ...(inicio && fim ? { data: { gte: new Date(inicio), lt: new Date(fim) } } : {}),
    },
    include: { obra: { select: { nome: true } }, prestador: { select: { nome: true } } },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(movimentos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = movimentoFinanceiroSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { obraId, prestadorId, ...rest } = parsed.data;

  const movimento = await prisma.movimentoFinanceiro.create({
    data: { ...rest, obraId: obraId || null, prestadorId: prestadorId || null },
  });

  return NextResponse.json(movimento, { status: 201 });
}
