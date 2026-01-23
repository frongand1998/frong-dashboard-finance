'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export type IncomeExpenseDatum = {
  label: string;
  income: number;
  expense: number;
};

type Props = {
  data: IncomeExpenseDatum[];
  currencyCode?: string;
};

export const IncomeExpenseChart = ({ data, currencyCode = 'USD' }: Props) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ left: 4, right: 4 }}>
        <defs>
          <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value, name) => {
            const numericValue = typeof value === "number" ? value : Number(value ?? 0);
            return [formatCurrency(numericValue, currencyCode), name];
          }}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#0ea5e9"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#income)"
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#expense)"
          name="Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
