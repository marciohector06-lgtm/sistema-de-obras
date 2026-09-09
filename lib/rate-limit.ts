import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redisConfigurado = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

function criarLimiteDistribuido(limite: number, janela: `${number} ${"s" | "m" | "h"}`) {
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limite, janela),
    prefix: "sistema-obras",
  });
}

const limitesLocais = new Map<string, { contagem: number; expiraEm: number }>();

function permitidoLocalmente(chave: string, limite: number, janelaMs: number): boolean {
  const agora = Date.now();
  const registro = limitesLocais.get(chave);

  if (!registro || registro.expiraEm < agora) {
    limitesLocais.set(chave, { contagem: 1, expiraEm: agora + janelaMs });
    return true;
  }

  if (registro.contagem >= limite) return false;

  registro.contagem += 1;
  return true;
}

export interface OpcoesRateLimit {
  limite?: number;
  janelaMs?: number;
}

export async function aplicarRateLimit(
  identificador: string,
  opcoes: OpcoesRateLimit = {}
): Promise<NextResponse | null> {
  const limite = opcoes.limite ?? 60;
  const janelaMs = opcoes.janelaMs ?? 60_000;

  if (redisConfigurado) {
    const janelaUpstash = `${Math.round(janelaMs / 1000)} s` as const;
    const limitador = criarLimiteDistribuido(limite, janelaUpstash);
    const { success } = await limitador.limit(identificador);

    if (!success) {
      return NextResponse.json(
        { error: "Muitas requisições, tente novamente em instantes" },
        { status: 429 }
      );
    }
    return null;
  }

  if (!permitidoLocalmente(identificador, limite, janelaMs)) {
    return NextResponse.json(
      { error: "Muitas requisições, tente novamente em instantes" },
      { status: 429 }
    );
  }

  return null;
}

export function identificadorRequisicao(request: Request, sufixo?: string): string {
  const encaminhado = request.headers.get("x-forwarded-for");
  const ip = encaminhado ? encaminhado.split(",")[0].trim() : "local";
  const rota = new URL(request.url).pathname;
  return sufixo ? `${ip}:${rota}:${sufixo}` : `${ip}:${rota}`;
}
