'use client';

import { Button } from '@/components/ui/button';

export type DateRange = 'day' | 'week' | 'month' | 'year';

type Props = {
  selected: DateRange;
  onChange: (range: DateRange) => void;
};

export function DateRangeSelector({ selected, onChange }: Props) {
  const ranges: { value: DateRange; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border bg-white p-1">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            selected === range.value
              ? 'bg-accent text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
