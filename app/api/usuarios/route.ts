import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { usuarioConviteSchema } from "@/lib/validations";
import { protegido } from "@/lib/api-handler";
import { sanitizarObjeto } from "@/lib/sanitize";
import { registrarAuditoria } from "@/lib/audit";

export const POST = protegido(
  async (request, _contexto, usuario) => {
    const body = await request.json();
    const parsed = usuarioConviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, cpf, role } = sanitizarObjeto(parsed.data);

    const existente = await prisma.user.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json({ error: "Já existe um usuário com esse e-mail" }, { status: 409 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !chave) {
      return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
    }

    const supabaseAdmin = createClient(url, chave, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name },
    });
    if (error) {
      console.error("Falha ao enviar convite via Supabase Auth:", error.message);
      return NextResponse.json({ error: `Não foi possível enviar o convite: ${error.message}` }, { status: 502 });
    }

    const novoUsuario = await prisma.user.create({
      data: { name, email, cpf, role, status: "PENDING" },
    });

    await registrarAuditoria({
      acao: "usuario.convidar",
      entidade: "User",
      entidadeId: novoUsuario.id,
      usuario,
      detalhes: { email, role },
    });

    return NextResponse.json(novoUsuario, { status: 201 });
  },
  { nivel: "admin" }
);
