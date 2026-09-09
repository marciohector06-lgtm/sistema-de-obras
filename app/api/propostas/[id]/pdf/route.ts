import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gerarPropostaPdf } from "@/lib/pdf/proposta-pdf";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const proposta = await prisma.proposta.findUnique({
    where: { id },
    include: {
      cliente: true,
      secoes: { orderBy: { ordem: "asc" }, include: { itens: { orderBy: { ordem: "asc" } } } },
    },
  });

  if (!proposta) return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });

  const buffer = await gerarPropostaPdf({
    numero: proposta.numero,
    titulo: proposta.titulo,
    status: proposta.status,
    clienteNome: proposta.cliente.nome,
    createdAt: proposta.createdAt,
    bdi: Number(proposta.bdi),
    impostos: Number(proposta.impostos),
    observacao: proposta.observacao,
    secoes: proposta.secoes.map((secao) => ({
      titulo: secao.titulo,
      itens: secao.itens.map((item) => ({
        descricao: item.descricao,
        unidade: item.unidade,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
      })),
    })),
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="proposta-${proposta.numero}.pdf"`,
    },
  });
}
