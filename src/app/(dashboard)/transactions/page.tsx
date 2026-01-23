'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { getTransactions, deleteAllTransactions } from '@/server-actions/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Transaction } from '@/types';

export default function TransactionsPage() {
  const { currency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await getTransactions(200, 0);
        if (result.success) {
          const data = result.data || [];
          setAllTransactions(data);
          setTransactions(data);
        } else {
          setError(result.error || 'Failed to load transactions');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = [...allTransactions];

    if (startDate) {
      filtered = filtered.filter(tx => tx.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(tx => tx.date <= endDate);
    }

    setTransactions(filtered);
  }, [startDate, endDate, allTransactions]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const result = await deleteAllTransactions();
      
      if (result.success) {
        setAllTransactions([]);
        setTransactions([]);
        setShowDeleteConfirm(false);
      } else {
        setError(result.error || 'Failed to delete transactions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all your income and expenses
            </p>
          </div>
          <div className="flex gap-3">
            {allTransactions.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            )}
            <Link href="/add">
              <Button variant="primary">Add Transaction</Button>
            </Link>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-danger flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Delete All Transactions?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This will permanently delete <strong>{allTransactions.length} transaction{allTransactions.length !== 1 ? 's' : ''}</strong>.
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleDeleteAll}
                    disabled={isDeleting}
                    className="flex-1 bg-danger hover:bg-danger/90"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete All'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {/* Date Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Date Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              {(startDate || endDate) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="whitespace-nowrap"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
            {allTransactions.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Showing {transactions.length} of {allTransactions.length} transactions
              </p>
            )}
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground mb-4">
                  {allTransactions.length === 0 ? 'No transactions yet' : 'No transactions match the selected filters'}
                </p>
                {allTransactions.length === 0 && (
                  <Link href="/add">
                    <Button variant="primary">Add Your First Transaction</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Category</th>
                      <th className="text-left py-3 px-2">Type</th>
                      <th className="text-right py-3 px-2">Amount</th>
                      <th className="text-left py-3 px-2">Note</th>
                      <th className="text-right py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-4 px-2 text-sm">{formatDate(tx.date)}</td>
                        <td className="py-4 px-2">
                          <Badge variant="default">{tx.category}</Badge>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className={`py-4 px-2 text-right font-semibold ${
                          tx.type === 'income' ? 'text-success' : 'text-danger'
                        }`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency.code)}
                        </td>
                        <td className="py-4 px-2 text-sm text-muted-foreground max-w-xs truncate">
                          {tx.note || '-'}
                        </td>
                        <td className="py-4 px-2 text-right">
                          <Link href={`/edit/${tx.id}`}>
                            <Button variant="ghost" className="text-xs px-3 py-1">
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {transactions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(
                      transactions
                        .filter(tx => tx.type === 'income')
                        .reduce((sum, tx) => sum + tx.amount, 0),
                      currency.code
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-danger">
                    {formatCurrency(
                      transactions
                        .filter(tx => tx.type === 'expense')
                        .reduce((sum, tx) => sum + tx.amount, 0),
                      currency.code
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net</p>
                  <p className={`text-2xl font-bold ${
                    transactions.reduce((sum, tx) => 
                      sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0
                    ) >= 0 ? 'text-success' : 'text-danger'
                  }`}>
                    {formatCurrency(
                      Math.abs(transactions.reduce((sum, tx) => 
                        sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0
                      )),
                      currency.code
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
