import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obraSchema } from "@/lib/validations";
import { verificarAlertasObra } from "@/lib/alertas";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";
import { registrarAuditoria } from "@/lib/audit";

export const GET = protegido(async (_request, contexto) => {
  const { id } = await contexto.params;

  const obra = await prisma.obra.findUnique({
    where: { id },
    include: {
      cliente: true,
      gastos: { orderBy: { data: "desc" } },
    },
  });

  if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

  return NextResponse.json(obra);
});

export const PATCH = protegido(
  async (request, contexto) => {
    const { id } = await contexto.params;
    const body = await request.json();
    const parsed = obraSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { clienteId, ...rest } = sanitizarObjeto(parsed.data);

    const obra = await prisma.obra.update({
      where: { id },
      data: {
        ...rest,
        ...(clienteId !== undefined ? { cliente: clienteId ? { connect: { id: clienteId } } : { disconnect: true } } : {}),
      },
    });

    await verificarAlertasObra(obra.id);

    return NextResponse.json(obra);
  },
  { nivel: "escrita" }
);

export const DELETE = protegido(
  async (_request, contexto, usuario) => {
    const { id } = await contexto.params;

    const obra = await prisma.obra.findUnique({ where: { id }, select: { nome: true } });
    if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

    await prisma.obra.delete({ where: { id } });

    await registrarAuditoria({
      acao: "obra.deletar",
      entidade: "Obra",
      entidadeId: id,
      usuario,
      detalhes: { nome: obra.nome },
    });

    return NextResponse.json({ ok: true });
  },
  { nivel: "admin" }
);
