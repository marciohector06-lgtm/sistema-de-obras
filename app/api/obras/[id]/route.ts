import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obraSchema } from "@/lib/validations";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const obra = await prisma.obra.findUnique({
    where: { id },
    include: {
      cliente: true,
      gastos: { orderBy: { data: "desc" } },
    },
  });

  if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

  return NextResponse.json(obra);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = obraSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clienteId, ...rest } = parsed.data;

  const obra = await prisma.obra.update({
    where: { id },
    data: {
      ...rest,
      ...(clienteId !== undefined ? { cliente: clienteId ? { connect: { id: clienteId } } : { disconnect: true } } : {}),
    },
  });

  return NextResponse.json(obra);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.obra.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
