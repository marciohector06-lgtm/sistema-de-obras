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
import { movimentoFinanceiroSchema, type MovimentoFinanceiroInput, type MovimentoFinanceiroOutput } from "@/lib/validations";
import { MOVIMENTO_TIPO_LABELS } from "@/lib/prestadores";

interface MovimentoModalProps {
  obras: { id: string; nome: string }[];
  prestadores: { id: string; nome: string }[];
}

export function MovimentoModal({ obras, prestadores }: MovimentoModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MovimentoFinanceiroInput, unknown, MovimentoFinanceiroOutput>({
    resolver: zodResolver(movimentoFinanceiroSchema),
    defaultValues: { tipo: "SAIDA", data: new Date(), obraId: "", prestadorId: "", categoria: "" },
  });

  async function onSubmit(data: MovimentoFinanceiroOutput) {
    const res = await fetch("/api/movimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível registrar o movimento");
      return;
    }

    toast.success("Movimento registrado");
    setOpen(false);
    reset({ tipo: "SAIDA", data: new Date(), obraId: "", prestadorId: "", categoria: "", descricao: "", valor: undefined });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Novo Movimento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo movimento financeiro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => MOVIMENTO_TIPO_LABELS[value as keyof typeof MOVIMENTO_TIPO_LABELS]}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MOVIMENTO_TIPO_LABELS).map(([value, label]) => (
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={2} {...register("descricao")} />
            {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" step="0.01" {...register("valor")} />
              {errors.valor && <p className="text-xs text-danger">{errors.valor.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoria</Label>
              <Input id="categoria" {...register("categoria")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Obra (opcional)</Label>
              <Controller
                control={control}
                name="obraId"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nenhuma">
                        {(v: string) => (v ? obras.find((o) => o.id === v)?.nome : "Nenhuma")}
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
            </div>

            <div className="space-y-1.5">
              <Label>Prestador (opcional)</Label>
              <Controller
                control={control}
                name="prestadorId"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nenhum">
                        {(v: string) => (v ? prestadores.find((p) => p.id === v)?.nome : "Nenhum")}
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
