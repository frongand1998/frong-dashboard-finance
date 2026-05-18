"use client";

import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import { formatCurrency } from "@/lib/utils";
import { getTransactions } from "@/server-actions/transactions";
import type { Transaction } from "@/types";

type AllocationRow = {
  label: string;
  amount: number;
  pct: number;
};

const INVESTMENT_TAGS: Array<{ label: string; keys: string[] }> = [
  { label: "Stocks", keys: ["stock", "equity", "หุ้น"] },
  { label: "Funds", keys: ["fund", "mf", "กองทุน"] },
  { label: "Bonds", keys: ["bond", "ตราสารหนี้"] },
  { label: "Crypto", keys: ["crypto", "bitcoin", "eth"] },
  { label: "Cash", keys: ["cash", "saving", "เงินสด"] },
];

function detectBucket(category: string) {
  const normalized = category.toLowerCase();
  const matched = INVESTMENT_TAGS.find((bucket) =>
    bucket.keys.some((key) => normalized.includes(key)),
  );

  return matched?.label ?? "Other";
}

export default function InvestmentSnapshotPage() {
  const { currency } = useCurrency();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const txResult = await getTransactions(1000, 0);
        if (!txResult.success) {
          setError(txResult.error || "Failed to load investment data");
          setTransactions([]);
          return;
        }

        setTransactions(txResult.data || []);
      } catch {
        setError("Failed to load investment data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const investmentTx = transactions.filter((tx) => {
      const category = tx.category.toLowerCase();
      return INVESTMENT_TAGS.some((bucket) =>
        bucket.keys.some((key) => category.includes(key)),
      );
    });

    const invested = investmentTx
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const realized = investmentTx
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netCost = Math.max(invested - realized, 0);

    const allocationMap = new Map<string, number>();
    investmentTx.forEach((tx) => {
      if (tx.type !== "expense") return;
      const bucket = detectBucket(tx.category);
      allocationMap.set(bucket, (allocationMap.get(bucket) || 0) + tx.amount);
    });

    const rows: AllocationRow[] = Array.from(allocationMap.entries())
      .map(([label, amount]) => ({
        label,
        amount,
        pct: netCost > 0 ? (amount / netCost) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyInvest = investmentTx
      .filter((tx) => tx.type === "expense" && tx.date.startsWith(thisMonth))
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalTransactions: investmentTx.length,
      invested,
      realized,
      netCost,
      monthlyInvest,
      allocations: rows,
    };
  }, [transactions]);

  return (
    <PageShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.investment.snapshotTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.investment.snapshotSubtitle}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {t.investment.totalInvested}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.invested, currency.code)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {t.investment.realizedReturns}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(stats.realized, currency.code)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {t.investment.netCostBasis}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.netCost, currency.code)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  {t.investment.investedThisMonth}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.monthlyInvest, currency.code)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t.investment.allocationMix}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.allocations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t.investment.noInvestmentData}
              </p>
            ) : (
              <div className="space-y-4">
                {stats.allocations.map((row) => (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{row.label}</span>
                      <span>
                        {formatCurrency(row.amount, currency.code)} (
                        {row.pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${Math.min(row.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.investment.dataNotes}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>{t.investment.dataNoteDescription}</p>
            <p className="mt-2">
              {t.investment.detectedEntries}: {stats.totalTransactions}{" "}
              {t.investment.transactionsLabel}
            </p>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
