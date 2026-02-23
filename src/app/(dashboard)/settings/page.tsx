'use client';

import { useEffect, useRef, useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';
import { getBudgets, upsertBudget, deleteBudget } from '@/server-actions/budgets';
import { getCategorySummary } from '@/server-actions/categories';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, Pencil, Check, X, Wallet } from 'lucide-react';
import type { Budget } from '@/types';

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();

  // Budget state
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [addError, setAddError] = useState('');
  const newCategoryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const [budgetRes, catRes] = await Promise.all([
        getBudgets(currentMonth),
        getCategorySummary(), // all-time for category suggestions
      ]);
      if (budgetRes.success) setBudgets(budgetRes.data);
      if (catRes.success && catRes.data) {
        const existing = new Set((budgetRes.data ?? []).map((b) => b.category.toLowerCase()));
        setKnownCategories(
          (catRes.data as { category: string }[])
            .map((c) => c.category)
            .filter((c) => !existing.has(c.toLowerCase()))
        );
      }
      setBudgetLoading(false);
    };
    load();
  }, []);

  const handleAdd = async () => {
    setAddError('');
    const cat = newCategory.trim();
    const amount = parseFloat(newAmount);
    if (!cat) return setAddError('Category is required.');
    if (!amount || amount <= 0) return setAddError('Enter a valid amount.');
    if (budgets.some((b) => b.category.toLowerCase() === cat.toLowerCase())) {
      return setAddError('A budget for this category already exists. Edit it below.');
    }

    setSavingId('new');
    const res = await upsertBudget(cat, amount, currentMonth);
    if (res.success && res.data) {
      setBudgets((prev) => [...prev, res.data!].sort((a, b) => a.category.localeCompare(b.category)));
      setKnownCategories((prev) => prev.filter((c) => c.toLowerCase() !== cat.toLowerCase()));
      setNewCategory('');
      setNewAmount('');
    } else {
      setAddError(res.error ?? 'Failed to save.');
    }
    setSavingId(null);
  };

  const handleEdit = async (b: Budget) => {
    const amount = parseFloat(editAmount);
    if (!amount || amount <= 0) return;
    setSavingId(b.id);
    const res = await upsertBudget(b.category, amount, currentMonth);
    if (res.success && res.data) {
      setBudgets((prev) => prev.map((x) => (x.id === b.id ? { ...x, limit_amount: amount } : x)));
      setEditingId(null);
    }
    setSavingId(null);
  };

  const handleDelete = async (b: Budget) => {
    setSavingId(b.id);
    const res = await deleteBudget(b.id);
    if (res.success) {
      setBudgets((prev) => prev.filter((x) => x.id !== b.id));
      setKnownCategories((prev) => [...prev, b.category].sort());
    }
    setSavingId(null);
  };

  return (
    <PageShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your preferences</p>
        </div>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Select your preferred currency for displaying amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">Display Currency</label>
              <select
                id="currency"
                value={currency.code}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  if (selected) setCurrency(selected);
                }}
                className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Current: {currency.symbol} {currency.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how amounts will be displayed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Income:</span>
                <span className="font-semibold text-success">
                  +{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(5000)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expense:</span>
                <span className="font-semibold text-danger">
                  -{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(1250)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Limits */}
        <div id="budgets">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" />
              <div>
                <CardTitle>Budget Limits</CardTitle>
                <CardDescription>
                  Set monthly spending caps per category — tracked on your dashboard.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current budgets list */}
            {budgetLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : budgets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No budgets set yet. Add one below.</p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                {budgets.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <span className="flex-1 text-sm font-medium truncate">{b.category}</span>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-28 rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                          min="1"
                          step="1"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(b); if (e.key === 'Escape') setEditingId(null); }}
                        />
                        <Button
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          disabled={savingId === b.id}
                          onClick={() => handleEdit(b)}
                        >
                          <Check className="w-4 h-4 text-success" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(b.limit_amount, currency.code)}
                        </span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                        <Button
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          onClick={() => { setEditingId(b.id); setEditAmount(String(b.limit_amount)); }}
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-8 h-8 p-0"
                          disabled={savingId === b.id}
                          onClick={() => handleDelete(b)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add budget form */}
            <div className="rounded-xl border border-dashed border-border p-4 space-y-3">
              <p className="text-sm font-medium">Add budget</p>
              <div className="flex gap-2 items-start flex-col sm:flex-row">
                <div className="flex-1 w-full">
                  <input
                    ref={newCategoryRef}
                    list="category-list"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Category (e.g. Food)"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                  />
                  <datalist id="category-list">
                    {knownCategories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="Monthly limit"
                    min="1"
                    step="1"
                    className="w-36 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                  />
                  <Button
                    variant="primary"
                    onClick={handleAdd}
                    disabled={savingId === 'new'}
                    className="gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                </div>
              </div>
              {addError && <p className="text-xs text-danger">{addError}</p>}
              <p className="text-xs text-muted-foreground">
                Budget month: <span className="font-medium">{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </PageShell>
  );
}
