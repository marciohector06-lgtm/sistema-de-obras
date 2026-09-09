import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { baixaEstoqueSchema } from "@/lib/validations";
import { verificarAlertasObra } from "@/lib/alertas";
import { protegido } from "@/lib/api-handler";
import { registrarAuditoria } from "@/lib/audit";

export const POST = protegido(
  async (request, _contexto, usuario) => {
    const body = await request.json();
    const parsed = baixaEstoqueSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { obraInventarioId, qtdUsada } = parsed.data;

    const registro = await prisma.obraInventario.findUnique({ where: { id: obraInventarioId } });
    if (!registro) return NextResponse.json({ error: "Registro não encontrado" }, { status: 404 });

    const restante = registro.qtdComprada - registro.qtdUsada;
    if (qtdUsada > restante) {
      return NextResponse.json(
        { error: `Quantidade maior que o estoque restante (${restante})` },
        { status: 400 }
      );
    }

    const atualizado = await prisma.obraInventario.update({
      where: { id: obraInventarioId },
      data: { qtdUsada: registro.qtdUsada + qtdUsada },
    });

    await verificarAlertasObra(registro.obraId);

    await registrarAuditoria({
      acao: "estoque.mover",
      entidade: "ObraInventario",
      entidadeId: obraInventarioId,
      usuario,
      detalhes: { qtdUsada, restanteAnterior: restante },
    });

    return NextResponse.json(atualizado);
  },
  { nivel: "escrita" }
);
