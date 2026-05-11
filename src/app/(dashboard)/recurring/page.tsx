"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Pause,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { useI18n } from "@/contexts/I18nContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  createRecurringRule,
  deleteRecurringRule,
  getRecurringRules,
  runDueRecurringForCurrentUser,
  runRecurringRuleNow,
  toggleRecurringRule,
  updateRecurringRule,
} from "@/server-actions/recurring";
import { getCategories } from "@/server-actions/categories";
import { formatCurrency } from "@/lib/utils";
import type {
  RecurringFrequency,
  RecurringRule,
  TransactionType,
} from "@/types";

type RecurringFormState = {
  name: string;
  type: TransactionType;
  category: string;
  amount: string;
  frequency: RecurringFrequency;
  startDate: string;
  note: string;
};

const getDefaultForm = (): RecurringFormState => ({
  name: "",
  type: "expense",
  category: "",
  amount: "",
  frequency: "monthly",
  startDate: new Date().toISOString().slice(0, 10),
  note: "",
});

export default function RecurringPage() {
  const { t } = useI18n();
  const { currency } = useCurrency();
  const { toasts, toast, dismiss } = useToast();
  const [form, setForm] = useState<RecurringFormState>(getDefaultForm());
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runningDue, setRunningDue] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] =
    useState<RecurringFormState>(getDefaultForm());
  const [savingEdit, setSavingEdit] = useState(false);

  const editingRule = useMemo(
    () => rules.find((rule) => rule.id === editingId) || null,
    [rules, editingId],
  );

  const loadData = async () => {
    setLoading(true);
    const [rulesResult, categoriesResult] = await Promise.all([
      getRecurringRules(),
      getCategories(),
    ]);

    if (rulesResult.success) {
      setRules(rulesResult.data || []);
    } else {
      toast(rulesResult.error || t.errors.loadFailed, "error");
    }

    if (categoriesResult.success) {
      setCategories(categoriesResult.data || []);
      if (!form.category && (categoriesResult.data || []).length > 0) {
        setForm((prev) => ({ ...prev, category: categoriesResult.data[0] }));
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editingRule) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancelEdit();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [editingRule]);

  const sortedRules = useMemo(
    () =>
      [...rules].sort((a, b) => {
        if (a.is_active !== b.is_active) {
          return a.is_active ? -1 : 1;
        }
        return a.next_run_on.localeCompare(b.next_run_on);
      }),
    [rules],
  );

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const parsedAmount = Number(form.amount);

    const result = await createRecurringRule({
      name: form.name,
      type: form.type,
      category: form.category,
      amount: parsedAmount,
      frequency: form.frequency,
      startDate: form.startDate,
      note: form.note || undefined,
      isActive: true,
    });

    setCreating(false);

    if (!result.success) {
      toast(result.error || t.recurringPage.createFailed, "error");
      return;
    }

    toast(t.recurringPage.createSuccess, "success");
    setForm(getDefaultForm());
    await loadData();
  };

  const onToggle = async (rule: RecurringRule) => {
    setBusyId(rule.id);
    const result = await toggleRecurringRule(rule.id, !rule.is_active);
    setBusyId(null);

    if (!result.success) {
      toast(result.error || t.recurringPage.updateFailed, "error");
      return;
    }

    setRules((prev) =>
      prev.map((item) =>
        item.id === rule.id ? { ...item, is_active: !item.is_active } : item,
      ),
    );
  };

  const onDelete = async (rule: RecurringRule) => {
    if (!confirm(t.recurringPage.deleteConfirm)) return;
    setBusyId(rule.id);
    const result = await deleteRecurringRule(rule.id);
    setBusyId(null);

    if (!result.success) {
      toast(result.error || t.recurringPage.deleteFailed, "error");
      return;
    }

    toast(t.recurringPage.deleteSuccess, "success");
    setRules((prev) => prev.filter((item) => item.id !== rule.id));
  };

  const onRunNow = async (rule: RecurringRule) => {
    setBusyId(rule.id);
    const result = await runRecurringRuleNow(rule.id);
    setBusyId(null);

    if (!result.success) {
      toast(result.error || t.recurringPage.runFailed, "error");
      return;
    }

    toast(t.recurringPage.runSuccess, "success");
    await loadData();
  };

  const onRunDue = async () => {
    setRunningDue(true);
    const result = await runDueRecurringForCurrentUser();
    setRunningDue(false);

    if (!result.success) {
      toast(result.error || t.recurringPage.runFailed, "error");
      return;
    }

    const processedRules =
      "processedRules" in result ? result.processedRules : 0;
    const createdTransactions =
      "createdTransactions" in result ? result.createdTransactions : 0;
    const summary = t.recurringPage.runDueSummary
      .replace("{rules}", String(processedRules))
      .replace("{transactions}", String(createdTransactions));
    toast(summary, "success");
    await loadData();
  };

  const onStartEdit = (rule: RecurringRule) => {
    setEditingId(rule.id);
    setEditForm({
      name: rule.name,
      type: rule.type,
      category: rule.category,
      amount: String(rule.amount),
      frequency: rule.frequency,
      startDate: rule.start_date,
      note: rule.note || "",
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditForm(getDefaultForm());
  };

  const onSaveEdit = async () => {
    if (!editingRule) return;

    setBusyId(editingRule.id);
    setSavingEdit(true);

    const result = await updateRecurringRule(editingRule.id, {
      name: editForm.name,
      type: editForm.type,
      category: editForm.category,
      amount: Number(editForm.amount),
      frequency: editForm.frequency,
      startDate: editForm.startDate,
      note: editForm.note || undefined,
      isActive: editingRule.is_active,
    });

    setBusyId(null);
    setSavingEdit(false);

    if (!result.success) {
      toast(result.error || t.recurringPage.updateFailed, "error");
      return;
    }

    toast(t.recurringPage.updateSuccess, "success");
    onCancelEdit();
    await loadData();
  };

  return (
    <PageShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      {editingRule && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          onClick={onCancelEdit}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-border bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {t.common.edit} {t.recurringPage.ruleName}
              </h2>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onCancelEdit}
                disabled={savingEdit}
              >
                {t.common.close}
              </Button>
            </div>

            <div className="p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.recurringPage.ruleName}
                  </label>
                  <input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.common.type}
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        type: e.target.value as TransactionType,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="expense">{t.transactionType.expense}</option>
                    <option value="income">{t.transactionType.income}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.common.category}
                  </label>
                  <input
                    list="recurring-categories"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.common.amount}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.recurringPage.frequency}
                  </label>
                  <select
                    value={editForm.frequency}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        frequency: e.target.value as RecurringFrequency,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="daily">{t.recurringPage.daily}</option>
                    <option value="weekly">{t.recurringPage.weekly}</option>
                    <option value="monthly">{t.recurringPage.monthly}</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    {t.recurringPage.startDate}
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">
                    {t.common.note}
                  </label>
                  <input
                    value={editForm.note}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="soft"
                onClick={onCancelEdit}
                disabled={savingEdit}
              >
                {t.common.cancel}
              </Button>
              <Button type="button" onClick={onSaveEdit} disabled={savingEdit}>
                {savingEdit ? t.common.loading : t.common.save}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.recurringPage.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.recurringPage.subtitle}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.recurringPage.createTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.recurringPage.ruleName}
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t.recurringPage.ruleNamePlaceholder}
                  required
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.common.type}
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as TransactionType,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="expense">{t.transactionType.expense}</option>
                  <option value="income">{t.transactionType.income}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.common.category}
                </label>
                <input
                  list="recurring-categories"
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <datalist id="recurring-categories">
                  {categories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.common.amount}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.recurringPage.frequency}
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      frequency: e.target.value as RecurringFrequency,
                    }))
                  }
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="daily">{t.recurringPage.daily}</option>
                  <option value="weekly">{t.recurringPage.weekly}</option>
                  <option value="monthly">{t.recurringPage.monthly}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t.recurringPage.startDate}
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                  required
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  {t.common.note}
                </label>
                <input
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? t.common.loading : t.common.add}
                </Button>
                <Button
                  type="button"
                  variant="soft"
                  onClick={onRunDue}
                  disabled={runningDue}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${runningDue ? "animate-spin" : ""}`}
                  />
                  {t.recurringPage.runDueNow}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5" />
              {t.nav.recurring}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                {t.common.loading}
              </p>
            ) : sortedRules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t.recurringPage.noRules}
              </p>
            ) : (
              <div className="space-y-3">
                {sortedRules.map((rule) => {
                  const isBusy = busyId === rule.id;
                  return (
                    <div
                      key={rule.id}
                      className="rounded-lg border border-border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
                          <span>{rule.type}</span>
                          <span>•</span>
                          <span>{rule.category}</span>
                          <span>•</span>
                          <span>
                            {formatCurrency(rule.amount, currency.code)}
                          </span>
                          <span>•</span>
                          <span>{t.recurringPage[rule.frequency]}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                          <span>
                            {t.recurringPage.nextRun}: {rule.next_run_on}
                          </span>
                          <span>•</span>
                          <span>
                            {t.recurringPage.lastRun}: {rule.last_run_on || "-"}
                          </span>
                          <span>•</span>
                          <span>
                            {rule.is_active
                              ? t.recurringPage.active
                              : t.recurringPage.paused}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            editingId === rule.id
                              ? onCancelEdit()
                              : onStartEdit(rule)
                          }
                          disabled={isBusy || savingEdit}
                          className="gap-1"
                        >
                          <Pencil className="w-4 h-4" />
                          {editingId === rule.id
                            ? t.common.cancel
                            : t.common.edit}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="soft"
                          onClick={() => onRunNow(rule)}
                          disabled={isBusy}
                        >
                          {t.recurringPage.runNow}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onToggle(rule)}
                          disabled={isBusy}
                          className="gap-1"
                        >
                          {rule.is_active ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          {rule.is_active
                            ? t.recurringPage.paused
                            : t.recurringPage.active}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(rule)}
                          disabled={isBusy}
                          className="text-danger gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t.common.delete}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
