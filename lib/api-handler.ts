import { NextResponse, type NextRequest } from "next/server";
import { aplicarRateLimit, identificadorRequisicao, type OpcoesRateLimit } from "@/lib/rate-limit";
import { exigirAdmin, exigirEscrita, exigirUsuarioAtivo, type SessionUser } from "@/lib/auth";

type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler = (request: NextRequest, contexto: RouteContext, usuario: SessionUser) => Promise<NextResponse>;

export interface OpcoesProtecao {
  nivel?: "leitura" | "escrita" | "admin";
  rateLimit?: OpcoesRateLimit;
}

export function protegido(handler: RouteHandler, opcoes: OpcoesProtecao = {}) {
  return async (request: NextRequest, contexto: RouteContext) => {
    const limite = await aplicarRateLimit(
      identificadorRequisicao(request),
      opcoes.rateLimit
    );
    if (limite) return limite;

    const nivel = opcoes.nivel ?? "leitura";
    const guard =
      nivel === "admin"
        ? await exigirAdmin()
        : nivel === "escrita"
          ? await exigirEscrita()
          : await exigirUsuarioAtivo();

    if ("erro" in guard) return guard.erro;

    return handler(request, contexto, guard.usuario);
  };
}
