"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usuarioConviteSchema, type UsuarioConviteInput, type UsuarioConviteOutput } from "@/lib/validations";

const ROLE_LABELS = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  ENGENHEIRO: "Engenheiro",
  VIEWER: "Visualizador",
};

export function UsuarioConviteModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioConviteInput, unknown, UsuarioConviteOutput>({
    resolver: zodResolver(usuarioConviteSchema),
    defaultValues: { role: "VIEWER" },
  });

  async function onSubmit(data: UsuarioConviteOutput) {
    const res = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      if (res.status === 409) {
        toast.error("Já existe um usuário com esse e-mail");
        return;
      }
      const corpo = await res.json().catch(() => null);
      toast.error(corpo?.error ?? "Não foi possível enviar o convite");
      return;
    }

    toast.success("Convite enviado por e-mail");
    setOpen(false);
    reset({ name: "", email: "", cpf: "", role: "VIEWER" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Convidar usuário
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Input id="cpf" placeholder="000.000.000-00" {...register("cpf")} />
            {errors.cpf && <p className="text-xs text-danger">{errors.cpf.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Perfil</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => ROLE_LABELS[value as keyof typeof ROLE_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Enviar convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
