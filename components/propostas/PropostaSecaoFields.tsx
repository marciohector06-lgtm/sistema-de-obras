"use client";

import { Controller, useFieldArray, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
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
import { SectionCard } from "@/components/shared/SectionCard";
import { formatBRL } from "@/lib/utils";
import { calcTotalItem } from "@/lib/propostas";
import type { PropostaInput, PropostaOutput } from "@/lib/validations";

export interface MaterialOption {
  id: string;
  descricao: string;
  unidade: string;
  preco: number;
}

interface PropostaSecaoFieldsProps {
  control: Control<PropostaInput, unknown, PropostaOutput>;
  register: UseFormRegister<PropostaInput>;
  setValue: UseFormSetValue<PropostaInput>;
  errors: FieldErrors<PropostaInput>;
  secaoIndex: number;
  materiais: MaterialOption[];
  itensAtuais: { quantidade?: unknown; precoUnitario?: unknown }[];
  onRemoveSecao?: () => void;
}

export function PropostaSecaoFields({
  control,
  register,
  setValue,
  errors,
  secaoIndex,
  materiais,
  itensAtuais,
  onRemoveSecao,
}: PropostaSecaoFieldsProps) {
  const {
    fields: itensFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control, name: `secoes.${secaoIndex}.itens` });

  const secaoErrors = errors.secoes?.[secaoIndex];

  return (
    <SectionCard
      title={`Seção ${secaoIndex + 1}`}
      action={
        onRemoveSecao ? (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onRemoveSecao}>
            <Trash2 className="text-danger" />
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-1.5">
        <Label>Título da seção</Label>
        <Input {...register(`secoes.${secaoIndex}.titulo`)} />
        {secaoErrors?.titulo && <p className="text-xs text-danger">{secaoErrors.titulo.message}</p>}
      </div>

      <div className="mt-4 space-y-3">
        {itensFields.map((item, itemIndex) => {
          const itemErrors = secaoErrors?.itens?.[itemIndex];
          const itemAtual = itensAtuais[itemIndex];
          const total = calcTotalItem({
            quantidade: Number(itemAtual?.quantidade) || 0,
            precoUnitario: Number(itemAtual?.precoUnitario) || 0,
          });

          return (
            <div key={item.id} className="rounded-lg border border-border p-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Material</Label>
                  <Controller
                    control={control}
                    name={`secoes.${secaoIndex}.itens.${itemIndex}.materialId`}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={(materialId) => {
                          field.onChange(materialId);
                          const material = materiais.find((m) => m.id === materialId);
                          if (material) {
                            setValue(`secoes.${secaoIndex}.itens.${itemIndex}.descricao`, material.descricao);
                            setValue(`secoes.${secaoIndex}.itens.${itemIndex}.unidade`, material.unidade);
                            setValue(`secoes.${secaoIndex}.itens.${itemIndex}.precoUnitario`, material.preco);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Avulso">
                            {(v: string) => (v ? materiais.find((m) => m.id === v)?.descricao : "Avulso")}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {materiais.map((material) => (
                            <SelectItem key={material.id} value={material.id}>
                              {material.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs">Descrição</Label>
                  <Input {...register(`secoes.${secaoIndex}.itens.${itemIndex}.descricao`)} />
                  {itemErrors?.descricao && <p className="text-xs text-danger">{itemErrors.descricao.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Unidade</Label>
                  <Input {...register(`secoes.${secaoIndex}.itens.${itemIndex}.unidade`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Qtd.</Label>
                  <Input type="number" step="0.001" {...register(`secoes.${secaoIndex}.itens.${itemIndex}.quantidade`)} />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Preço Unit. (R$)</Label>
                  <Input type="number" step="0.01" {...register(`secoes.${secaoIndex}.itens.${itemIndex}.precoUnitario`)} />
                </div>

                <div className="flex items-end justify-between gap-2 sm:col-span-1">
                  <p className="text-sm font-medium text-text-primary">{formatBRL(total)}</p>
                  {itensFields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeItem(itemIndex)}>
                      <Trash2 className="text-danger" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendItem({ materialId: "", descricao: "", unidade: "", quantidade: 1, precoUnitario: 0 })
          }
        >
          <Plus /> Adicionar Item
        </Button>
      </div>
    </SectionCard>
  );
}
