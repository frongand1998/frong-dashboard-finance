import { CardSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clamp, formatCurrency, formatDate } from "@/lib/utils";
import type { Goal } from "@/types";

export const GoalProgress = ({ goals }: { goals: Goal[] }) => {
  return (
    <CardSection
      title="Financial Goals"
      description="Track how close you are to each target."
      className="h-full"
    >
      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = clamp((goal.current_amount / goal.target_amount) * 100);
          const status = goal.status || 
            (progress >= 80 ? 'on_track' : progress >= 50 ? 'at_risk' : 'off_track');
          const badgeVariant =
            status === "on_track"
              ? "success"
              : status === "at_risk"
              ? "muted"
              : "danger";

          return (
            <div key={goal.id} className="space-y-2 rounded-xl border border-border/70 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">{goal.name}</div>
                  {goal.due_date && (
                    <div className="text-xs text-slate-500">Due {formatDate(goal.due_date)}</div>
                  )}
                </div>
                <Badge variant={badgeVariant}>
                  {status === "on_track"
                    ? "On track"
                    : status === "at_risk"
                    ? "Attention"
                    : "Off track"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>{formatCurrency(goal.current_amount)}</span>
                <span className="text-xs text-slate-500">Target {formatCurrency(goal.target_amount)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${progress}%` }}
                  aria-label={`${progress}% toward ${goal.name}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </CardSection>
  );
};
