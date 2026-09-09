"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Undo2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function AlertaLidoButton({ id, lido }: { id: string; lido: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function alternar() {
    setLoading(true);
    const res = await fetch(`/api/alertas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lido: !lido }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("Não foi possível atualizar o alerta");
      return;
    }

    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={alternar} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : lido ? <Undo2 /> : <Check />}
      {lido ? "Marcar não lido" : "Marcar lido"}
    </Button>
  );
}
