import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contratoPrestadorSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prestadorId = searchParams.get("prestadorId");

  const contratos = await prisma.contratoPrestador.findMany({
    where: prestadorId ? { prestadorId } : undefined,
    include: { prestador: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contratos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = contratoPrestadorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const contrato = await prisma.contratoPrestador.create({ data: parsed.data });

  return NextResponse.json(contrato, { status: 201 });
}
