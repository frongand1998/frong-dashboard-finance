'use client';

import { useEffect, useState, useMemo } from 'react';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { StatCard } from '@/components/dashboard/StatCard';
import { GoalProgress } from '@/components/dashboard/GoalProgress';
import { TransactionsTable } from '@/components/dashboard/TransactionsTable';
import { CategoryTiles } from '@/components/dashboard/CategoryTiles';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangeSelector, type DateRange } from '@/components/ui/DateRangeSelector';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';
import { getTransactions, getTransactionsSummary } from '@/server-actions/transactions';
import { getGoals } from '@/server-actions/goals';
import { getCategorySummary } from '@/server-actions/categories';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Transaction, Goal } from '@/types';

export default function DashboardPage() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Calculate date range based on selection
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (dateRange) {
          case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            break;
        }

        const [txnResult, summaryResult, goalsResult, categoryResult] = await Promise.all([
          getTransactions(100, 0), // Get more transactions for filtering
          getTransactionsSummary(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ),
          getGoals(),
          getCategorySummary(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          ),
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
  }, [dateRange]);

  const net = summary.income - summary.expenses;
  
  // Filter transactions by selected date range
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    return transactions.filter(tx => tx.date >= startStr && tx.date <= endStr);
  }, [transactions, dateRange]);

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
              <DateRangeSelector selected={dateRange} onChange={setDateRange} />
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
              <CategoryTiles categories={categories} currencyCode={currency.code} />
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
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
