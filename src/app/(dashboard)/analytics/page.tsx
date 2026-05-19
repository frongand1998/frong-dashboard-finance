"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { matchCategoryNameKey } from "@/lib/categoryMatcher";
import { getCategorySummary } from "@/server-actions/categories";
import {
  getMonthlyTrend,
  getAnalyticsTransactions,
} from "@/server-actions/transactions";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  BarChart3,
  Calendar,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────
type RangeKey = "thisMonth" | "last3" | "last6" | "thisYear";

interface CategoryRow {
  category: string;
  income: number;
  expense: number;
  total: number;
}

interface MonthSlot {
  month: string;
  income: number;
  expense: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRangeDates(range: RangeKey): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (range === "thisMonth") {
    return {
      startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (range === "last3") {
    return {
      startDate: fmt(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      endDate: fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (range === "last6") {
    return {
      startDate: fmt(new Date(now.getFullYear(), now.getMonth() - 5, 1)),
      endDate: fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  // thisYear
  return {
    startDate: fmt(new Date(now.getFullYear(), 0, 1)),
    endDate: fmt(new Date(now.getFullYear(), 11, 31)),
  };
}

function monthLabel(yyyymm: string, locale: string) {
  const [y, m] = yyyymm.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString(locale, {
    month: "short",
    year: "2-digit",
  });
}

const TREND_MONTHS: Record<RangeKey, number> = {
  thisMonth: 3,
  last3: 3,
  last6: 6,
  thisYear: 12,
};

// Color palette for donut chart
const PALETTE = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { currency } = useCurrency();
  const { t, locale } = useI18n();
  const currencyCode = currency.code;
  const [range, setRange] = useState<RangeKey>("thisMonth");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [trend, setTrend] = useState<MonthSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const getDisplayCategory = (category: string) => {
    const raw = category.trim();
    const key = matchCategoryNameKey(raw);
    if (key === "uncategorized" && raw) return raw;
    return t.analytics.categoryNames[key];
  };

  const { startDate, endDate } = useMemo(() => getRangeDates(range), [range]);
  const trendMonths = TREND_MONTHS[range];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const [catRes, trendRes, txRes] = await Promise.all([
        getCategorySummary(startDate, endDate),
        getMonthlyTrend(trendMonths),
        getAnalyticsTransactions(startDate, endDate),
      ]);

      if (cancelled) return;

      if (catRes.success && catRes.data)
        setCategories(catRes.data as CategoryRow[]);
      if (trendRes.success && trendRes.data)
        setTrend(trendRes.data as MonthSlot[]);

      // day-of-week spending
      const dow = [0, 0, 0, 0, 0, 0, 0];
      if (txRes.success && txRes.data) {
        txRes.data.forEach((tx: any) => {
          if (tx.type === "expense") {
            const d = new Date(tx.date);
            dow[d.getDay()] += Number(tx.amount);
          }
        });
      }
      setDayOfWeek(dow);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, trendMonths]);

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalIncome = useMemo(
    () => categories.reduce((s, c) => s + c.income, 0),
    [categories],
  );
  const totalExpense = useMemo(
    () => categories.reduce((s, c) => s + c.expense, 0),
    [categories],
  );
  const net = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.round((net / totalIncome) * 100) : 0;

  const expenseCategories = useMemo(
    () =>
      categories
        .filter((c) => c.expense > 0)
        .sort((a, b) => b.expense - a.expense),
    [categories],
  );

  const topExpense = expenseCategories[0]?.expense ?? 1;

  // ── ECharts options ──────────────────────────────────────────────────────
  const donutOption = useMemo(() => {
    const currCode = currency.code;
    const pieData = expenseCategories.slice(0, 10).map((c, i) => ({
      value: c.expense,
      name: getDisplayCategory(c.category),
      itemStyle: { color: PALETTE[i % PALETTE.length] },
    }));

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255,255,255,0.97)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
        formatter: (p: any) =>
          `<div style="min-width:140px">
            <div style="color:#64748b;font-size:11px;margin-bottom:4px">${p.name}</div>
            <strong>${formatCurrency(p.value, currCode)}</strong>
            <span style="color:#94a3b8;margin-left:8px">${p.percent?.toFixed(1)}%</span>
          </div>`,
      },
      legend: { show: false },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          data: pieData,
          label: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0,0,0,0.3)",
            },
          },
        },
      ],
    };
  }, [expenseCategories, currency, currency.code, t]);

  const barOption = useMemo(() => {
    const cc = currency.code;
    // Filter trend to only months in range
    const rangeStart = startDate.slice(0, 7);
    const rangeEnd = endDate.slice(0, 7);
    const visible = trend.filter(
      (s) => s.month >= rangeStart && s.month <= rangeEnd,
    );
    const labels = visible.map((s) => monthLabel(s.month, locale));
    const incomeData = visible.map((s) => s.income);
    const expenseData = visible.map((s) => s.expense);
    const incomeLabel = t.transactionType.income;
    const expenseLabel = t.transactionType.expense;

    return {
      grid: { left: 12, right: 12, top: 20, bottom: 40, containLabel: true },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.97)",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        textStyle: { color: "#0f172a", fontSize: 12 },
        formatter: (params: any) => {
          const inc =
            params.find((p: any) => p.seriesName === incomeLabel)?.value ?? 0;
          const exp =
            params.find((p: any) => p.seriesName === expenseLabel)?.value ?? 0;
          const label = params[0]?.axisValue ?? "";
          return `
            <div style="min-width:160px">
              <div style="color:#64748b;font-size:11px;margin-bottom:6px">${label}</div>
              <div style="display:flex;justify-content:space-between;gap:12px;margin-bottom:2px">
                <span style="color:#10b981">${incomeLabel}</span>
          <strong>${formatCurrency(inc, cc)}</strong>
            </div>
              <div style="display:flex;justify-content:space-between;gap:12px">
                <span style="color:#ef4444">${expenseLabel}</span>
                <strong>${formatCurrency(exp, cc)}</strong>
              </div>
            </div>`;
        },
      },
      xAxis: {
        type: "category",
        data: labels,
        axisLine: { lineStyle: { color: "#e2e8f0" } },
        axisTick: { show: false },
        axisLabel: { color: "#94a3b8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#94a3b8",
          fontSize: 10,
          formatter: (v: number) =>
            v >= 1000000
              ? `${(v / 1000000).toFixed(1)}M`
              : v >= 1000
                ? `${(v / 1000).toFixed(0)}K`
                : String(v),
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: incomeLabel,
          type: "bar",
          data: incomeData,
          itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 28,
        },
        {
          name: expenseLabel,
          type: "bar",
          data: expenseData,
          itemStyle: { color: "#ef4444", borderRadius: [4, 4, 0, 0] },
          barMaxWidth: 28,
        },
      ],
    };
  }, [
    trend,
    startDate,
    endDate,
    currency,
    currency.code,
    locale,
    t.transactionType.expense,
    t.transactionType.income,
  ]);

  const DOW_LABELS = [
    t.analytics.weekday.sun,
    t.analytics.weekday.mon,
    t.analytics.weekday.tue,
    t.analytics.weekday.wed,
    t.analytics.weekday.thu,
    t.analytics.weekday.fri,
    t.analytics.weekday.sat,
  ];
  const maxDow = Math.max(...dayOfWeek, 1);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        {t.analytics.title}
      </h1>
      {/* ── Range Selector ─────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["thisMonth", "last3", "last6", "thisYear"] as RangeKey[]).map(
          (key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                range === key
                  ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-400"
              }`}
            >
              {t.analytics.range[key]}
            </button>
          ),
        )}
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          label={t.analytics.totalIncome}
          value={loading ? null : formatCurrency(totalIncome, currencyCode)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          color="emerald"
        />
        <StatTile
          label={t.analytics.totalExpenses}
          value={loading ? null : formatCurrency(totalExpense, currencyCode)}
          icon={<TrendingDown className="w-5 h-5 text-rose-500" />}
          color="rose"
        />
        <StatTile
          label={t.analytics.netSavings}
          value={loading ? null : formatCurrency(net, currencyCode)}
          icon={<Wallet className="w-5 h-5 text-blue-500" />}
          color={net >= 0 ? "blue" : "rose"}
        />
        <StatTile
          label={t.analytics.savingsRate}
          value={loading ? null : `${savingsRate}%`}
          icon={<PiggyBank className="w-5 h-5 text-violet-500" />}
          color={
            savingsRate >= 20 ? "violet" : savingsRate >= 10 ? "amber" : "rose"
          }
          subLabel={
            savingsRate >= 20
              ? t.analytics.onTrack
              : savingsRate >= 10
                ? t.analytics.gettingThere
                : t.analytics.needsAttention
          }
        />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Donut chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500" />
              {t.analytics.expenseBreakdown}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : expenseCategories.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                {t.analytics.noExpenseData}
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <div className="flex-1 min-w-0">
                  <ReactECharts
                    option={donutOption}
                    style={{ height: 220 }}
                    notMerge
                  />
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-1.5 text-xs shrink-0 max-w-[140px]">
                  {expenseCategories.slice(0, 8).map((c, i) => (
                    <div
                      key={c.category}
                      className="flex items-center gap-1.5 truncate"
                    >
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="truncate text-slate-600">
                        {getDisplayCategory(c.category)}
                      </span>
                    </div>
                  ))}
                  {expenseCategories.length > 8 && (
                    <div className="text-slate-400">
                      +{expenseCategories.length - 8} {t.analytics.moreItems}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {t.analytics.incomeVsExpenseTrend}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : (
              <ReactECharts
                option={barOption}
                style={{ height: 220 }}
                notMerge
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top Spending Categories ─────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            {t.analytics.topSpendingCategories}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          ) : expenseCategories.length === 0 ? (
            <div className="text-slate-400 text-sm py-4 text-center">
              {t.analytics.noExpensesRecorded}
            </div>
          ) : (
            <div className="space-y-3">
              {expenseCategories.slice(0, 8).map((c, i) => {
                const pct = Math.round((c.expense / topExpense) * 100);
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ background: PALETTE[i % PALETTE.length] }}
                        />
                        <span className="text-slate-700 font-medium">
                          {getDisplayCategory(c.category)}
                        </span>
                      </span>
                      <span className="text-slate-500 font-mono text-xs tabular-nums">
                        {formatCurrency(c.expense, currencyCode)}
                        <span className="text-slate-400 ml-2">
                          {totalExpense > 0
                            ? `${Math.round((c.expense / totalExpense) * 100)}%`
                            : "—"}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: PALETTE[i % PALETTE.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Day-of-Week Spending ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            {t.analytics.spendingByDayOfWeek}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : (
            <div className="flex gap-2 items-end justify-between">
              {DOW_LABELS.map((day, i) => {
                const pct = Math.round((dayOfWeek[i] / maxDow) * 100);
                const isMax = dayOfWeek[i] === maxDow && maxDow > 0;
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center gap-1 flex-1"
                  >
                    <span className="text-xs text-slate-500 font-mono tabular-nums">
                      {dayOfWeek[i] > 0
                        ? dayOfWeek[i] >= 1000
                          ? `${Math.round(dayOfWeek[i] / 1000)}K`
                          : `${Math.round(dayOfWeek[i])}`
                        : "—"}
                    </span>
                    <div
                      className="w-full bg-slate-100 rounded-t-sm overflow-hidden"
                      style={{ height: 48 }}
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          isMax ? "bg-rose-500" : "bg-rose-300"
                        }`}
                        style={{
                          height: `${pct}%`,
                          marginTop: `${100 - pct}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${isMax ? "text-rose-600" : "text-slate-500"}`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

// ─── StatTile ────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  emerald: "bg-emerald-50 border-emerald-100",
  rose: "bg-rose-50 border-rose-100",
  blue: "bg-blue-50 border-blue-100",
  violet: "bg-violet-50 border-violet-100",
  amber: "bg-amber-50 border-amber-100",
};

function StatTile({
  label,
  value,
  icon,
  color,
  subLabel,
}: {
  label: string;
  value: string | null;
  icon: React.ReactNode;
  color: string;
  subLabel?: string;
}) {
  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-1 ${COLOR_MAP[color] ?? "bg-slate-50 border-slate-100"}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        {icon}
      </div>
      {value === null ? (
        <Skeleton className="h-7 w-24 mt-1" />
      ) : (
        <span className="text-xl font-bold text-slate-800 tabular-nums">
          {value}
        </span>
      )}
      {subLabel && <span className="text-xs text-slate-400">{subLabel}</span>}
    </div>
  );
}
