"use client";

import { useState } from "react";
import { Zap, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

export default function RegistroPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      toast.error("Não foi possível concluir o cadastro", { description: error.message });
      setLoading(false);
      return;
    }

    setEnviado(true);
    setLoading(false);
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

        {enviado ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-navy-border bg-navy-hover p-6 text-center">
            <CheckCircle2 className="size-8 text-success" />
            <p className="text-sm font-medium text-white">Cadastro enviado com sucesso</p>
            <p className="text-xs text-white/60">
              Sua conta ficará pendente até que um administrador aprove o acesso.
            </p>
            <a href="/login" className="text-xs font-medium text-primary-lt hover:underline">
              Voltar para o login
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-navy-border bg-navy-hover p-6"
          >
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-white/70">
                Nome completo
              </Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="border-white/10 bg-navy text-white placeholder:text-white/30"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-white/10 bg-navy text-white placeholder:text-white/30"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="animate-spin" />}
              Solicitar cadastro
            </Button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-white/40">
          Já tem uma conta?{" "}
          <a href="/login" className="font-medium text-primary-lt hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
}
