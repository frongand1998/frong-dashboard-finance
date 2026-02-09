'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Search } from 'lucide-react';
import { getTransactions, deleteAllTransactions, deleteTransaction } from '@/server-actions/transactions';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Transaction } from '@/types';

export default function TransactionsPage() {
  const { currency } = useCurrency();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    const categoryParam = searchParams.get('category');
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');

    if (categoryParam) {
      setSearchTerm(categoryParam);
    }
    if (startParam) {
      setStartDate(startParam);
    }
    if (endParam) {
      setEndDate(endParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...allTransactions];

    if (startDate) {
      filtered = filtered.filter(tx => tx.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(tx => tx.date <= endDate);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.category.toLowerCase().includes(search) ||
        tx.note?.toLowerCase().includes(search) ||
        tx.amount.toString().includes(search) ||
        tx.type.toLowerCase().includes(search)
      );
    }

    setTransactions(filtered);
  }, [startDate, endDate, searchTerm, allTransactions]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const handleExportCSV = () => {
    // Create CSV header
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note'];
    
    // Create CSV rows
    const rows = transactions.map(tx => [
      formatDate(tx.date),
      tx.type,
      tx.category,
      tx.amount,
      tx.note || ''
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        // Escape quotes and wrap in quotes if contains comma
        typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))
          ? `"${cell.replace(/"/g, '""')}"`
          : cell
      ).join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleDeleteTransaction = async (id: string) => {
    const confirmed = window.confirm('Delete this transaction? This action cannot be undone.');
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      const result = await deleteTransaction(id);
      if (result.success) {
        setAllTransactions((prev) => prev.filter((tx) => tx.id !== id));
        setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      } else {
        setError(result.error || 'Failed to delete transaction');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all your income and expenses
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {transactions.length > 0 && (
              <Button
                variant="ghost"
                onClick={handleExportCSV}
                className="text-accent hover:bg-accent/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
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

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by category, note, amount, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Date Filters */}
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
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 px-6">
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
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  <div className="space-y-3 p-4">
                    {transactions.map((tx) => (
                      <Card key={tx.id} className="border-2 hover:border-accent/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default" className="text-xs">{tx.category}</Badge>
                                <Badge variant={tx.type === 'income' ? 'success' : 'danger'} className="text-xs">
                                  {tx.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                tx.type === 'income' ? 'text-success' : 'text-danger'
                              }`}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency.code)}
                              </p>
                            </div>
                          </div>
                          {tx.note && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {tx.note}
                            </p>
                          )}
                          <div className="flex justify-end gap-2">
                            <Link href={`/edit/${tx.id}`}>
                              <Button variant="ghost" className="text-xs h-8">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              className="text-xs h-8 text-danger hover:bg-danger/10"
                              onClick={() => handleDeleteTransaction(tx.id)}
                              disabled={deletingId === tx.id}
                            >
                              {deletingId === tx.id ? 'Deleting...' : 'Remove'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-sm text-muted-foreground bg-muted/30">
                        <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Date</th>
                        <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Category</th>
                        <th className="text-left py-3 px-4 font-medium whitespace-nowrap">Type</th>
                        <th className="text-right py-3 px-4 font-medium whitespace-nowrap">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Note</th>
                        <th className="text-right py-3 px-4 font-medium whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm whitespace-nowrap">{formatDate(tx.date)}</td>
                          <td className="py-3 px-4">
                            <Badge variant="default" className="text-xs">{tx.category}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={tx.type === 'income' ? 'success' : 'danger'} className="text-xs">
                              {tx.type}
                            </Badge>
                          </td>
                          <td className={`py-3 px-4 text-right font-semibold text-sm whitespace-nowrap ${
                            tx.type === 'income' ? 'text-success' : 'text-danger'
                          }`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency.code)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                            {tx.note || '-'}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <Link href={`/edit/${tx.id}`}>
                                <Button variant="ghost" className="text-xs px-2 py-1">
                                  Edit
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                className="text-xs px-2 py-1 text-danger hover:bg-danger/10"
                                onClick={() => handleDeleteTransaction(tx.id)}
                                disabled={deletingId === tx.id}
                              >
                                {deletingId === tx.id ? 'Deleting...' : 'Remove'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {transactions.length > 0 && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-xl sm:text-2xl font-bold text-success">
                    {formatCurrency(
                      transactions
                        .filter(tx => tx.type === 'income')
                        .reduce((sum, tx) => sum + tx.amount, 0),
                      currency.code
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-xl sm:text-2xl font-bold text-danger">
                    {formatCurrency(
                      transactions
                        .filter(tx => tx.type === 'expense')
                        .reduce((sum, tx) => sum + tx.amount, 0),
                      currency.code
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Net</p>
                  <p className={`text-xl sm:text-2xl font-bold ${
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
