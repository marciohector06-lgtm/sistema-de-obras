"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/utils";

export interface ObraChartData {
  nome: string;
  orcamento: number;
  gasto: number;
  corSaude: string; // cor da barra de gasto, de acordo com a saúde da obra
}

// Gráfico de barras: orçamento vs gasto por obra (a barra de gasto é colorida pela saúde da obra)
export function OrcamentoGastoChart({ dados }: { dados: ObraChartData[] }) {
  if (dados.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-text-muted">
        Nenhuma obra cadastrada ainda
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <BarChart data={dados} margin={{ left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="nome"
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
          interval={0}
          tickFormatter={(value: string) => (value.length > 12 ? `${value.slice(0, 12)}…` : value)}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => formatBRL(Number(value ?? 0))}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} formatter={(value) => (value === "orcamento" ? "Orçamento" : "Gasto")} />
        <Bar dataKey="orcamento" fill="var(--primary-bg)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="gasto" radius={[4, 4, 0, 0]}>
          {dados.map((entry, index) => (
            <Cell key={index} fill={entry.corSaude} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
