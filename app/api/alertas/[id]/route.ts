import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const alertaStatusSchema = z.object({
  lido: z.boolean(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = alertaStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const alerta = await prisma.alerta.update({
    where: { id },
    data: { lido: parsed.data.lido },
  });

  return NextResponse.json(alerta);
}
