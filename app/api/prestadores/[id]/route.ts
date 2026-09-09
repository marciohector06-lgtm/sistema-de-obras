import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prestadorSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const PATCH = protegido(
  async (request, contexto) => {
    const { id } = await contexto.params;
    const body = await request.json();
    const parsed = prestadorSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const prestador = await prisma.prestador.update({ where: { id }, data: sanitizarObjeto(parsed.data) });

    return NextResponse.json(prestador);
  },
  { nivel: "escrita" }
);

export const DELETE = protegido(
  async (_request, contexto) => {
    const { id } = await contexto.params;
    await prisma.prestador.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  },
  { nivel: "escrita" }
);
