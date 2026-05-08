"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, Wallet, X } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import { getCategorySummary } from "@/server-actions/categories";
import {
  deleteBudget,
  getBudgets,
  upsertBudget,
} from "@/server-actions/budgets";
import { formatCurrency } from "@/lib/utils";
import type { Budget } from "@/types";

type CategorySpend = {
  category: string;
  expense: number;
};

export default function LimitsPage() {
  const { currency } = useCurrency();
  const { t } = useI18n();
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [categorySpends, setCategorySpends] = useState<CategorySpend[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [addError, setAddError] = useState("");
  const newCategoryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const currentMonthStart = `${currentMonth}-01`;
      const lastDay = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
      ).getDate();
      const currentMonthEnd = `${currentMonth}-${String(lastDay).padStart(2, "0")}`;

      const [budgetRes, spendRes, categoryRes] = await Promise.all([
        getBudgets(currentMonth),
        getCategorySummary(currentMonthStart, currentMonthEnd),
        getCategorySummary(),
      ]);

      const budgetData = budgetRes.success ? budgetRes.data : [];
      setBudgets(budgetData);
      setCategorySpends(
        spendRes.success ? (spendRes.data as CategorySpend[]) || [] : [],
      );

      if (categoryRes.success && categoryRes.data) {
        const existing = new Set(
          budgetData.map((budget) => budget.category.toLowerCase()),
        );

        setKnownCategories(
          (categoryRes.data as { category: string }[])
            .map((item) => item.category)
            .filter((category) => !existing.has(category.toLowerCase())),
        );
      }

      setLoading(false);
    };

    load();
  }, [currentMonth]);

  const handleAdd = async () => {
    setAddError("");

    const category = newCategory.trim();
    const amount = Number(newAmount);

    if (!category) {
      setAddError(t.settings.categoryRequired);
      newCategoryRef.current?.focus();
      return;
    }

    if (!amount || amount <= 0) {
      setAddError(t.settings.amountRequired);
      return;
    }

    if (
      budgets.some(
        (budget) => budget.category.toLowerCase() === category.toLowerCase(),
      )
    ) {
      setAddError(t.settings.duplicateBudget);
      return;
    }

    setSavingId("new");
    const result = await upsertBudget(category, amount, currentMonth);

    if (result.success && result.data) {
      setBudgets((current) =>
        [...current, result.data].sort((left, right) =>
          left.category.localeCompare(right.category),
        ),
      );
      setKnownCategories((current) =>
        current.filter((item) => item.toLowerCase() !== category.toLowerCase()),
      );
      setNewCategory("");
      setNewAmount("");
      return;
    }

    setAddError(result.error ?? t.settings.saveFailed);
    setSavingId(null);
  };

  const handleEdit = async (budget: Budget) => {
    const amount = Number(editAmount);
    if (!amount || amount <= 0) return;

    setSavingId(budget.id);
    const result = await upsertBudget(budget.category, amount, currentMonth);

    if (result.success) {
      setBudgets((current) =>
        current.map((item) =>
          item.id === budget.id ? { ...item, limit_amount: amount } : item,
        ),
      );
      setEditingId(null);
    }

    setSavingId(null);
  };

  const handleDelete = async (budget: Budget) => {
    setSavingId(budget.id);
    const result = await deleteBudget(budget.id);

    if (result.success) {
      setBudgets((current) => current.filter((item) => item.id !== budget.id));
      setKnownCategories((current) => [...current, budget.category].sort());
    }

    setSavingId(null);
  };

  return (
    <PageShell>
      <div className="mx-auto min-w-0 w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            {t.settings.budgetLimits}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.settings.budgetDescription}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <CardTitle>{t.dashboard.budgetProgress}</CardTitle>
                <CardDescription>
                  {new Date(`${currentMonth}-01`).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <input
                  type="month"
                  value={currentMonth}
                  onChange={(event) => setCurrentMonth(event.target.value)}
                  className="h-11 rounded-lg border border-border bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {budgets.length}{" "}
                  {budgets.length === 1
                    ? t.settings.limitSingle
                    : t.settings.limitPlural}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : (
              <BudgetProgress
                budgets={budgets}
                categorySpends={categorySpends}
                currencyCode={currency.code}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              <div>
                <CardTitle>{t.settings.addBudget}</CardTitle>
                <CardDescription>
                  {t.settings.budgetDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-12 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                {t.dashboard.noBudgets}
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="divide-y divide-border">
                  {budgets.map((budget) => (
                    <div
                      key={budget.id}
                      className="flex flex-col gap-3 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {budget.category}
                      </span>

                      {editingId === budget.id ? (
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(event) =>
                              setEditAmount(event.target.value)
                            }
                            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent sm:w-32"
                            min="1"
                            step="1"
                            autoFocus
                            onKeyDown={(event) => {
                              if (event.key === "Enter") handleEdit(budget);
                              if (event.key === "Escape") setEditingId(null);
                            }}
                          />
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0"
                            disabled={savingId === budget.id}
                            onClick={() => handleEdit(budget)}
                          >
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-10 w-10 p-0"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(budget.limit_amount, currency.code)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            /mo
                          </span>
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            onClick={() => {
                              setEditingId(budget.id);
                              setEditAmount(String(budget.limit_amount));
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="h-9 w-9 p-0"
                            disabled={savingId === budget.id}
                            onClick={() => handleDelete(budget)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-danger" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 rounded-xl border border-dashed border-border p-4">
              <p className="text-sm font-medium text-foreground">
                {t.settings.addBudget}
              </p>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="w-full flex-1">
                  <input
                    ref={newCategoryRef}
                    list="limit-category-list"
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder={t.addTransaction.categoryPlaceholder}
                    className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleAdd();
                    }}
                  />
                  <datalist id="limit-category-list">
                    {knownCategories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(event) => setNewAmount(event.target.value)}
                    placeholder={t.settings.monthlyLimit}
                    min="1"
                    step="1"
                    className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-accent sm:w-40"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleAdd();
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={savingId === "new"}
                    className="shrink-0 gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    {t.common.add}
                  </Button>
                </div>
              </div>

              {addError && <p className="text-xs text-danger">{addError}</p>}

              <p className="text-xs text-muted-foreground">
                {t.settings.activeBudgetMonth}:{" "}
                <span className="font-medium">
                  {new Date(`${currentMonth}-01`).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
