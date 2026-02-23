-- Create budgets table for monthly category spending limits
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  category text not null,
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  month text not null, -- Format: YYYY-MM
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, category, month)
);

-- Indexes
create index idx_budgets_user_id on public.budgets(user_id);
create index idx_budgets_month on public.budgets(month);

-- Enable RLS
alter table public.budgets enable row level security;

create policy "Users can read own budgets" on public.budgets
  for select using (auth.uid()::text = user_id);

create policy "Users can insert own budgets" on public.budgets
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update own budgets" on public.budgets
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Users can delete own budgets" on public.budgets
  for delete using (auth.uid()::text = user_id);
