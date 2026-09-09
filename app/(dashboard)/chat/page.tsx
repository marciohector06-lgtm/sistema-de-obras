import { PageHeader } from "@/components/shared/PageHeader";
import { AlertBanner } from "@/components/shared/AlertBanner";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { isGeminiConfigurado } from "@/lib/ia/gemini";

export const dynamic = "force-dynamic";

export default function ChatPage() {
  const configurado = isGeminiConfigurado();

  return (
    <div>
      <PageHeader title="Chat IA" breadcrumbs={[{ label: "Chat IA" }]} />

      {!configurado && (
        <AlertBanner
          className="mb-4"
          variant="warning"
          title="Gemini não configurado"
          description="Defina a variável GEMINI_API_KEY no ambiente para habilitar o chat e as previsões de custo com IA."
        />
      )}

      <ChatWindow disponivel={configurado} />
    </div>
  );
}
