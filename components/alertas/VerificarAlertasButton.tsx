"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function VerificarAlertasButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function verificar() {
    setLoading(true);
    const res = await fetch("/api/alertas/verificar", { method: "POST" });
    setLoading(false);

    if (!res.ok) {
      toast.error("Não foi possível verificar os alertas agora");
      return;
    }

    toast.success("Alertas verificados");
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={verificar} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Verificar Agora
    </Button>
  );
}
