import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contratoSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async (request) => {
  const { searchParams } = new URL(request.url);
  const obraId = searchParams.get("obraId");

  const contratos = await prisma.contrato.findMany({
    where: obraId ? { obraId } : undefined,
    include: { obra: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contratos);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = contratoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const contrato = await prisma.contrato.create({ data: sanitizarObjeto(parsed.data) });
    return NextResponse.json(contrato, { status: 201 });
  },
  { nivel: "escrita" }
);
