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

export const entradaSchema = z.object({
  obraId: z.string().min(1, "Selecione a obra"),
  descricao: z.string().min(2, "Informe a descrição da entrada"),
  valor: z.coerce.number().positive("O valor deve ser maior que zero"),
  data: z.coerce.date(),
  observacao: z.string().optional().or(z.literal("")),
});

export type EntradaInput = z.input<typeof entradaSchema>;
export type EntradaOutput = z.output<typeof entradaSchema>;

export const contratoSchema = z.object({
  obraId: z.string().min(1, "Selecione a obra"),
  titulo: z.string().min(2, "Informe o título do contrato"),
  valor: z.coerce.number().positive().optional(),
  dataAssin: z.coerce.date().optional(),
});

export type ContratoInput = z.input<typeof contratoSchema>;
export type ContratoOutput = z.output<typeof contratoSchema>;

export const itemInventarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome do item"),
  unidade: z.string().min(1, "Informe a unidade (ex: sacos, m³, unidade)"),
  valorUnitario: z.coerce.number().nonnegative("O valor unitário não pode ser negativo"),
  estoqueMinimo: z.coerce.number().int().nonnegative().default(0),
});

export type ItemInventarioInput = z.input<typeof itemInventarioSchema>;
export type ItemInventarioOutput = z.output<typeof itemInventarioSchema>;

export const obraInventarioSchema = z.object({
  obraId: z.string().min(1, "Selecione a obra"),
  itemId: z.string().min(1, "Selecione o item"),
  qtdComprada: z.coerce.number().int().positive("Informe uma quantidade maior que zero"),
  local: z.string().optional().or(z.literal("")),
});

export type ObraInventarioInput = z.input<typeof obraInventarioSchema>;
export type ObraInventarioOutput = z.output<typeof obraInventarioSchema>;

export const baixaEstoqueSchema = z.object({
  obraInventarioId: z.string().min(1, "Selecione o item em estoque"),
  qtdUsada: z.coerce.number().int().positive("Informe uma quantidade maior que zero"),
});

export type BaixaEstoqueInput = z.input<typeof baixaEstoqueSchema>;
export type BaixaEstoqueOutput = z.output<typeof baixaEstoqueSchema>;

export const pagamentoSchema = z.object({
  obraId: z.string().min(1, "Selecione a obra"),
  descricao: z.string().min(2, "Informe a descrição do pagamento"),
  valor: z.coerce.number().positive("O valor deve ser maior que zero"),
  dataVencimento: z.coerce.date(),
  observacao: z.string().optional().or(z.literal("")),
});

export type PagamentoInput = z.input<typeof pagamentoSchema>;
export type PagamentoOutput = z.output<typeof pagamentoSchema>;

export const pagamentoStatusSchema = z.object({
  status: z.enum(["PENDENTE", "EFETUADO", "EM_PROCESSAMENTO", "ATRASADO", "CANCELADO"]),
});

export const usuarioUpdateSchema = z.object({
  role: z.enum(["ADMIN", "GESTOR", "ENGENHEIRO", "VIEWER"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).optional(),
});
