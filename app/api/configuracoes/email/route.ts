import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { configuracaoEmailSchema } from "@/lib/validations";
import { criptografar } from "@/lib/crypto";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";

export const GET = protegido(
  async () => {
    const config = await prisma.configuracaoEmail.findUnique({ where: { id: "config" } });

    if (!config) {
      return NextResponse.json(null);
    }

    const { senhaCriptografada, ...rest } = config;
    return NextResponse.json({ ...rest, senhaConfigurada: Boolean(senhaCriptografada) });
  },
  { nivel: "admin" }
);

export const POST = protegido(
  async (request) => {
    const body = await request.json();
    const parsed = configuracaoEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { senha, ...restNaoSanitizado } = parsed.data;
    const rest = sanitizarObjeto(restNaoSanitizado);
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
  },
  { nivel: "admin" }
);
