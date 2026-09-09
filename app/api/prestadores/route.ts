import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prestadorSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async (request) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const prestadores = await prisma.prestador.findMany({
    where: q ? { nome: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(prestadores);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = prestadorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const prestador = await prisma.prestador.create({ data: sanitizarObjeto(parsed.data) });

    return NextResponse.json(prestador, { status: 201 });
  },
  { nivel: "escrita" }
);
