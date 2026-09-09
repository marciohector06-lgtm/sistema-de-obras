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
import { pagamentoSchema, type PagamentoInput, type PagamentoOutput } from "@/lib/validations";

interface PagamentoModalProps {
  obras: { id: string; nome: string }[];
  prestadores: { id: string; nome: string }[];
}

// Modal para cadastrar um novo pagamento (agendado para uma data de vencimento)
export function PagamentoModal({ obras, prestadores }: PagamentoModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PagamentoInput, unknown, PagamentoOutput>({
    resolver: zodResolver(pagamentoSchema),
    defaultValues: { obraId: "", prestadorId: "", descricao: "", dataVencimento: new Date() },
  });

  async function onSubmit(data: PagamentoOutput) {
    const res = await fetch("/api/pagamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível cadastrar o pagamento");
      return;
    }

    toast.success("Pagamento cadastrado");
    setOpen(false);
    reset({ obraId: "", prestadorId: "", descricao: "", dataVencimento: new Date(), valor: undefined });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Novo Pagamento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo pagamento</DialogTitle>
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
              <Label htmlFor="dataVencimento">Vencimento</Label>
              <Controller
                control={control}
                name="dataVencimento"
                render={({ field }) => (
                  <Input
                    id="dataVencimento"
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
