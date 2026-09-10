"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { SectionCard } from "@/components/shared/SectionCard";
import { ClienteSelect, type ClienteOption } from "@/components/obras/ClienteSelect";
import { obraSchema, type ObraInput, type ObraOutput } from "@/lib/validations";
import { OBRA_STATUS_LABELS, TIPO_OBRA_LABELS } from "@/lib/obra";

const PRIORIDADE_LABELS = { BAIXA: "Baixa", MEDIA: "Média", ALTA: "Alta", CRITICA: "Crítica" };

function toDateInputValue(date: unknown) {
  if (!date) return "";
  const d = new Date(date as string | number | Date);
  return d.toISOString().slice(0, 10);
}

interface ObraFormProps {
  clientes: ClienteOption[];
  obraId?: string;
  defaultValues?: Partial<ObraInput>;
}

// Formulário de criação/edição de obra (usado em /obras/nova e /obras/[id]/editar)
export function ObraForm({ clientes, obraId, defaultValues }: ObraFormProps) {
  const router = useRouter();
  const [clienteOptions, setClienteOptions] = useState(clientes);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ObraInput, unknown, ObraOutput>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      status: "EM_ANDAMENTO",
      prioridade: "MEDIA",
      cor: "#1565C0",
      dataInicio: new Date(),
      dataTermino: new Date(),
      ...defaultValues,
    },
  });

  async function onSubmit(data: ObraOutput) {
    const url = obraId ? `/api/obras/${obraId}` : "/api/obras";
    const method = obraId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível salvar a obra");
      return;
    }

    const obra = await res.json();
    toast.success(obraId ? "Obra atualizada" : "Obra cadastrada");
    router.push(`/obras/${obra.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SectionCard title="Dados gerais">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome da obra</Label>
            <Input id="nome" {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Controller
              control={control}
              name="clienteId"
              render={({ field }) => (
                <ClienteSelect
                  clientes={clienteOptions}
                  value={field.value ?? undefined}
                  onChange={(id, lista) => {
                    field.onChange(id);
                    setClienteOptions(lista);
                  }}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" {...register("endereco")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" {...register("cidade")} />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de obra</Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo">
                      {(value: string) =>
                        value ? TIPO_OBRA_LABELS[value as keyof typeof TIPO_OBRA_LABELS] : "Selecione o tipo"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_OBRA_LABELS).map(([value, label]) => (
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
            <Label htmlFor="responsavelTecnico">Responsável técnico</Label>
            <Input id="responsavelTecnico" {...register("responsavelTecnico")} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" rows={3} {...register("descricao")} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Contrato e prazo">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="valorContrato">Valor do contrato (R$)</Label>
            <Input id="valorContrato" type="number" step="0.01" {...register("valorContrato")} />
            {errors.valorContrato && (
              <p className="text-xs text-danger">{errors.valorContrato.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dataInicio">Data de início</Label>
            <Controller
              control={control}
              name="dataInicio"
              render={({ field }) => (
                <Input
                  id="dataInicio"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))}
                />
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dataTermino">Data de término</Label>
            <Controller
              control={control}
              name="dataTermino"
              render={({ field }) => (
                <Input
                  id="dataTermino"
                  type="date"
                  value={toDateInputValue(field.value)}
                  onChange={(e) => field.onChange(new Date(`${e.target.value}T00:00:00`))}
                />
              )}
            />
            {errors.dataTermino && (
              <p className="text-xs text-danger">{errors.dataTermino.message}</p>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Status e prioridade">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => OBRA_STATUS_LABELS[value as keyof typeof OBRA_STATUS_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(OBRA_STATUS_LABELS).map(([value, label]) => (
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
            <Label>Prioridade</Label>
            <Controller
              control={control}
              name="prioridade"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) => PRIORIDADE_LABELS[value as keyof typeof PRIORIDADE_LABELS]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORIDADE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {obraId ? "Salvar alterações" : "Cadastrar obra"}
        </Button>
      </div>
    </form>
  );
}
