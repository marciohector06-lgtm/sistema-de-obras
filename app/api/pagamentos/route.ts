import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pagamentoSchema } from "@/lib/validations";
import type { PagamentoStatus } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const obraId = searchParams.get("obraId");
  const status = searchParams.get("status") as PagamentoStatus | null;
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");

  const pagamentos = await prisma.pagamento.findMany({
    where: {
      ...(obraId ? { obraId } : {}),
      ...(status ? { status } : {}),
      ...(inicio && fim ? { dataVencimento: { gte: new Date(inicio), lt: new Date(fim) } } : {}),
    },
    include: { obra: { select: { nome: true } } },
    orderBy: { dataVencimento: "asc" },
  });

  return NextResponse.json(pagamentos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = pagamentoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { prestadorId, ...rest } = parsed.data;
  const pagamento = await prisma.pagamento.create({ data: { ...rest, prestadorId: prestadorId || null } });
  return NextResponse.json(pagamento, { status: 201 });
}
