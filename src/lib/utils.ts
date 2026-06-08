export const formatCurrency = (value: number, currencyCode = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(typeof value === "string" ? new Date(value) : value);

export const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export const normalizeCategoryLabel = (value: string) => {
  const compact = value.trim().replace(/\s+/g, " ");
  if (!compact) return "";

  return compact.replace(/\b([A-Za-z])([A-Za-z']*)\b/g, (_, first, rest) => {
    return `${first.toUpperCase()}${rest.toLowerCase()}`;
  });
};

export type BudgetAlertLevel = "normal" | "near" | "warning" | "critical";

export const getBudgetAlertLevel = (
  spent: number,
  limit: number,
): BudgetAlertLevel => {
  if (limit <= 0) {
    return spent > 0 ? "critical" : "normal";
  }

  const pct = (spent / limit) * 100;

  if (pct >= 100) return "critical";
  if (pct >= 90) return "warning";
  if (pct >= 75) return "near";
  return "normal";
};
