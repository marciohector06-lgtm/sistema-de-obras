"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatBRL } from "@/lib/utils";

export interface CategoriaChartData {
  categoria: string;
  label: string;
  total: number;
}

const CORES = ["#1565C0", "#42A5F5", "#2E7D32", "#E65100", "#0277BD", "#9AA3B2"];

// Gráfico de donut: distribuição de gastos por categoria
export function CategoriaDonutChart({ dados }: { dados: CategoriaChartData[] }) {
  if (dados.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-text-muted">
        Nenhum gasto registrado ainda
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={288}>
      <PieChart>
        <Pie
          data={dados}
          dataKey="total"
          nameKey="label"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {dados.map((entry, index) => (
            <Cell key={entry.categoria} fill={CORES[index % CORES.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatBRL(Number(value ?? 0))}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
