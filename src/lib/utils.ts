export const formatCurrency = (value: number, currencyCode = 'USD') =>
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
