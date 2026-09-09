import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usuarioUpdateSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { registrarAuditoria } from "@/lib/audit";

export const PATCH = protegido(
  async (request, contexto, usuario) => {
    const { id } = await contexto.params;
    const body = await request.json();
    const parsed = usuarioUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const anterior = await prisma.user.findUnique({ where: { id } });
    if (!anterior) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const atualizado = await prisma.user.update({ where: { id }, data: parsed.data });

    await registrarAuditoria({
      acao: "usuario.alterar",
      entidade: "User",
      entidadeId: id,
      usuario,
      detalhes: { antes: { role: anterior.role, status: anterior.status }, depois: parsed.data },
    });

    return NextResponse.json(atualizado);
  },
  { nivel: "admin" }
);
