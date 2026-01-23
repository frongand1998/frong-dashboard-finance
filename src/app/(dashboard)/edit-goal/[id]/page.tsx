'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { goalSchema, type GoalFormData } from '@/lib/validators/goal';
import { getGoals, updateGoal } from '@/server-actions/goals';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  });

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        setLoading(true);
        const result = await getGoals();
        if (result.success && result.data) {
          const goal = result.data.find(g => g.id === id);
          if (goal) {
            setValue('name', goal.name);
            setValue('target_amount', goal.target_amount);
            setValue('current_amount', goal.current_amount);
            if (goal.due_date) {
              setValue('due_date', goal.due_date);
            }
          } else {
            setError('Goal not found');
          }
        } else {
          setError(result.error || 'Failed to load goal');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGoal();
    }
  }, [id, setValue]);

  const onSubmit = async (data: GoalFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await updateGoal(id, data);

      if (result.success) {
        router.push('/goals');
      } else {
        setError(result.error || 'Failed to update goal');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Goal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your financial target
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Goal Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                />
                {errors.name && (
                  <p className="text-sm text-danger">{errors.name.message}</p>
                )}
              </div>

              {/* Target Amount */}
              <div className="space-y-2">
                <label htmlFor="target_amount" className="text-sm font-medium">
                  Target Amount
                </label>
                <input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  {...register('target_amount', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
                {errors.target_amount && (
                  <p className="text-sm text-danger">{errors.target_amount.message}</p>
                )}
              </div>

              {/* Current Amount */}
              <div className="space-y-2">
                <label htmlFor="current_amount" className="text-sm font-medium">
                  Current Amount
                </label>
                <input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  {...register('current_amount', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
                {errors.current_amount && (
                  <p className="text-sm text-danger">{errors.current_amount.message}</p>
                )}
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <label htmlFor="due_date" className="text-sm font-medium">
                  Deadline (Optional)
                </label>
                <input
                  id="due_date"
                  type="date"
                  {...register('due_date')}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {errors.due_date && (
                  <p className="text-sm text-danger">{errors.due_date.message}</p>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/goals')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
