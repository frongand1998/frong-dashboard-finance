'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getGoals, deleteGoal } from '@/server-actions/goals';
import { formatCurrency } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Goal } from '@/types';

export default function GoalsPage() {
  const { currency } = useCurrency();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const result = await getGoals();
      if (result.success) {
        setGoals(result.data || []);
      } else {
        setError(result.error || 'Failed to load goals');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      setDeleting(id);
      const result = await deleteGoal(id);
      if (result.success) {
        setGoals(goals.filter(g => g.id !== id));
      } else {
        alert(result.error || 'Failed to delete goal');
      }
    } catch (err) {
      alert('An unexpected error occurred');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Goals</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set and track your financial targets
            </p>
          </div>
          <Link href="/add-goal">
            <Button variant="primary">Add Goal</Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Start setting financial targets to track your progress
                </p>
                <Link href="/add-goal">
                  <Button variant="primary">Add Your First Goal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {goals.map((goal) => {
              const progress = goal.target_amount > 0 
                ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) 
                : 0;
              const remaining = goal.target_amount - goal.current_amount;
              const isCompleted = goal.current_amount >= goal.target_amount;

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="capitalize">{goal.name}</CardTitle>
                        {goal.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(goal.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isCompleted && (
                        <span className="text-2xl">✅</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                            isCompleted ? 'bg-success' : 'bg-accent'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(goal.current_amount, currency.code)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-lg font-bold">
                          {formatCurrency(goal.target_amount, currency.code)}
                        </p>
                      </div>
                    </div>

                    {!isCompleted && (
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="text-xl font-bold text-accent">
                          {formatCurrency(remaining, currency.code)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/edit-goal/${goal.id}`} className="flex-1">
                        <Button variant="ghost" className="w-full text-sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => handleDelete(goal.id)}
                        disabled={deleting === goal.id}
                        className="text-sm text-danger hover:text-danger"
                      >
                        {deleting === goal.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
