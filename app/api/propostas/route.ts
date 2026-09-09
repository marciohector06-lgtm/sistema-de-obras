import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propostaSchema } from "@/lib/validations";
import type { PropostaStatus } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as PropostaStatus | null;
  const clienteId = searchParams.get("clienteId");
  const q = searchParams.get("q");

  const propostas = await prisma.proposta.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(clienteId ? { clienteId } : {}),
      ...(q ? { titulo: { contains: q, mode: "insensitive" } } : {}),
    },
    include: {
      cliente: true,
      secoes: { include: { itens: true } },
    },
    orderBy: { numero: "desc" },
  });

  return NextResponse.json(propostas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = propostaSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { secoes, ...rest } = parsed.data;

  const proposta = await prisma.$transaction(async (tx) => {
    const nova = await tx.proposta.create({ data: rest });

    for (let secaoIndex = 0; secaoIndex < secoes.length; secaoIndex++) {
      const secao = secoes[secaoIndex];
      const novaSecao = await tx.propostaSecao.create({
        data: { propostaId: nova.id, titulo: secao.titulo, ordem: secaoIndex },
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

    await tx.propostaEvento.create({
      data: { propostaId: nova.id, tipo: "CRIADA", mensagem: `Proposta #${nova.numero} criada.` },
    });

    return nova;
  });

  return NextResponse.json(proposta, { status: 201 });
}
