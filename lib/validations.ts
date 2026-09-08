import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do cliente"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  cpfCnpj: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

export const obraSchema = z
  .object({
    nome: z.string().min(2, "Informe o nome da obra"),
    descricao: z.string().optional().or(z.literal("")),
    clienteId: z.string().optional().or(z.literal("")),
    endereco: z.string().optional().or(z.literal("")),
    valorContrato: z.coerce.number().positive("O valor do contrato deve ser maior que zero"),
    dataInicio: z.coerce.date(),
    dataTermino: z.coerce.date(),
    status: z
      .enum(["PLANEJAMENTO", "EM_ANDAMENTO", "PAUSADA", "CONCLUIDA", "CANCELADA"])
      .default("EM_ANDAMENTO"),
    prioridade: z.enum(["BAIXA", "MEDIA", "ALTA", "CRITICA"]).default("MEDIA"),
    cor: z.string().default("#1565C0"),
  })
  .refine((data) => data.dataTermino >= data.dataInicio, {
    message: "A data de término não pode ser anterior à data de início",
    path: ["dataTermino"],
  });

// `Input` = formato antes da validação (o que o formulário mantém, ex: strings de <input>)
// `Output` = formato depois do parse do zod (ex: valorContrato como number, datas como Date)
export type ObraInput = z.input<typeof obraSchema>;
export type ObraOutput = z.output<typeof obraSchema>;

export const gastoSchema = z.object({
  obraId: z.string().min(1),
  descricao: z.string().min(2, "Informe a descrição do gasto"),
  categoria: z.enum([
    "MATERIAL",
    "MAO_DE_OBRA",
    "EQUIPAMENTO",
    "CONTRATO",
    "ADMINISTRATIVO",
    "OUTRO",
  ]),
  valor: z.coerce.number().positive("O valor deve ser maior que zero"),
  data: z.coerce.date(),
  observacao: z.string().optional().or(z.literal("")),
});

export type GastoInput = z.input<typeof gastoSchema>;
export type GastoOutput = z.output<typeof gastoSchema>;
