import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(async () => {
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(clientes);
});

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = clienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({ data: sanitizarObjeto(parsed.data) });
    return NextResponse.json(cliente, { status: 201 });
  },
  { nivel: "escrita" }
);
