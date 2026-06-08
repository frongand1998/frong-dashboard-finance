"use client";

import ReactECharts from "echarts-for-react";
import { useI18n } from "@/contexts/I18nContext";
import { matchCategoryNameKey } from "@/lib/categoryMatcher";
import { formatCurrency } from "@/lib/utils";

type CategoryData = {
  category: string;
  income: number;
  expense: number;
  total: number;
};

type TreemapChartData = {
  name: string;
  rawCategory: string;
  value: number;
  income: number;
  expense: number;
};

type TreemapFormatterParams = {
  name?: string;
  data?: TreemapChartData;
};

export function CategoryTiles({
  categories,
  currencyCode = "USD",
  showAll = false,
  onCategoryClick,
}: {
  categories: CategoryData[];
  currencyCode?: string;
  showAll?: boolean;
  onCategoryClick?: (category: string) => void;
}) {
  const { t } = useI18n();

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t.common.noData}
      </div>
    );
  }

  const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
    food: { icon: "🍔", color: "#f59e0b" },
    transport: { icon: "🚗", color: "#3b82f6" },
    housing: { icon: "🏠", color: "#0ea5e9" },
    utilities: { icon: "💡", color: "#f97316" },
    shopping: { icon: "🛍️", color: "#ec4899" },
    entertainment: { icon: "🎮", color: "#8b5cf6" },
    healthcare: { icon: "🩺", color: "#ef4444" },
    salary: { icon: "💰", color: "#22c55e" },
    investment: { icon: "📈", color: "#14b8a6" },
    education: { icon: "🎓", color: "#6366f1" },
    bills: { icon: "🧾", color: "#64748b" },
    insurance: { icon: "🛡️", color: "#2563eb" },
    tax: { icon: "🏛️", color: "#334155" },
    savings: { icon: "🏦", color: "#0ea5e9" },
    travel: { icon: "✈️", color: "#06b6d4" },
    uncategorized: { icon: "📌", color: "#94a3b8" },
  };

  const getDisplayCategory = (category: string) => {
    const raw = category.trim();
    const key = matchCategoryNameKey(raw);
    if (key === "uncategorized" && raw) return raw;
    return t.analytics.categoryNames[key];
  };

  const getCategoryStyle = (category: string) => {
    const key = matchCategoryNameKey(category);
    return CATEGORY_STYLES[key] ?? CATEGORY_STYLES.uncategorized;
  };

  const isLightColor = (hex: string) => {
    const cleaned = hex.replace("#", "");
    const r = parseInt(cleaned.substring(0, 2), 16);
    const g = parseInt(cleaned.substring(2, 4), 16);
    const b = parseInt(cleaned.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
  };

  const displayCategories = showAll ? categories : categories.slice(0, 12);
  const treemapData = displayCategories.map((cat) => {
    const style = getCategoryStyle(cat.category);
    return {
      name: getDisplayCategory(cat.category),
      rawCategory: cat.category,
      value: cat.total,
      income: cat.income,
      expense: cat.expense,
      itemStyle: {
        color: style.color,
      },
      label: {
        color: isLightColor(style.color) ? "#0f172a" : "#ffffff",
      },
    };
  });

  const option = {
    tooltip: {
      formatter: (params: TreemapFormatterParams) => {
        const value = params.data?.value ?? 0;
        const income = params.data?.income ?? 0;
        const expense = params.data?.expense ?? 0;
        return `
          <div style="display:flex;flex-direction:column;gap:6px;min-width:160px;">
            <strong>${params.name}</strong>
            <div>${t.common.total}: ${formatCurrency(value, currencyCode)}</div>
            <div style="color:#10b981;">${t.transactionType.income}: ${formatCurrency(income, currencyCode)}</div>
            <div style="color:#ef4444;">${t.transactionType.expense}: ${formatCurrency(expense, currencyCode)}</div>
          </div>
        `;
      },
      backgroundColor: "rgba(255,255,255,0.95)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      textStyle: { color: "#0f172a", fontSize: 12 },
    },
    series: [
      {
        type: "treemap",
        data: treemapData,
        roam: true,
        nodeClick: false,
        breadcrumb: { show: false },
        upperLabel: { show: false },
        itemStyle: {
          borderColor: "#ffffff",
          borderWidth: 2,
          gapWidth: 2,
        },
        label: {
          show: true,
          formatter: (params: TreemapFormatterParams) => {
            const icon = getCategoryStyle(
              params.data?.rawCategory || params.name || "",
            ).icon;
            const income = params.data?.income ?? 0;
            const expense = params.data?.expense ?? 0;
            const net = income - expense;
            const incomeText = formatCurrency(income, currencyCode);
            const expenseText = formatCurrency(expense, currencyCode);
            const netText = formatCurrency(Math.abs(net), currencyCode);
            const netLabel = net >= 0 ? `+${netText}` : `-${netText}`;
            return `${icon} ${params.name}\n↑ ${incomeText}  ↓ ${expenseText}\n${t.dashboard.netBalance} ${netLabel}`;
          },
          overflow: "truncate",
        },
      },
    ],
  };

  const onEvents = onCategoryClick
    ? {
        click: (params: TreemapFormatterParams) => {
          const category = params?.data?.rawCategory || params?.name;
          if (category) {
            onCategoryClick(category);
          }
        },
      }
    : undefined;

  return (
    <div className="h-[420px]">
      <ReactECharts
        option={option}
        style={{ height: "100%", width: "100%" }}
        onEvents={onEvents}
      />
    </div>
  );
}
