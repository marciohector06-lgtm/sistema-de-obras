import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obraInventarioSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async (request) => {
  const { searchParams } = new URL(request.url);
  const local = searchParams.get("local");

  const itens = await prisma.obraInventario.findMany({
    where: local ? { local } : undefined,
    include: { item: true, obra: { select: { nome: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(itens);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = obraInventarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { obraId, itemId, qtdComprada, local } = sanitizarObjeto(parsed.data);
    const localResolvido = local || "Depósito Central";

    const existente = await prisma.obraInventario.findUnique({
      where: { obraId_itemId: { obraId, itemId } },
    });

    const obraInventario = existente
      ? await prisma.obraInventario.update({
          where: { id: existente.id },
          data: { qtdComprada: existente.qtdComprada + qtdComprada, local: local || existente.local },
        })
      : await prisma.obraInventario.create({
          data: { obraId, itemId, qtdComprada, local: localResolvido },
        });

    return NextResponse.json(obraInventario, { status: 201 });
  },
  { nivel: "escrita" }
);
