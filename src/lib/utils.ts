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
