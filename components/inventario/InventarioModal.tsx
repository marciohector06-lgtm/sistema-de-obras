"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Plus, Loader2, Sparkles } from "lucide-react";
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
import { sugerirEstoqueMinimo } from "@/lib/inventario";

interface ItemOption {
  id: string;
  nome: string;
  unidade: string;
}

interface InventarioModalProps {
  itens: ItemOption[];
  obras: { id: string; nome: string }[];
}

interface FormValues {
  obraId: string;
  itemId: string;
  qtdComprada: string;
  local: string;
  novoItemNome: string;
  novoItemUnidade: string;
  novoItemValorUnitario: string;
  novoItemEstoqueMinimo: string;
}

// Modal para dar entrada de estoque em uma obra - permite selecionar um item existente ou cadastrar um novo
export function InventarioModal({ itens, obras }: InventarioModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [modoNovoItem, setModoNovoItem] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      obraId: "",
      itemId: "",
      qtdComprada: "",
      local: "",
      novoItemNome: "",
      novoItemUnidade: "",
      novoItemValorUnitario: "",
      novoItemEstoqueMinimo: "",
    },
  });

  const qtdComprada = watch("qtdComprada");
  const sugestaoEstoqueMinimo = useMemo(() => {
    const qtd = Number(qtdComprada);
    return qtd > 0 ? sugerirEstoqueMinimo(qtd) : 0;
  }, [qtdComprada]);

  async function onSubmit(data: FormValues) {
    let itemId = data.itemId;

    if (modoNovoItem) {
      const resItem = await fetch("/api/itens-inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.novoItemNome,
          unidade: data.novoItemUnidade,
          valorUnitario: data.novoItemValorUnitario || 0,
          estoqueMinimo: data.novoItemEstoqueMinimo || sugestaoEstoqueMinimo,
        }),
      });

      if (!resItem.ok) {
        toast.error("Não foi possível cadastrar o item");
        return;
      }

      const novoItem = await resItem.json();
      itemId = novoItem.id;
    }

    const res = await fetch("/api/inventario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        obraId: data.obraId,
        itemId,
        qtdComprada: data.qtdComprada,
        local: data.local,
      }),
    });

    if (!res.ok) {
      toast.error("Não foi possível registrar a entrada no estoque");
      return;
    }

    toast.success("Estoque atualizado");
    setOpen(false);
    setModoNovoItem(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Adicionar Item
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar item ao estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Item</Label>
            <button
              type="button"
              onClick={() => setModoNovoItem((v) => !v)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {modoNovoItem ? "Selecionar item existente" : "+ Cadastrar novo item"}
            </button>
          </div>

          {modoNovoItem ? (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="novoItemNome">Nome do item</Label>
                <Input id="novoItemNome" {...register("novoItemNome", { required: modoNovoItem })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novoItemUnidade">Unidade</Label>
                <Input id="novoItemUnidade" placeholder="sacos, m³, unidade..." {...register("novoItemUnidade", { required: modoNovoItem })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novoItemValorUnitario">Valor unitário (R$)</Label>
                <Input id="novoItemValorUnitario" type="number" step="0.01" {...register("novoItemValorUnitario")} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="novoItemEstoqueMinimo">Estoque mínimo</Label>
                <Input
                  id="novoItemEstoqueMinimo"
                  type="number"
                  placeholder={sugestaoEstoqueMinimo > 0 ? String(sugestaoEstoqueMinimo) : "0"}
                  {...register("novoItemEstoqueMinimo")}
                />
                {sugestaoEstoqueMinimo > 0 && (
                  <p className="flex items-center gap-1 text-xs text-text-muted">
                    <Sparkles className="size-3" /> Sugestão: {sugestaoEstoqueMinimo} (20% da quantidade comprada)
                  </p>
                )}
              </div>
            </div>
          ) : (
            <Controller
              control={control}
              name="itemId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o item">
                      {(v: string) => (v ? itens.find((i) => i.id === v)?.nome : "Selecione o item")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {itens.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nome} ({item.unidade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qtdComprada">Quantidade comprada</Label>
              <Input id="qtdComprada" type="number" {...register("qtdComprada", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="local">Local de armazenamento</Label>
              <Input id="local" placeholder="Depósito Central..." {...register("local")} />
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
