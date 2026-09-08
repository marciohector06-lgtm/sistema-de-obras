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
import { Textarea } from "@/components/ui/textarea";
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
import { gastoSchema, type GastoInput, type GastoOutput } from "@/lib/validations";
import { GASTO_CATEGORIA_LABELS as CATEGORIA_LABELS } from "@/lib/obra";

// Modal para lançar um novo gasto em uma obra
export function GastoModal({ obraId }: { obraId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GastoInput, unknown, GastoOutput>({
    resolver: zodResolver(gastoSchema),
    defaultValues: { obraId, categoria: "MATERIAL", data: new Date() },
  });

  async function onSubmit(data: GastoOutput) {
    const res = await fetch("/api/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível registrar o gasto");
      return;
    }

    toast.success("Gasto registrado");
    setOpen(false);
    reset({ obraId, categoria: "MATERIAL", data: new Date(), descricao: "", valor: undefined });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Adicionar Gasto
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={2} {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => CATEGORIA_LABELS[value as keyof typeof CATEGORIA_LABELS]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" step="0.01" {...register("valor")} />
              {errors.valor && <p className="text-xs text-danger">{errors.valor.message}</p>}
            </div>
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
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              )}
            />
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
