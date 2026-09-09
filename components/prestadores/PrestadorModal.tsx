"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { prestadorSchema, type PrestadorInput, type PrestadorOutput } from "@/lib/validations";

export function PrestadorModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PrestadorInput, unknown, PrestadorOutput>({
    resolver: zodResolver(prestadorSchema),
  });

  async function onSubmit(data: PrestadorOutput) {
    const res = await fetch("/api/prestadores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível cadastrar o prestador");
      return;
    }

    toast.success("Prestador cadastrado");
    setOpen(false);
    reset({ nome: "", documento: "", chavePix: "", categoria: "" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Novo Prestador
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo prestador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="documento">CPF/CNPJ</Label>
              <Input id="documento" {...register("documento")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Input id="categoria" placeholder="Fornecedor, Mão de obra..." {...register("categoria")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chavePix">Chave Pix</Label>
            <Input id="chavePix" {...register("chavePix")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
