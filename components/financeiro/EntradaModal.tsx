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
import { entradaSchema, type EntradaInput, type EntradaOutput } from "@/lib/validations";

interface EntradaModalProps {
  obras: { id: string; nome: string }[];
}

// Modal para lançar uma nova entrada (receita recebida do cliente) em uma obra
export function EntradaModal({ obras }: EntradaModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntradaInput, unknown, EntradaOutput>({
    resolver: zodResolver(entradaSchema),
    defaultValues: { data: new Date(), obraId: "", descricao: "" },
  });

  async function onSubmit(data: EntradaOutput) {
    const res = await fetch("/api/entradas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível registrar a entrada");
      return;
    }

    toast.success("Entrada registrada");
    setOpen(false);
    reset({ data: new Date(), descricao: "", valor: undefined, obraId: "" });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Adicionar Nova Entrada
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar entrada</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Obra</Label>
            <Controller
              control={control}
              name="obraId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a obra">
                      {(v: string) => (v ? obras.find((o) => o.id === v)?.nome : "Selecione a obra")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.obraId && <p className="text-xs text-danger">{errors.obraId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" step="0.01" {...register("valor")} />
              {errors.valor && <p className="text-xs text-danger">{errors.valor.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Controller
                control={control}
                name="data"
                render={({ field }) => (
                  <Input
                    id="data"
                    type="date"
                    value={
                      field.value
                        ? new Date(field.value as string | number | Date).toISOString().slice(0, 10)
                        : new Date().toISOString().slice(0, 10)
                    }
                    onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))}
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
