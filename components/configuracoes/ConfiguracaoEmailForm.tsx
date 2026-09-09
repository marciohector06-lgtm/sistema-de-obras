"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { configuracaoEmailSchema, type ConfiguracaoEmailInput, type ConfiguracaoEmailOutput } from "@/lib/validations";

interface ConfiguracaoEmailFormProps {
  configuracaoAtual: {
    host: string;
    porta: number;
    usuario: string;
    usarSsl: boolean;
    ativo: boolean;
  } | null;
}

export function ConfiguracaoEmailForm({ configuracaoAtual }: ConfiguracaoEmailFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ConfiguracaoEmailInput, unknown, ConfiguracaoEmailOutput>({
    resolver: zodResolver(configuracaoEmailSchema),
    defaultValues: {
      host: configuracaoAtual?.host ?? "",
      porta: configuracaoAtual?.porta ?? 993,
      usuario: configuracaoAtual?.usuario ?? "",
      senha: "",
      usarSsl: configuracaoAtual?.usarSsl ?? true,
      ativo: configuracaoAtual?.ativo ?? false,
    },
  });

  async function onSubmit(data: ConfiguracaoEmailOutput) {
    const res = await fetch("/api/configuracoes/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível salvar a configuração");
      return;
    }

    toast.success("Configuração salva");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="host">Host IMAP</Label>
          <Input id="host" placeholder="imap.gmail.com" {...register("host")} />
          {errors.host && <p className="text-xs text-danger">{errors.host.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="porta">Porta</Label>
          <Input id="porta" type="number" {...register("porta")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="usuario">Usuário / E-mail</Label>
        <Input id="usuario" {...register("usuario")} />
        {errors.usuario && <p className="text-xs text-danger">{errors.usuario.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          type="password"
          placeholder={configuracaoAtual ? "•••••••• (deixe em branco para manter a atual)" : ""}
          {...register("senha")}
        />
        {errors.senha && <p className="text-xs text-danger">{errors.senha.message}</p>}
      </div>

      <div className="flex flex-wrap gap-8">
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="usarSsl"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label>Usar SSL/TLS</Label>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="ativo"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label>Automação ativa (cron + verificação)</Label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          Salvar
        </Button>
      </div>
    </form>
  );
}
