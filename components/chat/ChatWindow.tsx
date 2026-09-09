"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Mensagem {
  role: "user" | "model";
  texto: string;
}

const SUGESTOES = [
  "Quais obras estão com maior risco agora?",
  "Qual obra tem mais chance de estourar o orçamento?",
  "Resuma os alertas pendentes",
];

export function ChatWindow({ disponivel }: { disponivel: boolean }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(mensagem: string) {
    if (!mensagem.trim() || enviando || !disponivel) return;

    const novasMensagens: Mensagem[] = [...mensagens, { role: "user", texto: mensagem.trim() }];
    setMensagens(novasMensagens);
    setTexto("");
    setEnviando(true);

    const res = await fetch("/api/ia/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagens: novasMensagens }),
    });

    const data = await res.json();
    setEnviando(false);

    if (!res.ok) {
      toast.error(data.error ?? "Não foi possível obter uma resposta");
      return;
    }

    setMensagens([...novasMensagens, { role: "model", texto: data.resposta }]);
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <div className="flex-1 overflow-y-auto p-5">
        {mensagens.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Pergunte sobre o portfólio de obras</p>
              <p className="text-xs text-text-secondary">Respostas baseadas nos dados reais de obras, gastos e alertas</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((sugestao) => (
                <button
                  key={sugestao}
                  type="button"
                  disabled={!disponivel}
                  onClick={() => enviar(sugestao)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary hover:bg-muted disabled:opacity-50"
                >
                  {sugestao}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mensagens.map((mensagem, i) => (
              <div key={i} className={cn("flex", mensagem.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm",
                    mensagem.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-text-primary"
                  )}
                >
                  {mensagem.texto}
                </div>
              </div>
            ))}
            {enviando && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3.5 py-2.5 text-sm text-text-secondary">
                  <Loader2 className="size-3.5 animate-spin" /> Pensando...
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar(texto);
            }
          }}
          placeholder={disponivel ? "Escreva sua pergunta..." : "Configure o GEMINI_API_KEY para conversar"}
          disabled={!disponivel}
          rows={1}
          className="min-h-9 resize-none"
        />
        <Button type="submit" disabled={!disponivel || enviando || !texto.trim()} size="icon">
          {enviando ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </div>
  );
}
