create table if not exists fixed_entries (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  kind text not null check (kind in ('expense', 'income')),
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  due_day integer not null check (due_day between 1 and 31),
  active boolean not null default true,
  starts_on date not null default current_date,
  last_launched_month text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
create index if not exists fixed_entries_user_id_idx on fixed_entries (user_id);
alter table fixed_entries enable row level security;
alter table fixed_entries add column if not exists last_launched_month text;

alter table transactions
  add column if not exists fixed_entry_id text references fixed_entries (id) on delete set null;
alter table transactions add column if not exists fixed_reference_month text;
create unique index if not exists transactions_fixed_entry_month_uidx
  on transactions (fixed_entry_id, fixed_reference_month)
  where fixed_entry_id is not null;

alter table incomes
  add column if not exists fixed_entry_id text references fixed_entries (id) on delete set null;
alter table incomes add column if not exists fixed_reference_month text;
create unique index if not exists incomes_fixed_entry_month_uidx
  on incomes (fixed_entry_id, fixed_reference_month)
  where fixed_entry_id is not null;
