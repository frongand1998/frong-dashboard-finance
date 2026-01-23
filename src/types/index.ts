export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note?: string;
};

export type GoalStatus = "on_track" | "at_risk" | "off_track";

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  due_date?: string;
  status?: GoalStatus;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type Summary = {
  periodLabel: string;
  income: number;
  expenses: number;
  net: number;
};
