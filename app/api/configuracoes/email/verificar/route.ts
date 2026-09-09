import { NextResponse } from "next/server";
import { executarVerificacaoEmail } from "@/lib/email/verificar";
import { protegido } from "@/lib/api-handler";

export const POST = protegido(
  async () => {
    try {
      const resultado = await executarVerificacaoEmail();
      return NextResponse.json(resultado);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : String(erro);
      return NextResponse.json({ error: mensagem }, { status: 500 });
    }
  },
  { nivel: "admin", rateLimit: { limite: 5, janelaMs: 60_000 } }
);
