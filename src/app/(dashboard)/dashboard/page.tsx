'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { CategoryTiles } from '@/components/dashboard/CategoryTiles';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Target, PiggyBank, Lightbulb, Scissors, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getTransactions, getTransactionsSummary } from '@/server-actions/transactions';
import { getGoals } from '@/server-actions/goals';
import { getCategorySummary } from '@/server-actions/categories';
import { getBudgets } from '@/server-actions/budgets';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Transaction, Goal, Budget } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0 });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSpends, setBudgetSpends] = useState<{ category: string; expense: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthStart = `${currentMonth}-01`;
        const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const currentMonthEnd = `${currentMonth}-${String(lastDay).padStart(2, '0')}`;

        const [txnResult, summaryResult, goalsResult, categoryResult, budgetResult, budgetSpendResult] = await Promise.all([
          getTransactions(100, 0), // Get more transactions for filtering
          getTransactionsSummary(
            startDate,
            endDate
          ),
          getGoals(),
          getCategorySummary(
            startDate,
            endDate
          ),
          getBudgets(currentMonth),
          getCategorySummary(currentMonthStart, currentMonthEnd),
        ]);

        if (txnResult.success) {
          setTransactions(txnResult.data || []);
        }
        if (summaryResult.success) {
          setSummary({
            income: summaryResult.income || 0,
            expenses: summaryResult.expenses || 0,
          });
        }
        if (goalsResult.success) {
          setGoals(goalsResult.data || []);
        }
        if (categoryResult.success) {
          setCategories(categoryResult.data || []);
        }
        if (budgetResult.success) {
          setBudgets(budgetResult.data || []);
        }
        if (budgetSpendResult.success) {
          setBudgetSpends((budgetSpendResult.data || []) as { category: string; expense: number }[]);
        }

        if (!txnResult.success || !summaryResult.success || !goalsResult.success || !categoryResult.success) {
          setError('Failed to load some data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const net = summary.income - summary.expenses;
  const savingsRate = summary.income > 0 ? ((net / summary.income) * 100) : 0;

  // Categorised expense breakdown for insights
  const expenseInsights = useMemo(() => {
    const expenseCats = (categories as { category: string; income: number; expense: number }[])
      .filter((c) => c.expense > 0)
      .map((c) => ({
        category: c.category,
        amount: c.expense,
        pct: summary.income > 0 ? (c.expense / summary.income) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Rough benchmarks (% of income) for common category keywords
    const benchmarks: { keywords: string[]; limit: number; label: string }[] = [
      { keywords: ['food', 'dining', 'restaurant', 'eat', 'meal', 'grocery', 'groceries'], limit: 15, label: 'Food & Dining' },
      { keywords: ['entertainment', 'hobby', 'game', 'movie', 'stream', 'subscription'], limit: 10, label: 'Entertainment' },
      { keywords: ['shopping', 'cloth', 'fashion', 'apparel'], limit: 10, label: 'Shopping' },
      { keywords: ['transport', 'fuel', 'gas', 'uber', 'taxi', 'grab', 'car'], limit: 15, label: 'Transport' },
      { keywords: ['bar', 'drink', 'alcohol', 'coffee'], limit: 5, label: 'Coffee & Drinks' },
    ];

    const suggestions: { category: string; amount: number; pct: number; benchmark: number; label: string }[] = [];
    expenseCats.forEach((cat) => {
      const match = benchmarks.find((b) =>
        b.keywords.some((k) => cat.category.toLowerCase().includes(k))
      );
      if (match && cat.pct > match.limit) {
        suggestions.push({ ...cat, benchmark: match.limit, label: match.label });
      }
    });

    return { expenseCats, suggestions };
  }, [categories, summary.income]);

  // Investment plan derived from net income
  const investmentPlan = useMemo(() => {
    if (net <= 0 || summary.income <= 0) return null;
    const emergency = net * 0.5;
    const stocks = net * 0.3;
    const shortSavings = net * 0.2;
    return { emergency, stocks, shortSavings };
  }, [net, summary.income]);

  // Filter transactions by selected date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date >= startDate && tx.date <= endDate);
  }, [transactions, startDate, endDate]);

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <StatCard
            label="Income"
            value={summary.income}
            icon={<TrendingUp />}
            delta={{ value: summary.income > 0 ? 12 : 0, positive: true }}
            variant="success"
            currencyCode={currency.code}
          />
          <StatCard
            label="Expenses"
            value={summary.expenses}
            icon={<TrendingDown />}
            delta={{ value: summary.expenses > 0 ? 8 : 0, positive: false }}
            variant="danger"
            currencyCode={currency.code}
          />
          <StatCard
            label="Net"
            value={net}
            icon={<Target />}
            delta={{ value: Math.abs(net > 0 ? 15 : 5), positive: net >= 0 }}
            variant={net >= 0 ? 'success' : 'danger'}
            currencyCode={currency.code}
          />
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Track your financial flow over time</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-md border border-border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-md border border-border bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
                        .toISOString()
                        .split('T')[0];
                      setStartDate(yesterday);
                      setEndDate(yesterday);
                    }}
                  >
                    Last Day
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => {
                      const today = new Date()
                        .toISOString()
                        .split('T')[0];
                      setStartDate(today);
                      setEndDate(today);
                    }}
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                        .toISOString()
                        .split('T')[0];
                      const end = new Date(now.getFullYear(), now.getMonth(), 0)
                        .toISOString()
                        .split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                  >
                    Last Month
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), now.getMonth(), 1)
                        .toISOString()
                        .split('T')[0];
                      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                        .toISOString()
                        .split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear() - 1, 0, 1)
                        .toISOString()
                        .split('T')[0];
                      const end = new Date(now.getFullYear() - 1, 11, 31)
                        .toISOString()
                        .split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                  >
                    Last Year
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-xs"
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(now.getFullYear(), 0, 1)
                        .toISOString()
                        .split('T')[0];
                      const end = new Date(now.getFullYear(), 11, 31)
                        .toISOString()
                        .split('T')[0];
                      setStartDate(start);
                      setEndDate(end);
                    }}
                  >
                    This Year
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80" />
            ) : (
              <IncomeExpenseChart
                data={filteredTransactions.map(tx => ({
                  label: tx.date,
                  income: tx.type === 'income' ? tx.amount : 0,
                  expense: tx.type === 'expense' ? tx.amount : 0,
                }))}
                currencyCode={currency.code}
              />
            )}
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>
              Highest spending and earning categories this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <CategoryTiles
                categories={categories}
                currencyCode={currency.code}
                showAll
                onCategoryClick={(category) => {
                  const params = new URLSearchParams();
                  params.set('category', category);
                  params.set('startDate', startDate);
                  params.set('endDate', endDate);
                  router.push(`/transactions?${params.toString()}`);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Financial Insights */}
        {!loading && summary.income > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-accent" />
                <div>
                  <CardTitle>Financial Insights</CardTitle>
                  <CardDescription>Where to cut back &amp; how to invest your surplus</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Savings Rate */}
              <div className="rounded-xl border border-border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Savings Rate</span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    savingsRate >= 20 ? 'text-success' : savingsRate >= 10 ? 'text-warning' : 'text-danger'
                  }`}>
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      savingsRate >= 20 ? 'bg-success' : savingsRate >= 10 ? 'bg-warning' : 'bg-danger'
                    }`}
                    style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20
                    ? 'Great! You are saving more than 20% of your income.'
                    : savingsRate >= 10
                    ? 'Fair. Aim for 20%+ savings to build wealth faster.'
                    : 'Low savings rate. Try to reduce expenses to save at least 10% of income.'}
                </p>
              </div>

              {/* Cut-back suggestions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <Scissors className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Where to Cut Back</span>
                </div>
                {expenseInsights.suggestions.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    All major spending categories are within healthy benchmarks.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {expenseInsights.suggestions.map((s) => (
                      <div
                        key={s.category}
                        className="flex items-start gap-3 rounded-lg bg-danger/5 border border-danger/20 px-3 py-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium truncate">{s.category}</span>
                            <span className="text-xs text-danger shrink-0">
                              {s.pct.toFixed(1)}% of income
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Spending {formatCurrency(s.amount, currency.code)} — benchmark is &lt;{s.benchmark}% of income.
                            Try reducing by {formatCurrency(s.amount - (summary.income * s.benchmark / 100), currency.code)} to hit target.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Investment planning */}
              {investmentPlan && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Monthly Surplus — Suggested Allocation</span>
                    <span className="ml-auto text-sm font-semibold text-success">
                      {formatCurrency(net, currency.code)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border p-3 text-center space-y-1">
                      <p className="text-xs text-muted-foreground">50% — Emergency Fund</p>
                      <p className="text-sm font-semibold">{formatCurrency(investmentPlan.emergency, currency.code)}</p>
                      <p className="text-xs text-muted-foreground">Target: 6× monthly expenses</p>
                    </div>
                    <div className="rounded-xl border border-border p-3 text-center space-y-1">
                      <p className="text-xs text-muted-foreground">30% — Stocks / ETFs</p>
                      <p className="text-sm font-semibold">{formatCurrency(investmentPlan.stocks, currency.code)}</p>
                      <p className="text-xs text-muted-foreground">Index funds, long-term growth</p>
                    </div>
                    <div className="rounded-xl border border-border p-3 text-center space-y-1">
                      <p className="text-xs text-muted-foreground">20% — Short-term Savings</p>
                      <p className="text-sm font-semibold">{formatCurrency(investmentPlan.shortSavings, currency.code)}</p>
                      <p className="text-xs text-muted-foreground">Vacations, big purchases</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top expense breakdown */}
              {expenseInsights.expenseCats.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Expense Breakdown by Category</span>
                  <div className="space-y-2 mt-2">
                    {expenseInsights.expenseCats.slice(0, 6).map((c) => (
                      <div key={c.category} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{c.category}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-accent/70"
                            style={{ width: `${Math.min(c.pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
                          {c.pct.toFixed(1)}%
                        </span>
                        <span className="text-xs font-medium w-24 text-right shrink-0">
                          {formatCurrency(c.amount, currency.code)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Budget Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget Limits</CardTitle>
                  <CardDescription>
                    {loading ? 'Loading...' : `Current month — ${budgets.length} budget${budgets.length !== 1 ? 's' : ''} set`}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  className="text-xs"
                  onClick={() => router.push('/settings#budgets')}
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-12 mb-3" />
                  <Skeleton className="h-12 mb-3" />
                  <Skeleton className="h-12" />
                </>
              ) : (
                <BudgetProgress
                  budgets={budgets}
                  categorySpends={budgetSpends}
                  currencyCode={currency.code}
                  compact
                />
              )}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${goals.length} active goals`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <>
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </>
              ) : goals.length > 0 ? (
                <GoalProgress goals={goals.slice(0, 3)} />
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  No goals yet. Create one to get started!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                {loading ? 'Loading...' : `${recentTransactions.length} recent`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-12 mb-4" />
                  <Skeleton className="h-12 mb-4" />
                  <Skeleton className="h-12" />
                </>
              ) : recentTransactions.length > 0 ? (
                <TransactionsTable transactions={recentTransactions} compact currencyCode={currency.code} />
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  No transactions yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}