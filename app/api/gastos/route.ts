import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gastoSchema } from "@/lib/validations";
import { calcProgresso } from "@/lib/utils";
import { verificarAlertasObra } from "@/lib/alertas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = gastoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { obraId, ...rest } = parsed.data;

  const obra = await prisma.obra.findUnique({ where: { id: obraId } });
  if (!obra) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

  const [gasto] = await prisma.$transaction(async (tx) => {
    const novoGasto = await tx.gasto.create({ data: { obraId, ...rest } });

    const agregado = await tx.gasto.aggregate({
      where: { obraId },
      _sum: { valor: true },
    });

    const gastoTotal = Number(agregado._sum.valor ?? 0);
    const progresso = calcProgresso(gastoTotal, Number(obra.valorContrato));

    await tx.obra.update({ where: { id: obraId }, data: { progresso } });

    return [novoGasto];
  });

  await verificarAlertasObra(obraId);

  return NextResponse.json(gasto, { status: 201 });
}
