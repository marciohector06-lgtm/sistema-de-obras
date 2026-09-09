import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pagamentoStatusSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";

export const PATCH = protegido(
  async (request, contexto) => {
    const { id } = await contexto.params;
    const body = await request.json();
    const parsed = pagamentoStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { status } = parsed.data;

    const pagamento = await prisma.pagamento.update({
      where: { id },
      data: {
        status,
        dataPagamento: status === "EFETUADO" ? new Date() : null,
      },
    });

    return NextResponse.json(pagamento);
  },
  { nivel: "escrita" }
);
