'use client';

import ReactECharts from 'echarts-for-react';
import { formatCurrency } from '@/lib/utils';

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
  const labels = data.map((item) => item.label);
  const incomeSeries = data.map((item) => item.income);
  const expenseSeries = data.map((item) => item.expense);

  const option = {
    grid: {
      left: 12,
      right: 16,
      top: 36,
      bottom: 48,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: {
        color: '#0f172a',
        fontSize: 12,
      },
      formatter: (params: any) => {
        const income = params.find((p: any) => p.seriesName === 'Income')?.value ?? 0;
        const expense = params.find((p: any) => p.seriesName === 'Expenses')?.value ?? 0;
        const label = params[0]?.axisValue ?? '';

        return `
          <div style="display:flex;flex-direction:column;gap:6px;min-width:160px;">
            <div style="color:#64748b;font-size:11px;">${label}</div>
            <div style="display:flex;justify-content:space-between;gap:12px;">
              <span style="color:#10b981;">Income</span>
              <strong>${formatCurrency(income, currencyCode)}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;">
              <span style="color:#ef4444;">Expenses</span>
              <strong>${formatCurrency(expense, currencyCode)}</strong>
            </div>
          </div>
        `;
      },
    },
    legend: {
      top: 0,
      left: 0,
      itemWidth: 10,
      itemHeight: 10,
    },
    xAxis: {
      type: 'category',
      data: labels,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: {
        color: '#64748b',
        formatter: (value: number) => (value >= 1000 ? `${value / 1000}k` : `${value}`),
      },
    },
    dataZoom: [
      {
        type: 'inside',
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        throttle: 50,
      },
      {
        type: 'slider',
        height: 20,
        bottom: 8,
        borderColor: 'transparent',
        fillerColor: 'rgba(148,163,184,0.2)',
        handleStyle: { color: '#94a3b8' },
      },
    ],
    series: [
      {
        name: 'Income',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16,185,129,0.12)' },
        data: incomeSeries,
      },
      {
        name: 'Expenses',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#ef4444' },
        itemStyle: { color: '#ef4444' },
        areaStyle: { color: 'rgba(239,68,68,0.12)' },
        data: expenseSeries,
      },
    ],
  };

  return (
    <div className="h-[320px]">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};
