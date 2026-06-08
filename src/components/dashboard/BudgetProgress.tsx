"use client";

import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatCurrency, getBudgetAlertLevel } from "@/lib/utils";
import type { Budget } from "@/types";

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

function colorClass(level: ReturnType<typeof getBudgetAlertLevel>) {
  if (level === "critical") return "bg-danger";
  if (level === "warning") return "bg-warning";
  if (level === "near") return "bg-accent";
  return "bg-success";
}

function textColorClass(level: ReturnType<typeof getBudgetAlertLevel>) {
  if (level === "critical") return "text-danger";
  if (level === "warning") return "text-warning";
  if (level === "near") return "text-accent";
  return "text-success";
}

export function BudgetProgress({
  budgets,
  categorySpends,
  currencyCode,
  compact,
}: BudgetProgressProps) {
  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <Wallet className="w-8 h-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No budgets set yet.</p>
        <p className="text-xs text-muted-foreground">
          Go to <span className="font-medium">Limits</span> to add spending
          limits.
        </p>
      </div>
    );
  }

  const rows = budgets.map((b) => {
    const spend = categorySpends.find(
      (c) => c.category.toLowerCase() === b.category.toLowerCase(),
    );
    const spent = spend?.expense ?? 0;
    const pct =
      b.limit_amount > 0
        ? Math.min((spent / b.limit_amount) * 100, 100)
        : spent > 0
          ? 100
          : 0;
    const overflow = spent > b.limit_amount ? spent - b.limit_amount : 0;
    const level = getBudgetAlertLevel(spent, b.limit_amount);
    return { ...b, spent, pct, overflow, level };
  });

  // Sort: over-budget first, then by % desc
  rows.sort((a, b) => {
    const order = { critical: 0, warning: 1, near: 2, normal: 3 };
    if (order[a.level] !== order[b.level])
      return order[a.level] - order[b.level];
    return b.pct - a.pct;
  });

  if (compact) {
    return (
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id}>
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {r.level === "critical" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-danger shrink-0" />
                ) : r.level === "warning" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                ) : r.level === "near" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                )}
                <span className="text-xs font-medium truncate">
                  {r.category}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  className={`text-xs font-semibold ${textColorClass(r.level)}`}
                >
                  {formatCurrency(r.spent, currencyCode)}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {formatCurrency(r.limit_amount, currencyCode)}
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all ${colorClass(r.level)}`}
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
        const isCritical = r.level === "critical";
        const isWarning = r.level === "warning";
        const isNear = r.level === "near";
        return (
          <div
            key={r.id}
            className={`rounded-xl border p-4 space-y-3 ${
              isCritical
                ? "border-danger/30 bg-danger/5"
                : isWarning
                  ? "border-warning/30 bg-warning/5"
                  : isNear
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold">{r.category}</span>
                {isCritical && (
                  <span className="rounded-full bg-danger text-white text-xs px-2 py-0.5 font-medium">
                    Over budget
                  </span>
                )}
                {isWarning && (
                  <span className="rounded-full bg-warning text-white text-xs px-2 py-0.5 font-medium">
                    Warning
                  </span>
                )}
                {isNear && (
                  <span className="rounded-full bg-accent text-white text-xs px-2 py-0.5 font-medium">
                    Near limit
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-sm font-bold ${isCritical ? "text-danger" : isWarning ? "text-warning" : isNear ? "text-accent" : "text-foreground"}`}
                >
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
                  className={`h-2.5 rounded-full transition-all ${isCritical ? "bg-danger" : isWarning ? "bg-warning" : isNear ? "bg-accent" : "bg-success"}`}
                  style={{ width: `${r.pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{r.pct.toFixed(0)}% used</span>
                {isCritical ? (
                  <span className="text-danger font-medium">
                    Over by {formatCurrency(r.overflow, currencyCode)}
                  </span>
                ) : isWarning ? (
                  <span className="text-warning font-medium">
                    Getting close to limit
                  </span>
                ) : isNear ? (
                  <span className="text-accent font-medium">Near limit</span>
                ) : (
                  <span>
                    {formatCurrency(r.limit_amount - r.spent, currencyCode)}{" "}
                    remaining
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
