export type RecurringFrequency = "daily" | "weekly" | "monthly";

const parseDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (date: Date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const addDays = (value: string, days: number) => {
  const next = parseDate(value);
  next.setUTCDate(next.getUTCDate() + days);
  return formatDate(next);
};

const daysInMonth = (year: number, monthIndex: number) => {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
};

export const getAnchorDay = (startDate: string) => {
  return parseDate(startDate).getUTCDate();
};

export const getNextRunDate = (
  currentDate: string,
  frequency: RecurringFrequency,
  anchorDay?: number,
) => {
  if (frequency === "daily") return addDays(currentDate, 1);
  if (frequency === "weekly") return addDays(currentDate, 7);

  const current = parseDate(currentDate);
  const currentYear = current.getUTCFullYear();
  const currentMonth = current.getUTCMonth();
  const targetMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const targetYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const day = anchorDay ?? current.getUTCDate();
  const maxDay = daysInMonth(targetYear, targetMonth);
  const safeDay = Math.min(day, maxDay);
  return formatDate(new Date(Date.UTC(targetYear, targetMonth, safeDay)));
};

export const todayIso = () => formatDate(new Date());
