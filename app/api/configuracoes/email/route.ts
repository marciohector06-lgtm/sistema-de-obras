import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { configuracaoEmailSchema } from "@/lib/validations";
import { criptografar } from "@/lib/crypto";

export async function GET() {
  const config = await prisma.configuracaoEmail.findUnique({ where: { id: "config" } });

  if (!config) {
    return NextResponse.json(null);
  }

  const { senhaCriptografada, ...rest } = config;
  return NextResponse.json({ ...rest, senhaConfigurada: Boolean(senhaCriptografada) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = configuracaoEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { senha, ...rest } = parsed.data;
  const atual = await prisma.configuracaoEmail.findUnique({ where: { id: "config" } });
  const senhaCriptografada = senha ? criptografar(senha) : undefined;

  if (!senhaCriptografada && !atual) {
    return NextResponse.json({ error: "Informe a senha na primeira configuração" }, { status: 400 });
  }

  const config = atual
    ? await prisma.configuracaoEmail.update({
        where: { id: "config" },
        data: { ...rest, ...(senhaCriptografada ? { senhaCriptografada } : {}) },
      })
    : await prisma.configuracaoEmail.create({
        data: { id: "config", ...rest, senhaCriptografada: senhaCriptografada! },
      });

  const { senhaCriptografada: _senha, ...resposta } = config;
  return NextResponse.json({ ...resposta, senhaConfigurada: Boolean(_senha) });
}
