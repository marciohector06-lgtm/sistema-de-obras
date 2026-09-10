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
import { contratoSchema, type ContratoInput, type ContratoOutput } from "@/lib/validations";
import { createClient } from "@/lib/supabase";
import { validarPdf } from "@/lib/upload-validation";

interface ContratoModalProps {
  obras: { id: string; nome: string }[];
}

export function ContratoModal({ obras }: ContratoModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviandoArquivo, setEnviandoArquivo] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContratoInput, unknown, ContratoOutput>({
    resolver: zodResolver(contratoSchema),
    defaultValues: { obraId: "", titulo: "" },
  });

  async function onSubmit(data: ContratoOutput) {
    let urlArquivo = "";

    if (arquivo) {
      const validacao = validarPdf(arquivo.size, arquivo.type);
      if (!validacao.valido) {
        toast.error(validacao.erro);
        return;
      }

      setEnviandoArquivo(true);
      const supabase = createClient();
      const caminho = `${data.obraId}/${Date.now()}-${arquivo.name}`;
      const { error: erroUpload } = await supabase.storage.from("contratos").upload(caminho, arquivo);
      setEnviandoArquivo(false);

      if (erroUpload) {
        toast.error("Não foi possível enviar o arquivo");
        return;
      }

      urlArquivo = supabase.storage.from("contratos").getPublicUrl(caminho).data.publicUrl;
    }

    const res = await fetch("/api/contratos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, arquivo: urlArquivo }),
    });

    if (!res.ok) {
      toast.error("Não foi possível cadastrar o contrato");
      return;
    }

    toast.success("Contrato cadastrado");
    setOpen(false);
    setArquivo(null);
    reset({ titulo: "", obraId: "", valor: undefined, dataAssin: undefined });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Adicionar Contrato
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo contrato</DialogTitle>
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

          <div className="space-y-1.5">
            <Label htmlFor="arquivo">Arquivo (PDF)</Label>
            <Input
              id="arquivo"
              type="file"
              accept="application/pdf"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || enviandoArquivo}>
              {(isSubmitting || enviandoArquivo) && <Loader2 className="animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
