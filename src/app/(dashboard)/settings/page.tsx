'use client';

import { PageShell } from '@/components/layout/PageShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCurrency, currencies } from '@/contexts/CurrencyContext';

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();

  return (
    <PageShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Select your preferred currency for displaying amounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                Display Currency
              </label>
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
              <p className="text-xs text-muted-foreground">
                Current: {currency.symbol} {currency.name}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how amounts will be displayed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Income:</span>
                <span className="font-semibold text-success">
                  +{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency.code,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(5000)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expense:</span>
                <span className="font-semibold text-danger">
                  -{new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: currency.code,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(1250)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
