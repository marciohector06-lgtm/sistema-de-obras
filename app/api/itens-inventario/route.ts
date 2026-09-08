import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { itemInventarioSchema } from "@/lib/validations";

export async function GET() {
  const itens = await prisma.itemInventario.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(itens);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = itemInventarioSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await prisma.itemInventario.create({ data: parsed.data });
  return NextResponse.json(item, { status: 201 });
}
