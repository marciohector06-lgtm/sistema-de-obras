import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemInventarioSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async () => {
  const itens = await prisma.itemInventario.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(itens);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = itemInventarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const item = await prisma.itemInventario.create({ data: sanitizarObjeto(parsed.data) });
    return NextResponse.json(item, { status: 201 });
  },
  { nivel: "escrita" }
);
