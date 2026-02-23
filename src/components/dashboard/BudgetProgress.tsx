'use client';

import { AlertTriangle, CheckCircle2, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Budget } from '@/types';

interface CategorySpend {
  category: string;
  expense: number;
}

interface BudgetProgressProps {
  budgets: Budget[];
  categorySpends: CategorySpend[];
  currencyCode: string;
  /** If true, renders a compact list rather than full cards */
  compact?: boolean;
}

function colorClass(pct: number) {
  if (pct >= 100) return 'bg-danger';
  if (pct >= 75) return 'bg-warning';
  return 'bg-success';
}

function textColorClass(pct: number) {
  if (pct >= 100) return 'text-danger';
  if (pct >= 75) return 'text-warning';
  return 'text-success';
}

export function BudgetProgress({ budgets, categorySpends, currencyCode, compact }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Wallet className="w-8 h-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No budgets set yet.</p>
        <p className="text-xs text-muted-foreground">
          Go to <span className="font-medium">Settings → Budget Limits</span> to add spending limits.
        </p>
      </div>
    );
  }

  const rows = budgets.map((b) => {
    const spend = categorySpends.find(
      (c) => c.category.toLowerCase() === b.category.toLowerCase()
    );
    const spent = spend?.expense ?? 0;
    const pct = Math.min((spent / b.limit_amount) * 100, 100);
    const overflow = spent > b.limit_amount ? spent - b.limit_amount : 0;
    return { ...b, spent, pct, overflow };
  });

  // Sort: over-budget first, then by % desc
  rows.sort((a, b) => {
    if (a.overflow > 0 && b.overflow === 0) return -1;
    if (a.overflow === 0 && b.overflow > 0) return 1;
    return b.pct - a.pct;
  });

  if (compact) {
    return (
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id}>
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {r.overflow > 0 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
                ) : r.pct >= 75 ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                )}
                <span className="text-xs font-medium truncate">{r.category}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-xs font-semibold ${textColorClass(r.pct + (r.overflow > 0 ? 100 : 0))}`}>
                  {formatCurrency(r.spent, currencyCode)}
                </span>
                <span className="text-xs text-muted-foreground">/ {formatCurrency(r.limit_amount, currencyCode)}</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${colorClass(r.pct + (r.overflow > 0 ? 100 : 0))}`}
                style={{ width: `${r.pct}%` }}
              />
            </div>
            {r.overflow > 0 && (
              <p className="text-xs text-danger mt-0.5">
                Over by {formatCurrency(r.overflow, currencyCode)}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => {
        const isOver = r.overflow > 0;
        const isNear = !isOver && r.pct >= 75;
        return (
          <div
            key={r.id}
            className={`rounded-xl border p-4 space-y-3 ${
              isOver
                ? 'border-danger/30 bg-danger/5'
                : isNear
                ? 'border-warning/30 bg-warning/5'
                : 'border-border bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold">{r.category}</span>
                {isOver && (
                  <span className="rounded-full bg-danger text-white text-xs px-2 py-0.5 font-medium">
                    Over budget
                  </span>
                )}
                {isNear && (
                  <span className="rounded-full bg-warning text-white text-xs px-2 py-0.5 font-medium">
                    Near limit
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${isOver ? 'text-danger' : isNear ? 'text-warning' : 'text-foreground'}`}>
                  {formatCurrency(r.spent, currencyCode)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {formatCurrency(r.limit_amount, currencyCode)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all ${isOver ? 'bg-danger' : isNear ? 'bg-warning' : 'bg-success'}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{r.pct.toFixed(0)}% used</span>
                {isOver ? (
                  <span className="text-danger font-medium">
                    Over by {formatCurrency(r.overflow, currencyCode)}
                  </span>
                ) : (
                  <span>{formatCurrency(r.limit_amount - r.spent, currencyCode)} remaining</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
