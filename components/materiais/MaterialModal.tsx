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
import { materialSchema, type MaterialInput, type MaterialOutput } from "@/lib/validations";

export function MaterialModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterialInput, unknown, MaterialOutput>({
    resolver: zodResolver(materialSchema),
  });

  async function onSubmit(data: MaterialOutput) {
    const res = await fetch("/api/materiais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível cadastrar o material");
      return;
    }

    toast.success("Material cadastrado");
    setOpen(false);
    reset({ descricao: "", unidade: "", preco: undefined, ncm: "", origem: "" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Novo Material
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="unidade">Unidade</Label>
              <Input id="unidade" placeholder="kg, m², unidade..." {...register("unidade")} />
              {errors.unidade && <p className="text-xs text-danger">{errors.unidade.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input id="preco" type="number" step="0.01" {...register("preco")} />
              {errors.preco && <p className="text-xs text-danger">{errors.preco.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ncm">NCM</Label>
              <Input id="ncm" {...register("ncm")} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="origem">Origem</Label>
              <Input id="origem" {...register("origem")} />
            </div>
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
