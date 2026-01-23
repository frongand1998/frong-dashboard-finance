-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create transactions table
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  date date not null,
  note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create goals table
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  current_amount numeric(12, 2) not null default 0 check (current_amount >= 0),
  due_date date not null,
  status text not null default 'on_track' check (status in ('on_track', 'at_risk', 'off_track')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for faster queries
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_goals_user_id on public.goals(user_id);

-- Enable RLS
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

-- RLS Policies for transactions
create policy "Users can read own transactions" on public.transactions
  for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own transactions" on public.transactions
  for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update own transactions" on public.transactions
  for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Users can delete own transactions" on public.transactions
  for delete
  using (auth.uid()::text = user_id);

-- RLS Policies for goals
create policy "Users can read own goals" on public.goals
  for select
  using (auth.uid()::text = user_id);

create policy "Users can insert own goals" on public.goals
  for insert
  with check (auth.uid()::text = user_id);

create policy "Users can update own goals" on public.goals
  for update
  using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Users can delete own goals" on public.goals
  for delete
  using (auth.uid()::text = user_id);
