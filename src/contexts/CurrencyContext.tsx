'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(currencies[0]);

  useEffect(() => {
    const saved = localStorage.getItem('currency');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrencyState(parsed);
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', JSON.stringify(newCurrency));
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
