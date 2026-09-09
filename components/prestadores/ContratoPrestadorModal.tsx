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
import { contratoPrestadorSchema, type ContratoPrestadorInput, type ContratoPrestadorOutput } from "@/lib/validations";

interface ContratoPrestadorModalProps {
  prestadores: { id: string; nome: string }[];
}

export function ContratoPrestadorModal({ prestadores }: ContratoPrestadorModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContratoPrestadorInput, unknown, ContratoPrestadorOutput>({
    resolver: zodResolver(contratoPrestadorSchema),
    defaultValues: { prestadorId: "", titulo: "" },
  });

  async function onSubmit(data: ContratoPrestadorOutput) {
    const res = await fetch("/api/contratos-prestador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível cadastrar o contrato");
      return;
    }

    toast.success("Contrato cadastrado");
    setOpen(false);
    reset({ titulo: "", prestadorId: "", valor: undefined, dataAssin: undefined });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Adicionar Contrato
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo contrato de prestador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Prestador</Label>
            <Controller
              control={control}
              name="prestadorId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o prestador">
                      {(v: string) => (v ? prestadores.find((p) => p.id === v)?.nome : "Selecione o prestador")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {prestadores.map((prestador) => (
                      <SelectItem key={prestador.id} value={prestador.id}>
                        {prestador.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.prestadorId && <p className="text-xs text-danger">{errors.prestadorId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" {...register("titulo")} />
            {errors.titulo && <p className="text-xs text-danger">{errors.titulo.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" step="0.01" {...register("valor")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataAssin">Data de assinatura</Label>
              <Controller
                control={control}
                name="dataAssin"
                render={({ field }) => (
                  <Input
                    id="dataAssin"
                    type="date"
                    value={
                      field.value
                        ? new Date(field.value as string | number | Date).toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                )}
              />
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
