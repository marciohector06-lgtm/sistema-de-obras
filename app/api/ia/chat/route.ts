import { NextResponse } from "next/server";
import { z } from "zod";
import { gerarConversaIA, isGeminiConfigurado } from "@/lib/ia/gemini";
import { montarContextoPortfolio } from "@/lib/ia/contexto";
import { protegido } from "@/lib/api-handler";
import { sanitizarTexto } from "@/lib/sanitize";

const chatSchema = z.object({
  mensagens: z
    .array(z.object({ role: z.enum(["user", "model"]), texto: z.string().min(1) }))
    .min(1),
});

export const POST = protegido(
  async (request) => {
    if (!isGeminiConfigurado()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY não configurada. Peça ao administrador para configurar a chave nas variáveis de ambiente." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const mensagens = parsed.data.mensagens.map((m) => ({ ...m, texto: sanitizarTexto(m.texto) }));
    const contexto = await montarContextoPortfolio();

    const resposta = await gerarConversaIA({
      mensagens,
      systemInstruction: `Você é o assistente de IA do sistema de gestão de obras da Fornax Engenharia. Responda sempre em português, de forma direta e objetiva, usando os dados reais do portfólio abaixo para embasar suas respostas. Se a pergunta não puder ser respondida com esses dados, diga isso claramente em vez de inventar números.\n\n${contexto}`,
    });

    if (!resposta) {
      return NextResponse.json({ error: "Não foi possível gerar uma resposta agora." }, { status: 502 });
    }

    return NextResponse.json({ resposta });
  },
  { nivel: "leitura", rateLimit: { limite: 15, janelaMs: 60_000 } }
);
