import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propostaSchema } from "@/lib/validations";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const proposta = await prisma.proposta.findUnique({
    where: { id },
    include: {
      cliente: true,
      secoes: { orderBy: { ordem: "asc" }, include: { itens: { orderBy: { ordem: "asc" }, include: { material: true } } } },
      eventos: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
    },
  });

  if (!proposta) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });

  return NextResponse.json(proposta);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = propostaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const atual = await prisma.proposta.findUnique({ where: { id } });
  if (!atual) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });

  const { secoes, ...rest } = parsed.data;

  const proposta = await prisma.$transaction(async (tx) => {
    await tx.propostaSecao.deleteMany({ where: { propostaId: id } });

    for (let secaoIndex = 0; secaoIndex < secoes.length; secaoIndex++) {
      const secao = secoes[secaoIndex];
      const novaSecao = await tx.propostaSecao.create({
        data: { propostaId: id, titulo: secao.titulo, ordem: secaoIndex },
      });

      for (let itemIndex = 0; itemIndex < secao.itens.length; itemIndex++) {
        const item = secao.itens[itemIndex];
        await tx.propostaItem.create({
          data: {
            secaoId: novaSecao.id,
            materialId: item.materialId || undefined,
            descricao: item.descricao,
            unidade: item.unidade,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            ordem: itemIndex,
          },
        });
      }
    }

    const atualizada = await tx.proposta.update({ where: { id }, data: rest });

    await tx.propostaEvento.create({
      data: { propostaId: id, tipo: "EDITADA", mensagem: `Proposta #${atual.numero} editada.` },
    });

    return atualizada;
  });

  return NextResponse.json(proposta);
}
