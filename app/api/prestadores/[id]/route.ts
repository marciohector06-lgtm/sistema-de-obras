import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prestadorSchema } from "@/lib/validations";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = prestadorSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prestador = await prisma.prestador.update({ where: { id }, data: parsed.data });

  return NextResponse.json(prestador);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.prestador.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
