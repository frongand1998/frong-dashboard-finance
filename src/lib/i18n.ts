import en, { type TranslationKeys } from "@/locales/en";
import th from "@/locales/th";

export type Locale = "en" | "th";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "locale";
export const LOCALE_COOKIE_KEY = "locale";

export const translations: Record<Locale, TranslationKeys> = {
  en,
  th,
};

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "en" || value === "th";
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale];
}