import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { materialSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const PATCH = protegido(
  async (request, contexto) => {
    const { id } = await contexto.params;
    const body = await request.json();
    const parsed = materialSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const material = await prisma.material.update({ where: { id }, data: sanitizarObjeto(parsed.data) });

    return NextResponse.json(material);
  },
  { nivel: "escrita" }
);

export const DELETE = protegido(
  async (_request, contexto) => {
    const { id } = await contexto.params;
    await prisma.material.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  },
  { nivel: "escrita" }
);
