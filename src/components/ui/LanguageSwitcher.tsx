"use client";

import { useI18n, type Locale } from "@/contexts/I18nContext";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  th: "TH",
};

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs font-medium">
      {(["en", "th"] as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          className={
            locale === lang
              ? "bg-accent text-white px-3 py-1.5"
              : "text-slate-600 hover:bg-slate-100 px-3 py-1.5 transition-colors"
          }
          aria-label={`Switch to ${lang === "en" ? "English" : "Thai"}`}
        >
          {localeLabels[lang]}
        </button>
      ))}
    </div>
  );
}
