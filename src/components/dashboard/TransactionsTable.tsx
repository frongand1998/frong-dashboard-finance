import { CardSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types";

export const TransactionsTable = ({
  transactions,
  className,
  compact = false,
  currencyCode = "USD",
}: {
  transactions: Transaction[];
  className?: string;
  compact?: boolean;
  currencyCode?: string;
}) => {
  return compact ? (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className="flex items-center justify-between p-2 rounded bg-card-surface"
        >
          <div className="flex-1">
            <div className="text-sm font-medium capitalize">{tx.category}</div>
            <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currencyCode)}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <CardSection
      title="Recent Activity"
      description="Latest income and expenses recorded."
      className={className ?? "overflow-hidden"}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-4 pb-3 font-medium">Type</th>
              <th className="px-4 pb-3 font-medium">Category</th>
              <th className="px-4 pb-3 font-medium">Amount</th>
              <th className="px-4 pb-3 font-medium">Date</th>
              <th className="px-4 pb-3 font-medium">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-foreground">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3">
                  <Badge variant={tx.type === "income" ? "success" : "danger"}>
                    {tx.type === "income" ? "Income" : "Expense"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{tx.category}</td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {tx.type === "expense" ? "-" : "+"}
                  {formatCurrency(tx.amount, currencyCode)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatDate(tx.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{tx.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardSection>
  );
  };
