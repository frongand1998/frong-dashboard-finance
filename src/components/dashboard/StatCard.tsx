import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ReactNode } from "react";

export const StatCard = ({
  label,
  value,
  delta,
  icon,
  variant = "default",
  currencyCode = "USD",
}: {
  label: string;
  value: number;
  delta?: { value: number; positive: boolean };
  icon?: ReactNode;
  variant?: "default" | "success" | "danger";
  currencyCode?: string;
}) => {
  const badgeVariant = variant === "success" ? "success" : variant === "danger" ? "danger" : "muted";

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <CardDescription className="uppercase tracking-wide text-xs text-slate-500">
              {label}
            </CardDescription>
            <CardTitle className="text-3xl">{formatCurrency(value, currencyCode)}</CardTitle>
            {delta && (
              <Badge variant={badgeVariant}>
                {delta.positive ? "▲" : "▼"} {Math.abs(delta.value)}% vs last period
              </Badge>
            )}
          </div>
          {icon && <div className="rounded-full bg-slate-100 p-3 text-slate-700">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};
