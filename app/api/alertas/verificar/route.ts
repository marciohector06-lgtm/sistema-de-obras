import { NextResponse } from "next/server";
import { verificarTodasObras } from "@/lib/alertas";
import { protegido } from "@/lib/api-handler";

export const POST = protegido(
  async () => {
    await verificarTodasObras();
    return NextResponse.json({ ok: true });
  },
  { nivel: "escrita", rateLimit: { limite: 5, janelaMs: 60_000 } }
);
