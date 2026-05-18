export function toMonthlyRate(annualReturnPercent: number) {
  return annualReturnPercent / 100 / 12;
}

export function futureValueLumpSum(
  principal: number,
  monthlyRate: number,
  months: number,
) {
  if (months <= 0) return principal;
  if (monthlyRate === 0) return principal;
  return principal * Math.pow(1 + monthlyRate, months);
}

export function futureValueDca(
  monthlyContribution: number,
  monthlyRate: number,
  months: number,
) {
  if (months <= 0) return 0;
  if (monthlyRate === 0) return monthlyContribution * months;
  return (
    (monthlyContribution * (Math.pow(1 + monthlyRate, months) - 1)) /
    monthlyRate
  );
}

export function projectPortfolioValue(params: {
  principal: number;
  monthlyContribution: number;
  annualReturnPercent: number;
  months: number;
}) {
  const monthlyRate = toMonthlyRate(params.annualReturnPercent);
  const fvPrincipal = futureValueLumpSum(
    params.principal,
    monthlyRate,
    params.months,
  );
  const fvDca = futureValueDca(
    params.monthlyContribution,
    monthlyRate,
    params.months,
  );

  return {
    total: fvPrincipal + fvDca,
    principalGrowth: fvPrincipal,
    contributionGrowth: fvDca,
  };
}

export function requiredMonthlyContribution(params: {
  targetFutureValue: number;
  annualReturnPercent: number;
  months: number;
}) {
  const { targetFutureValue, annualReturnPercent, months } = params;

  if (targetFutureValue <= 0) return 0;
  if (months <= 0) return targetFutureValue;

  const monthlyRate = toMonthlyRate(annualReturnPercent);

  if (monthlyRate === 0) {
    return targetFutureValue / months;
  }

  const factor = Math.pow(1 + monthlyRate, months) - 1;
  if (factor <= 0) return targetFutureValue;

  return (targetFutureValue * monthlyRate) / factor;
}

export function monthsUntilDate(date: string, fromDate = new Date()) {
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) return 0;

  const yearDiff = target.getFullYear() - fromDate.getFullYear();
  const monthDiff = target.getMonth() - fromDate.getMonth();
  const months = yearDiff * 12 + monthDiff;

  return Math.max(months, 0);
}
