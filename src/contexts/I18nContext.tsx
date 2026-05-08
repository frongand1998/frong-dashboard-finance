"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_KEY,
  LOCALE_STORAGE_KEY,
  getTranslations,
  resolveLocale,
  type Locale,
} from "@/lib/i18n";
import type { TranslationKeys } from "@/locales/en";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: getTranslations(DEFAULT_LOCALE),
});

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: PropsWithChildren<{ initialLocale?: Locale }>) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return initialLocale;
    }

    return resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.cookie = `${LOCALE_COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, t: getTranslations(locale) }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
