import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { materialSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async (request) => {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const materiais = await prisma.material.findMany({
    where: q ? { descricao: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { descricao: "asc" },
  });

  return NextResponse.json(materiais);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = materialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const material = await prisma.material.create({ data: sanitizarObjeto(parsed.data) });

    return NextResponse.json(material, { status: 201 });
  },
  { nivel: "escrita" }
);
