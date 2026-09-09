"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
            <Zap className="size-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
            <p className="text-xs text-white/50">Gestão de Obras</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-navy-border bg-navy-hover p-6"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/70">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@fornax.com.br"
              className="border-white/10 bg-navy text-white placeholder:text-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/70">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border-white/10 bg-navy text-white placeholder:text-white/30"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="animate-spin" />}
            Entrar
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-white/40">
          Ainda não tem acesso?{" "}
          <a href="/registro" className="font-medium text-primary-lt hover:underline">
            Solicitar cadastro
          </a>
        </p>
      </div>
    </div>
  );
}
