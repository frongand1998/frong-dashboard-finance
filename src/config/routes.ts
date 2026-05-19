import type { TranslationKeys } from "@/locales/en";

export type NavItemKey = keyof TranslationKeys["nav"];

export const navItems: { labelKey: string; href: string }[] = [
  { labelKey: "dashboard", href: "/dashboard" },
  { labelKey: "investmentSnapshot", href: "/investment-snapshot" },
  { labelKey: "dcaPlanner", href: "/dca-planner" },
  { labelKey: "goalBasedInvesting", href: "/goal-based-investing" },
  { labelKey: "analytics", href: "/analytics" },
  { labelKey: "transactions", href: "/transactions" },
  { labelKey: "addRecord", href: "/add" },
  { labelKey: "limits", href: "/limits" },
  { labelKey: "goals", href: "/goals" },
  { labelKey: "recurring", href: "/recurring" },
  { labelKey: "admin", href: "/admin" },
  { labelKey: "settings", href: "/settings" },
];
