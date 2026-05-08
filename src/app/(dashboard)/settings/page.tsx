"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrency, currencies } from "@/contexts/CurrencyContext";
import { useI18n } from "@/contexts/I18nContext";
import { ChevronRight, Wallet } from "lucide-react";

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const { t, locale, setLocale } = useI18n();

  return (
    <PageShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.settings.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t.settings.subtitle}
          </p>
        </div>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.language}</CardTitle>
            <CardDescription>{t.settings.languageDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {(["en", "th"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className={
                    locale === lang
                      ? "rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium"
                      : "rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  }
                >
                  {lang === "en" ? "English" : "ภาษาไทย"}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.currency}</CardTitle>
            <CardDescription>{t.settings.currencyDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                {t.settings.displayCurrency}
              </label>
              <select
                id="currency"
                value={currency.code}
                onChange={(e) => {
                  const selected = currencies.find(
                    (c) => c.code === e.target.value,
                  );
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
            <CardTitle>{t.settings.preview}</CardTitle>
            <CardDescription>See how amounts will be displayed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.transactionType.income}:
                </span>
                <span className="font-semibold text-success">
                  +
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency.code,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(5000)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.transactionType.expense}:
                </span>
                <span className="font-semibold text-danger">
                  -
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: currency.code,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(1250)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" />
              <div>
                <CardTitle>{t.settings.budgetLimits}</CardTitle>
                <CardDescription>
                  {t.settings.budgetDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link
              href="/limits"
              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {t.settings.openLimitsPage}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t.settings.openLimitsDescription}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
