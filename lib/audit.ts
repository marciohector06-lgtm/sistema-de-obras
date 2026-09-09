import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

export async function registrarAuditoria(params: {
  acao: string;
  entidade: string;
  entidadeId: string;
  usuario: SessionUser | null;
  detalhes?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      acao: params.acao,
      entidade: params.entidade,
      entidadeId: params.entidadeId,
      userId: params.usuario?.id,
      userEmail: params.usuario?.email,
      detalhes: params.detalhes as Prisma.InputJsonValue | undefined,
    },
  });
}
