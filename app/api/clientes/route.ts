import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations";

export async function GET() {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(clientes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = clienteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cliente = await prisma.cliente.create({ data: parsed.data });
  return NextResponse.json(cliente, { status: 201 });
}
