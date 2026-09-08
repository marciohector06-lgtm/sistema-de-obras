import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioUpdateSchema } from "@/lib/validations";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = usuarioUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const usuario = await prisma.user.update({ where: { id }, data: parsed.data });
  return NextResponse.json(usuario);
}
