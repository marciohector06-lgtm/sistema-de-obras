import { NextResponse } from "next/server";
import { executarVerificacaoEmail } from "@/lib/email/verificar";

export async function POST() {
  try {
    const resultado = await executarVerificacaoEmail();
    return NextResponse.json(resultado);
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro);
    return NextResponse.json({ error: mensagem }, { status: 500 });
  }
}
