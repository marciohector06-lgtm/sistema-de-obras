"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function VerificarEmailButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function verificar() {
    setLoading(true);
    const res = await fetch("/api/configuracoes/email/verificar", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error ?? "Não foi possível verificar o e-mail agora");
      return;
    }

    if (!data.executada) {
      toast.info("Automação inativa ou não configurada");
      return;
    }

    toast.success(`Verificação concluída: ${data.processadas} item(ns) processado(s)`);
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={verificar} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Verificar Agora
    </Button>
  );
}
