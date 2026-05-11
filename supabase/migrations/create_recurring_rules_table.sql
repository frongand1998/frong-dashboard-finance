-- Recurring transaction rules
create table public.recurring_rules (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  category text not null,
  amount numeric(12, 2) not null check (amount > 0),
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  start_date date not null,
  next_run_on date not null,
  anchor_day integer check (anchor_day between 1 and 31),
  note text,
  is_active boolean not null default true,
  last_run_on date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_recurring_rules_user_id on public.recurring_rules(user_id);
create index idx_recurring_rules_next_run on public.recurring_rules(next_run_on);
create index idx_recurring_rules_active on public.recurring_rules(is_active);

alter table public.recurring_rules enable row level security;

create policy "Users can read own recurring rules" on public.recurring_rules
  for select using (auth.uid()::text = user_id);

create policy "Users can insert own recurring rules" on public.recurring_rules
  for insert with check (auth.uid()::text = user_id);

create policy "Users can update own recurring rules" on public.recurring_rules
  for update using (auth.uid()::text = user_id)
  with check (auth.uid()::text = user_id);

create policy "Users can delete own recurring rules" on public.recurring_rules
  for delete using (auth.uid()::text = user_id);
