import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { prestadorSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  const prestadores = await prisma.prestador.findMany({
    where: q ? { nome: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(prestadores);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = prestadorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prestador = await prisma.prestador.create({ data: parsed.data });

  return NextResponse.json(prestador, { status: 201 });
}
