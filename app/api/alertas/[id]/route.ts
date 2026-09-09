import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protegido } from "@/lib/api-handler";

const alertaStatusSchema = z.object({
  lido: z.boolean(),
});

export const PATCH = protegido(
  async (request, contexto) => {
    const { id } = await contexto.params;
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
  },
  { nivel: "escrita" }
);
