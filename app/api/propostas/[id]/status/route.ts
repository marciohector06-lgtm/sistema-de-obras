import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { propostaStatusSchema } from "@/lib/validations";
import { PROPOSTA_STATUS_LABELS } from "@/lib/propostas";
import { protegido } from "@/lib/api-handler";
import { registrarAuditoria } from "@/lib/audit";

export const PATCH = protegido(
  async (request, contexto, usuario) => {
    const { id } = await contexto.params;
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

    await registrarAuditoria({
      acao: parsed.data.status === "APROVADA" ? "proposta.aprovar" : "proposta.status_alterar",
      entidade: "Proposta",
      entidadeId: id,
      usuario,
      detalhes: { de: atual.status, para: parsed.data.status },
    });

    return NextResponse.json(proposta);
  },
  { nivel: "escrita" }
);
