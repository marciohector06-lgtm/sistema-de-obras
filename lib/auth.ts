import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import type { Role, UserStatus } from "@/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const usuario = await prisma.user.findUnique({ where: { email: user.email } });
  if (usuario) return usuario;

  // Primeiro acesso após o autocadastro via Supabase Auth - ainda não existe a linha em User
  const nome = (user.user_metadata?.name as string | undefined) || user.email;
  try {
    return await prisma.user.create({ data: { name: nome, email: user.email } });
  } catch {
    return prisma.user.findUnique({ where: { email: user.email } });
  }
}

export type GuardResult = { usuario: SessionUser } | { erro: NextResponse };

export async function exigirUsuarioAtivo(): Promise<GuardResult> {
  const usuario = await getSessionUser();

  if (!usuario) {
    return { erro: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };
  }

  if (usuario.status !== "ACTIVE") {
    return { erro: NextResponse.json({ error: "Usuário sem acesso liberado" }, { status: 403 }) };
  }

  return { usuario };
}

export async function exigirEscrita(): Promise<GuardResult> {
  const resultado = await exigirUsuarioAtivo();
  if ("erro" in resultado) return resultado;

  if (resultado.usuario.role === "VIEWER") {
    return { erro: NextResponse.json({ error: "Perfil sem permissão de escrita" }, { status: 403 }) };
  }

  return resultado;
}

export async function exigirAdmin(): Promise<GuardResult> {
  const resultado = await exigirUsuarioAtivo();
  if ("erro" in resultado) return resultado;

  if (resultado.usuario.role !== "ADMIN") {
    return { erro: NextResponse.json({ error: "Apenas administradores" }, { status: 403 }) };
  }

  return resultado;
}
