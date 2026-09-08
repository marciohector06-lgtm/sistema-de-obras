"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/utils";
import type { GastoSemanal } from "@/lib/gastos";

export function GastosChart({ dados }: { dados: GastoSemanal[] }) {
  if (dados.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-text-muted">
        Nenhum gasto registrado ainda
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={dados}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value) => formatBRL(Number(value ?? 0))}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
