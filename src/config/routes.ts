import type { TranslationKeys } from "@/locales/en";

export type NavItemKey = keyof TranslationKeys["nav"];

export const navItems: { labelKey: string; href: string }[] = [
  { labelKey: "dashboard", href: "/dashboard" },
  { labelKey: "transactions", href: "/transactions" },
  { labelKey: "addRecord", href: "/add" },
  { labelKey: "limits", href: "/limits" },
  { labelKey: "goals", href: "/goals" },
  { labelKey: "admin", href: "/admin" },
  { labelKey: "aiAgent", href: "/ai-agent" },
  { labelKey: "settings", href: "/settings" },
];
