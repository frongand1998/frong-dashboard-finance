'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema, type TransactionFormData } from '@/lib/validators/transaction';
import { getTransactionById, updateTransaction } from '@/server-actions/transactions';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditTransactionPage() {
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
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const type = watch('type');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const result = await getTransactionById(id);
        if (result.success && result.data) {
          setValue('type', result.data.type);
          setValue('category', result.data.category);
          setValue('amount', result.data.amount);
          setValue('date', result.data.date);
          setValue('note', result.data.note || '');
        } else {
          setError(result.error || 'Failed to load transaction');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id, setValue]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await updateTransaction(id, data);

      if (result.success) {
        router.push('/transactions');
      } else {
        setError(result.error || 'Failed to update transaction');
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
          <h1 className="text-3xl font-bold">Edit Transaction</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your transaction details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="income"
                      {...register('type')}
                      className="w-4 h-4 text-success"
                    />
                    <span className="text-sm">Income</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="expense"
                      {...register('type')}
                      className="w-4 h-4 text-danger"
                    />
                    <span className="text-sm">Expense</span>
                  </label>
                </div>
                {errors.type && (
                  <p className="text-sm text-danger">{errors.type.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  {...register('category')}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="e.g., Salary, Food, Transport"
                />
                {errors.category && (
                  <p className="text-sm text-danger">{errors.category.message}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-sm text-danger">{errors.amount.message}</p>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  {...register('date')}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {errors.date && (
                  <p className="text-sm text-danger">{errors.date.message}</p>
                )}
              </div>

              {/* Note */}
              <div className="space-y-2">
                <label htmlFor="note" className="text-sm font-medium">
                  Note (Optional)
                </label>
                <textarea
                  id="note"
                  {...register('note')}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  rows={3}
                  placeholder="Add any additional details..."
                />
                {errors.note && (
                  <p className="text-sm text-danger">{errors.note.message}</p>
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
                  onClick={() => router.push('/transactions')}
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
