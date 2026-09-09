import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protegido } from "@/lib/api-handler";
import type { AlertaTipo } from "@/types";

export const GET = protegido(async (request) => {
  const { searchParams } = new URL(request.url);
  const lido = searchParams.get("lido");
  const tipo = searchParams.get("tipo") as AlertaTipo | null;
  const obraId = searchParams.get("obraId");

  const alertas = await prisma.alerta.findMany({
    where: {
      ...(lido !== null ? { lido: lido === "true" } : {}),
      ...(tipo ? { tipo } : {}),
      ...(obraId ? { obraId } : {}),
    },
    include: { obra: { select: { nome: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alertas);
});
