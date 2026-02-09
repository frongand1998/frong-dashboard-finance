'use client';

import ReactECharts from 'echarts-for-react';
import { formatCurrency } from '@/lib/utils';

type CategoryData = {
  category: string;
  income: number;
  expense: number;
  total: number;
};

export function CategoryTiles({
  categories,
  currencyCode = 'USD',
  showAll = false,
  onCategoryClick,
}: {
  categories: CategoryData[];
  currencyCode?: string;
  showAll?: boolean;
  onCategoryClick?: (category: string) => void;
}) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No category data available
      </div>
    );
  }

  const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
    'food & dining': { icon: '🍔', color: '#f59e0b' },
    groceries: { icon: '🛒', color: '#10b981' },
    transportation: { icon: '🚗', color: '#3b82f6' },
    shopping: { icon: '🛍️', color: '#ec4899' },
    entertainment: { icon: '🎮', color: '#8b5cf6' },
    healthcare: { icon: '🩺', color: '#ef4444' },
    utilities: { icon: '💡', color: '#f97316' },
    salary: { icon: '💰', color: '#22c55e' },
    investment: { icon: '📈', color: '#14b8a6' },
    education: { icon: '🎓', color: '#6366f1' },
    gift: { icon: '🎁', color: '#f43f5e' },
    donation: { icon: '🎁', color: '#f43f5e' },
    savingfund: { icon: '🏦', color: '#0ea5e9' },
    yarisscross: { icon: '🚘', color: '#f97316' },
    termgame: { icon: '🎮', color: '#8b5cf6' },
    bts: { icon: '🚇', color: '#3b82f6' },
    oil: { icon: '⛽', color: '#ef4444' },
    shopee: { icon: '🛍️', color: '#f97316' },
    parking: { icon: '🅿️', color: '#64748b' },
    uncategorized: { icon: '📌', color: '#94a3b8' },
  };

  const getCategoryStyle = (category: string) => {
    const name = category.toLowerCase();
    const key = Object.keys(CATEGORY_STYLES).find((k) => name.includes(k));
    return key ? CATEGORY_STYLES[key] : { icon: '📌', color: '#94a3b8' };
  };

  const isLightColor = (hex: string) => {
    const cleaned = hex.replace('#', '');
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
      name: cat.category,
      value: cat.total,
      income: cat.income,
      expense: cat.expense,
      itemStyle: {
        color: style.color,
      },
      label: {
        color: isLightColor(style.color) ? '#0f172a' : '#ffffff',
      },
    };
  });

  const option = {
    tooltip: {
      formatter: (params: any) => {
        const value = params.data?.value ?? 0;
        const income = params.data?.income ?? 0;
        const expense = params.data?.expense ?? 0;
        return `
          <div style="display:flex;flex-direction:column;gap:6px;min-width:160px;">
            <strong>${params.name}</strong>
            <div>Total: ${formatCurrency(value, currencyCode)}</div>
            <div style="color:#10b981;">Income: ${formatCurrency(income, currencyCode)}</div>
            <div style="color:#ef4444;">Expenses: ${formatCurrency(expense, currencyCode)}</div>
          </div>
        `;
      },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#0f172a', fontSize: 12 },
    },
    series: [
      {
        type: 'treemap',
        data: treemapData,
        roam: true,
        nodeClick: false,
        breadcrumb: { show: false },
        upperLabel: { show: false },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
          gapWidth: 2,
        },
        label: {
          show: true,
          formatter: (params: any) => {
            const icon = getCategoryStyle(params.name || '').icon;
            const income = params.data?.income ?? 0;
            const expense = params.data?.expense ?? 0;
            const net = income - expense;
            const incomeText = formatCurrency(income, currencyCode);
            const expenseText = formatCurrency(expense, currencyCode);
            const netText = formatCurrency(Math.abs(net), currencyCode);
            const netLabel = net >= 0 ? `+${netText}` : `-${netText}`;
            return `${icon} ${params.name}\n↑ ${incomeText}  ↓ ${expenseText}\nNet ${netLabel}`;
          },
          overflow: 'truncate',
        },
      },
    ],
  };

  const onEvents = onCategoryClick
    ? {
        click: (params: any) => {
          const category = params?.name;
          if (category) {
            onCategoryClick(category);
          }
        },
      }
    : undefined;

  return (
    <div className="h-[420px]">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} onEvents={onEvents} />
    </div>
  );
}
