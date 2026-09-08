"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { PackageMinus, Loader2 } from "lucide-react";
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

export interface EstoqueOption {
  id: string;
  label: string; // "Item - Obra (restante: X unidade)"
  restante: number;
}

interface BaixaEstoqueModalProps {
  opcoes: EstoqueOption[];
}

interface FormValues {
  obraInventarioId: string;
  qtdUsada: string;
}

// Modal para registrar a baixa (uso) de um item do estoque em uma obra específica
export function BaixaEstoqueModal({ opcoes }: BaixaEstoqueModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({ defaultValues: { obraInventarioId: "", qtdUsada: "" } });

  const selecionado = opcoes.find((o) => o.id === watch("obraInventarioId"));

  async function onSubmit(data: FormValues) {
    const res = await fetch("/api/inventario/baixa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error ?? "Não foi possível registrar a baixa");
      return;
    }

    toast.success("Baixa registrada");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <PackageMinus /> Registrar Baixa
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar baixa de estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Item em estoque</Label>
            <Controller
              control={control}
              name="obraInventarioId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o item">
                      {(v: string) => (v ? opcoes.find((o) => o.id === v)?.label : "Selecione o item")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {opcoes.map((opcao) => (
                      <SelectItem key={opcao.id} value={opcao.id}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="qtdUsada">Quantidade usada</Label>
            <Input
              id="qtdUsada"
              type="number"
              max={selecionado?.restante}
              {...register("qtdUsada", { required: true })}
            />
            {selecionado && (
              <p className="text-xs text-text-muted">Restante em estoque: {selecionado.restante}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Confirmar baixa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
