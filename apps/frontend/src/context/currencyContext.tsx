import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Currency = 'MAD' | 'EUR';

type Ctx = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  convert: (amount: number, from: Currency, to?: Currency) => number;
  format: (amount: number, currency?: Currency) => string;
};

const ratesToEUR: Record<Currency, number> = {
  EUR: 1,
  MAD: 0.091,  
};

const CurrencyContext = createContext<Ctx | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('currency');
    if (saved === 'MAD' || saved === 'EUR') return saved;
    const lang = navigator.language.toLowerCase();
    return lang.includes('fr') ? 'EUR' : 'MAD';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const convert = (amount: number, from: Currency, to: Currency = currency) => {
    if (from === to) return amount;
    const inEUR = amount * ratesToEUR[from];
    return inEUR / ratesToEUR[to];
  };

  const format = (amount: number, cur: Currency = currency) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: cur,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
    }).format(amount);

  const value = useMemo(() => ({ currency, setCurrency, convert, format }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within <CurrencyProvider>');
  return ctx;
}
