import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obraSchema } from "@/lib/validations";
import type { ObraStatus } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ObraStatus | null;
  const clienteId = searchParams.get("clienteId");
  const q = searchParams.get("q");

  const obras = await prisma.obra.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(clienteId ? { clienteId } : {}),
      ...(q ? { nome: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { cliente: true, gastos: { select: { valor: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(obras);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = obraSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clienteId, ...rest } = parsed.data;

  const obra = await prisma.obra.create({
    data: {
      ...rest,
      cliente: clienteId ? { connect: { id: clienteId } } : undefined,
    },
  });

  return NextResponse.json(obra, { status: 201 });
}
