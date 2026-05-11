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

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month: string; // YYYY-MM
  created_at?: string;
  updated_at?: string;
};

export type RecurringFrequency = "daily" | "weekly" | "monthly";

export type RecurringRule = {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  category: string;
  amount: number;
  frequency: RecurringFrequency;
  start_date: string;
  next_run_on: string;
  anchor_day?: number | null;
  note?: string | null;
  is_active: boolean;
  last_run_on?: string | null;
  created_at?: string;
  updated_at?: string;
};
