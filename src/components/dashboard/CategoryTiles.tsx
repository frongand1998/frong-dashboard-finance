'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

type CategoryData = {
  category: string;
  income: number;
  expense: number;
  total: number;
};

export function CategoryTiles({
  categories,
  currencyCode = 'USD',
  showAll = false,
}: {
  categories: CategoryData[];
  currencyCode?: string;
  showAll?: boolean;
}) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No category data available
      </div>
    );
  }

  // Get categories to display
  const topCategories = showAll ? categories : categories.slice(0, 6);
  const maxTotal = Math.max(...topCategories.map(c => c.total));

  // Calculate size classes based on value
  const getSizeClass = (total: number, index: number) => {
    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
    
    // Top category gets col-span-2 if it's significantly larger
    if (index === 0 && percentage === 100 && topCategories.length > 1) {
      const secondPercentage = maxTotal > 0 ? (topCategories[1].total / maxTotal) * 100 : 0;
      if (secondPercentage < 50) {
        return 'sm:col-span-2';
      }
    }
    
    return '';
  };

  const getFontSize = (total: number) => {
    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
    if (percentage >= 80) return 'text-3xl';
    if (percentage >= 50) return 'text-2xl';
    return 'text-xl';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topCategories.map((cat, index) => {
        const percentage = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
        const isExpenseHeavy = cat.expense > cat.income;
        const sizeClass = getSizeClass(cat.total, index);
        const fontSize = getFontSize(cat.total);

        return (
          <Card key={cat.category} className={`overflow-hidden ${sizeClass}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '💰'}
                    </span>
                    <h3 className={`font-semibold capitalize ${percentage >= 80 ? 'text-base' : 'text-sm'}`}>
                      {cat.category}
                    </h3>
                  </div>
                  <p className={`${fontSize} font-bold mt-2`}>
                    {formatCurrency(cat.total, currencyCode)}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${
                  isExpenseHeavy ? 'bg-danger/10' : 'bg-success/10'
                }`}>
                  {isExpenseHeavy ? (
                    <TrendingDown className="w-4 h-4 text-danger" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-success" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                    isExpenseHeavy ? 'bg-danger' : 'bg-success'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Income/Expense breakdown */}
              <div className="flex justify-between text-xs text-muted-foreground">
                {cat.income > 0 && (
                  <div>
                    <span className="text-success">↑ </span>
                    {formatCurrency(cat.income, currencyCode)}
                  </div>
                )}
                {cat.expense > 0 && (
                  <div>
                    <span className="text-danger">↓ </span>
                    {formatCurrency(cat.expense, currencyCode)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
