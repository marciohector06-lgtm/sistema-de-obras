"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/shared/SectionCard";
import { ClienteSelect, type ClienteOption } from "@/components/obras/ClienteSelect";
import { PropostaSecaoFields, type MaterialOption } from "@/components/propostas/PropostaSecaoFields";
import { propostaSchema, type PropostaInput, type PropostaOutput } from "@/lib/validations";
import { calcTotaisProposta } from "@/lib/propostas";
import { formatBRL } from "@/lib/utils";

interface PropostaFormProps {
  clientes: ClienteOption[];
  materiais: MaterialOption[];
  propostaId?: string;
  defaultValues?: Partial<PropostaInput>;
}

const SECAO_VAZIA = { titulo: "", itens: [{ materialId: "", descricao: "", unidade: "", quantidade: 1, precoUnitario: 0 }] };

function toDateInputValue(date: unknown) {
  if (!date) return "";
  const d = new Date(date as string | number | Date);
  return d.toISOString().slice(0, 10);
}

export function PropostaForm({ clientes, materiais, propostaId, defaultValues }: PropostaFormProps) {
  const router = useRouter();
  const [clienteOptions, setClienteOptions] = useState(clientes);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropostaInput, unknown, PropostaOutput>({
    resolver: zodResolver(propostaSchema),
    defaultValues: {
      bdi: 0,
      impostos: 0,
      secoes: [{ titulo: "Seção 1", itens: SECAO_VAZIA.itens }],
      ...defaultValues,
    },
  });

  const {
    fields: secoesFields,
    append: appendSecao,
    remove: removeSecao,
  } = useFieldArray({ control, name: "secoes" });

  const secoesAtuais = watch("secoes");
  const bdiAtual = watch("bdi");
  const impostosAtual = watch("impostos");

  const totais = calcTotaisProposta({
    itens: (secoesAtuais ?? []).flatMap((secao) => secao.itens ?? []).map((item) => ({
      quantidade: Number(item?.quantidade) || 0,
      precoUnitario: Number(item?.precoUnitario) || 0,
    })),
    bdi: Number(bdiAtual) || 0,
    impostos: Number(impostosAtual) || 0,
  });

  async function onSubmit(data: PropostaOutput) {
    const url = propostaId ? `/api/propostas/${propostaId}` : "/api/propostas";
    const method = propostaId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Não foi possível salvar a proposta");
      return;
    }

    const proposta = await res.json();
    toast.success(propostaId ? "Proposta atualizada" : "Proposta criada");
    router.push(`/propostas/${proposta.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <SectionCard title="Dados gerais">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="titulo">Título da proposta</Label>
            <Input id="titulo" {...register("titulo")} />
            {errors.titulo && <p className="text-xs text-danger">{errors.titulo.message}</p>}
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
            {errors.clienteId && <p className="text-xs text-danger">{errors.clienteId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="bdi">BDI (%)</Label>
              <Input id="bdi" type="number" step="0.01" {...register("bdi")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="impostos">Impostos (%)</Label>
              <Input id="impostos" type="number" step="0.01" {...register("impostos")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="validade">Válida até</Label>
              <Controller
                control={control}
                name="validade"
                render={({ field }) => (
                  <Input
                    id="validade"
                    type="date"
                    value={toDateInputValue(field.value)}
                    onChange={(e) => field.onChange(e.target.value ? new Date(`${e.target.value}T00:00:00`) : "")}
                  />
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="condicoesPagamento">Condições de pagamento</Label>
              <Input
                id="condicoesPagamento"
                placeholder="Ex: 30/60/90 dias"
                {...register("condicoesPagamento")}
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="observacao">Observação</Label>
            <Textarea id="observacao" rows={2} {...register("observacao")} />
          </div>
        </div>
      </SectionCard>

      <div className="space-y-4">
        {secoesFields.map((secao, index) => (
          <PropostaSecaoFields
            key={secao.id}
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
            secaoIndex={index}
            materiais={materiais}
            itensAtuais={secoesAtuais?.[index]?.itens ?? []}
            onRemoveSecao={secoesFields.length > 1 ? () => removeSecao(index) : undefined}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            appendSecao({ titulo: `Seção ${secoesFields.length + 1}`, itens: SECAO_VAZIA.itens })
          }
        >
          <Plus /> Adicionar Seção
        </Button>
      </div>

      <SectionCard title="Totais">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Subtotal</dt>
            <dd>{formatBRL(totais.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">BDI</dt>
            <dd>{formatBRL(totais.valorBdi)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Impostos</dt>
            <dd>{formatBRL(totais.valorImpostos)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-text-primary">
            <dt>Total</dt>
            <dd>{formatBRL(totais.valorTotal)}</dd>
          </div>
        </dl>
      </SectionCard>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {propostaId ? "Salvar alterações" : "Criar proposta"}
        </Button>
      </div>
    </form>
  );
}
