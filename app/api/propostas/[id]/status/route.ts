import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propostaStatusSchema } from "@/lib/validations";
import { PROPOSTA_STATUS_LABELS } from "@/lib/propostas";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = propostaStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const atual = await prisma.proposta.findUnique({ where: { id } });
  if (!atual) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });

  const [proposta] = await prisma.$transaction([
    prisma.proposta.update({ where: { id }, data: { status: parsed.data.status } }),
    prisma.propostaEvento.create({
      data: {
        propostaId: id,
        tipo: "STATUS_ALTERADO",
        mensagem: `Status alterado de "${PROPOSTA_STATUS_LABELS[atual.status]}" para "${PROPOSTA_STATUS_LABELS[parsed.data.status]}".`,
      },
    }),
  ]);

  return NextResponse.json(proposta);
}
