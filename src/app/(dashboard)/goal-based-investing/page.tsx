"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import {
  monthsUntilDate,
  requiredMonthlyContribution,
} from "@/lib/investment-planner";
import { formatCurrency } from "@/lib/utils";
import { getGoals } from "@/server-actions/goals";
import { getTransactions } from "@/server-actions/transactions";
import type { Goal, Transaction } from "@/types";

type GoalPlan = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  monthsLeft: number;
  requiredPerMonth: number;
  isCompleted: boolean;
  isUrgent: boolean;
};

function averageMonthlySurplus(transactions: Transaction[]) {
  const monthly = new Map<string, { income: number; expense: number }>();

  transactions.forEach((tx) => {
    const month = tx.date.slice(0, 7);
    const current = monthly.get(month) || { income: 0, expense: 0 };

    if (tx.type === "income") {
      current.income += tx.amount;
    } else {
      current.expense += tx.amount;
    }

    monthly.set(month, current);
  });

  const values = Array.from(monthly.values());
  if (values.length === 0) return 0;

  const totalSurplus = values.reduce(
    (sum, row) => sum + (row.income - row.expense),
    0,
  );

  return totalSurplus / values.length;
}

export default function GoalBasedInvestingPage() {
  const { currency } = useCurrency();
  const { t } = useI18n();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [annualReturn, setAnnualReturn] = useState("6");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [goalResult, txResult] = await Promise.all([
          getGoals(),
          getTransactions(1000, 0),
        ]);

        if (!goalResult.success) {
          setError(goalResult.error || "Failed to load goals");
          setGoals([]);
        } else {
          setGoals(goalResult.data || []);
        }

        if (txResult.success) {
          setTransactions(txResult.data || []);
        }
      } catch {
        setError("Failed to load planner data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const plan = useMemo(() => {
    const annualReturnPercent = Number(annualReturn) || 0;

    const rows: GoalPlan[] = goals
      .map((goal) => {
        const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
        const monthsLeft = goal.due_date ? monthsUntilDate(goal.due_date) : 36;
        const requiredPerMonth = requiredMonthlyContribution({
          targetFutureValue: remaining,
          annualReturnPercent,
          months: monthsLeft,
        });

        return {
          id: goal.id,
          name: goal.name,
          targetAmount: goal.target_amount,
          currentAmount: goal.current_amount,
          remaining,
          monthsLeft,
          requiredPerMonth,
          isCompleted: remaining <= 0,
          isUrgent: remaining > 0 && monthsLeft <= 6,
        };
      })
      .sort((a, b) => b.requiredPerMonth - a.requiredPerMonth);

    const totalRequired = rows
      .filter((row) => !row.isCompleted)
      .reduce((sum, row) => sum + row.requiredPerMonth, 0);

    const avgSurplus = averageMonthlySurplus(transactions);
    const suggestedBudget = Math.max(avgSurplus * 0.7, 0);

    return {
      rows,
      totalRequired,
      avgSurplus,
      suggestedBudget,
      isAffordable: suggestedBudget >= totalRequired,
    };
  }, [goals, transactions, annualReturn]);

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t.investment.goalBasedTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.investment.goalBasedSubtitle}
            </p>
          </div>

          <label className="space-y-1.5 text-sm">
            <span className="text-muted-foreground">
              {t.investment.expectedAnnualReturn}
            </span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={annualReturn}
              onChange={(event) => setAnnualReturn(event.target.value)}
              className="h-11 w-44 rounded-lg border border-border bg-white px-3 outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-28" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {t.investment.monthlyRequired}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(plan.totalRequired, currency.code)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {t.investment.avgMonthlySurplus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(plan.avgSurplus, currency.code)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {t.investment.suggestedInvestBudget}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(plan.suggestedBudget, currency.code)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {t.investment.planStatus}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-lg font-semibold ${
                      plan.isAffordable ? "text-success" : "text-warning"
                    }`}
                  >
                    {plan.isAffordable
                      ? t.investment.onTrack
                      : t.investment.needsAdjustment}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t.investment.perGoalMonthlyPlan}</CardTitle>
              </CardHeader>
              <CardContent>
                {plan.rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t.investment.noGoalsPlan}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {plan.rows.map((row) => (
                      <div
                        key={row.id}
                        className="rounded-xl border border-border bg-white p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-base font-semibold">
                              {row.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t.investment.remainingOf}{" "}
                              {formatCurrency(row.remaining, currency.code)}{" "}
                              {t.investment.ofLabel}{" "}
                              {formatCurrency(row.targetAmount, currency.code)}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm text-muted-foreground">
                              {t.investment.requiredPerMonth}
                            </p>
                            <p className="text-lg font-bold text-accent">
                              {row.isCompleted
                                ? formatCurrency(0, currency.code)
                                : formatCurrency(
                                    row.requiredPerMonth,
                                    currency.code,
                                  )}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                            {row.monthsLeft} {t.investment.monthsLeft}
                          </span>
                          {row.isCompleted && (
                            <span className="rounded-full bg-success/15 px-3 py-1 text-success">
                              {t.investment.completed}
                            </span>
                          )}
                          {row.isUrgent && !row.isCompleted && (
                            <span className="rounded-full bg-warning/20 px-3 py-1 text-warning">
                              {t.investment.urgentTimeline}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageShell>
  );
}
