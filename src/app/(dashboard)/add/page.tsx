'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/transaction/ImageUpload';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import { createTransaction, getTransactions } from '@/server-actions/transactions';
import { getCategories } from '@/server-actions/categories';
import { getOcrUsage, recordOcrUsage } from '@/server-actions/ocr-usage';
import { transactionSchema, type TransactionFormData } from '@/lib/validators/transaction';
import { performOCR, type OcrUsageInfo } from '@/lib/ocr/parser';

export default function AddRecordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [payslipImages, setPayslipImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [extractedTransactions, setExtractedTransactions] = useState<any[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ reference: string; date: string } | null>(null);
  const [pendingExtractedData, setPendingExtractedData] = useState<any>(null);
  const [ocrUsage, setOcrUsage] = useState<OcrUsageInfo | null>(null);
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories();
      if (result.success) {
        setCategories(result.data);
      }
    };
    fetchCategories();

    // Fetch OCR usage info
    const fetchOcrUsage = async () => {
      const result = await getOcrUsage();
      if (result.success && result.data) {
        setOcrUsage(result.data);
      }
    };
    fetchOcrUsage();
  }, []);

  const handleImagesSelect = async (files: File[]) => {
    // Check if user has enough OCR scans
    if (ocrUsage && files.length > ocrUsage.remaining) {
      alert(`You only have ${ocrUsage.remaining} OCR scans remaining. Please upload ${ocrUsage.remaining} or fewer images.`);
      return;
    }

    // Create previews for all files
    const newPreviews: string[] = [];
    for (const file of files) {
      const reader = new FileReader();
      const preview = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newPreviews.push(preview);
    }

    setPayslipImages([...payslipImages, ...files]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleImageRemove = (index: number) => {
    setPayslipImages(payslipImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleProcessSlips = async () => {
    if (payslipImages.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProcessingProgress({ current: 0, total: payslipImages.length });
    const transactions: any[] = [];

    try {
      for (let i = 0; i < payslipImages.length; i++) {
        const file = payslipImages[i];
        setProcessingProgress({ current: i + 1, total: payslipImages.length });

        // Record OCR usage
        const usageResult = await recordOcrUsage();
        if (!usageResult.success) {
          console.error(`Failed to record usage for slip ${i + 1}:`, usageResult.error);
          continue;
        }

        // Update OCR usage
        if (ocrUsage && typeof usageResult.remainingScans === 'number') {
          setOcrUsage({ ...ocrUsage, remaining: usageResult.remainingScans, used: ocrUsage.used + 1 });
        }

        // Perform OCR
        const extractedData = await performOCR(file);

        // Check for duplicates
        if (extractedData.reference && extractedData.reference.trim()) {
          const txResult = await getTransactions(200, 0);
          if (txResult.success && txResult.data) {
            const duplicate = txResult.data.find(tx => 
              tx.note?.includes(extractedData.reference!)
            );
            
            if (duplicate) {
              extractedData.note = (extractedData.note || '') + ' (Duplicate)';
            }
          }
        }

        transactions.push(extractedData);
      }

      setExtractedTransactions(transactions);
      setOcrSuccess(true);
      
      // Auto-fill form with first transaction
      if (transactions.length > 0) {
        const firstTx = transactions[0];
        if (firstTx.amount) setValue('amount', firstTx.amount);
        if (firstTx.date) setValue('date', firstTx.date);
        if (firstTx.type) setValue('type', firstTx.type);
        if (firstTx.category) setValue('category', firstTx.category);
        if (firstTx.note) setValue('note', firstTx.note);
      }

      setTimeout(() => setOcrSuccess(false), 3000);
    } catch (err) {
      console.error('Batch OCR failed:', err);
      setError('Failed to process some slips. Check console for details.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress({ current: 0, total: 0 });
    }
  };

  const handleCreateAllTransactions = async () => {
    if (extractedTransactions.length === 0) return;

    setIsSubmitting(true);
    let successCount = 0;
    let failCount = 0;
    const failedReasons: string[] = [];

    for (const txData of extractedTransactions) {
      try {
        const amountValue = typeof txData.amount === 'number'
          ? txData.amount
          : Number(txData.amount);

        if (!amountValue || Number.isNaN(amountValue) || amountValue <= 0) {
          failCount++;
          failedReasons.push('Missing or invalid amount');
          continue;
        }

        const normalizedData: TransactionFormData = {
          type: txData.type || 'expense',
          category: txData.category || 'Uncategorized',
          amount: amountValue,
          date: txData.date || new Date().toISOString().split('T')[0],
          note: txData.note || undefined,
        };

        const result = await createTransaction(normalizedData);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          failedReasons.push(result.error || 'Failed to create transaction');
        }
      } catch (err) {
        failCount++;
        failedReasons.push('Unexpected error while creating transaction');
      }
    }

    setIsSubmitting(false);
    
    if (successCount > 0) {
      setSuccess(true);
      reset();
      setPayslipImages([]);
      setImagePreviews([]);
      setExtractedTransactions([]);
      
      alert(`✅ ${successCount} transactions created successfully!${failCount > 0 ? `\n⚠️ ${failCount} failed.` : ''}`);
      
      setTimeout(() => {
        router.push('/transactions');
      }, 1500);
    } else {
      const uniqueReasons = Array.from(new Set(failedReasons));
      setError(`Failed to create transactions. ${uniqueReasons.join(' • ')}`);
    }
  };

  const handleClearAll = () => {
    setPayslipImages([]);
    setImagePreviews([]);
    setExtractedTransactions([]);
    setOcrSuccess(false);
  };

  const handleRemoveExtractedTransaction = (index: number) => {
    setExtractedTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelDuplicate = async () => {
    // User cancelled - remove image
    setPayslipImages([]);
    setImagePreviews([]);
    setShowDuplicateWarning(false);
    setDuplicateInfo(null);
    setPendingExtractedData(null);
    
    // Refresh OCR usage
    const result = await getOcrUsage();
    if (result.success && result.data) {
      setOcrUsage(result.data);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const result = await createTransaction(data);

      if (result.success) {
        setSuccess(true);
        reset();
        setPayslipImages([]);
        setImagePreviews([]);
        
        setTimeout(() => {
          router.push('/transactions');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create transaction');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-2xl w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add Transaction</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record a new income or expense entry
          </p>
        </div>

        {/* Duplicate Slip Warning Modal */}
        {showDuplicateWarning && duplicateInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Duplicate Payment Slip Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This payment slip appears to have been uploaded before.
                </p>
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <p className="text-sm">
                    <strong>Reference:</strong> {duplicateInfo.reference}
                  </p>
                  <p className="text-sm">
                    <strong>Previous transaction date:</strong> {new Date(duplicateInfo.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Do you want to create a new transaction anyway?
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleCancelDuplicate}
                    className="flex-1"
                  >
                    Cancel & Remove Image
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setShowDuplicateWarning(false);
                      handleProcessSlips();
                    }}
                    className="flex-1"
                  >
                    Proceed Anyway
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* OCR Limit Warning Modal */}
        {showLimitWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Monthly OCR Limit Reached
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You've used all your free OCR scans for this month.
                </p>
                <div className="bg-muted p-3 rounded-lg space-y-1">
                  <p className="text-sm">
                    <strong>Monthly Limit:</strong> {ocrUsage?.limit} scans
                  </p>
                  <p className="text-sm">
                    <strong>Used:</strong> {ocrUsage?.used} scans
                  </p>
                  <p className="text-sm">
                    <strong>Resets on:</strong> {ocrUsage?.resetDate ? new Date(ocrUsage.resetDate).toLocaleDateString() : 'Next month'}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  You can still add transactions manually by filling out the form below.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowLimitWarning(false);
                    setPayslipImages([]);
                    setImagePreviews([]);
                  }}
                  className="w-full"
                >
                  OK, I'll Add Manually
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            {isProcessing && (
              <p className="text-sm text-accent animate-pulse">
                🔍 Extracting data from image...
              </p>
            )}
            {ocrSuccess && (
              <p className="text-sm text-success">
                ✅ Data extracted successfully! Review and submit.
              </p>
            )}
            {ocrUsage && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>
                  OCR Scans: {ocrUsage.remaining} of {ocrUsage.limit} remaining this month
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="income"
                      {...register('type')}
                      className="w-4 h-4 text-accent"
                    />
                    <span className="text-sm">Income</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="expense"
                      {...register('type')}
                      className="w-4 h-4 text-accent"
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
                  list="category-suggestions"
                  placeholder="e.g., Groceries, Salary, Utilities"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  autoComplete="off"
                />
                <datalist id="category-suggestions">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
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
                  placeholder="0.00"
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
                  Note (optional)
                </label>
                <textarea
                  id="note"
                  {...register('note')}
                  placeholder="Add any additional details..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                {errors.note && (
                  <p className="text-sm text-danger">{errors.note.message}</p>
                )}
              </div>

              {/* Payslip Image Upload */}
              <div className="pt-4 border-t border-border space-y-3">
                <ImageUpload
                  onImagesSelect={handleImagesSelect}
                  onImageRemove={handleImageRemove}
                  previews={imagePreviews}
                  maxFiles={10}
                />
                
                {/* Batch Processing Controls */}
                {imagePreviews.length > 0 && (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleProcessSlips}
                      disabled={isProcessing || extractedTransactions.length > 0}
                      variant="primary"
                      className="flex-1"
                    >
                      {isProcessing
                        ? `Processing ${processingProgress.current}/${processingProgress.total}...`
                        : `Process ${imagePreviews.length} Slip${imagePreviews.length > 1 ? 's' : ''}`
                      }
                    </Button>
                    <Button
                      type="button"
                      onClick={handleClearAll}
                      disabled={isProcessing}
                      variant="ghost"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Extracted Transactions Summary */}
                {extractedTransactions.length > 0 && (
                  <div className="bg-accent/10 rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h4 className="text-sm font-medium">
                        ✅ {extractedTransactions.length} Transaction{extractedTransactions.length > 1 ? 's' : ''} Extracted
                      </h4>
                      <Button
                        type="button"
                        onClick={handleCreateAllTransactions}
                        disabled={isSubmitting}
                        variant="primary"
                        size="sm"
                      >
                        {isSubmitting ? 'Creating...' : `Create All ${extractedTransactions.length}`}
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {extractedTransactions.map((tx, idx) => (
                        <div key={idx} className="bg-white rounded p-2 text-xs flex justify-between items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">#{idx + 1}</span>
                            {tx.merchant && <span className="ml-2 truncate">{tx.merchant}</span>}
                            {tx.amount && <span className="ml-2 text-accent font-bold">฿{tx.amount}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground whitespace-nowrap">
                              {tx.date || 'No date'}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExtractedTransaction(idx)}
                              className="h-7 w-7 p-0 text-danger hover:bg-danger/10"
                              aria-label={`Remove transaction ${idx + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-danger/10 p-4 text-sm text-danger">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="rounded-lg bg-success/10 p-4 text-sm text-success">
                  Transaction added successfully! Redirecting...
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isProcessing}
                  className="flex-1"
                >
                  {isSubmitting ? 'Adding...' : isProcessing ? 'Processing...' : 'Add Transaction'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  disabled={isSubmitting || isProcessing}
                  className="w-full sm:w-auto"
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
