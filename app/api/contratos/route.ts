import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contratoSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const obraId = searchParams.get("obraId");

  const contratos = await prisma.contrato.findMany({
    where: obraId ? { obraId } : undefined,
    include: { obra: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contratos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = contratoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const contrato = await prisma.contrato.create({ data: parsed.data });
  return NextResponse.json(contrato, { status: 201 });
}
