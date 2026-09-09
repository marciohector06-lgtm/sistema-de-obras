"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PrevisaoRefreshButton({ obraId }: { obraId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function atualizar() {
    setLoading(true);
    const res = await fetch(`/api/obras/${obraId}/previsao`, { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      toast.error("Não foi possível atualizar a previsão");
      return;
    }

    toast.success("Previsão atualizada");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={atualizar} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
      Atualizar Previsão
    </Button>
  );
}
