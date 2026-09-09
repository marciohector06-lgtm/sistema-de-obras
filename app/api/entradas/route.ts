import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { entradaSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async (request) => {
  const { searchParams } = new URL(request.url);
  const obraId = searchParams.get("obraId");

  const entradas = await prisma.entrada.findMany({
    where: obraId ? { obraId } : undefined,
    include: { obra: { select: { nome: true } } },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(entradas);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = entradaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const entrada = await prisma.entrada.create({ data: sanitizarObjeto(parsed.data) });
    return NextResponse.json(entrada, { status: 201 });
  },
  { nivel: "escrita" }
);
