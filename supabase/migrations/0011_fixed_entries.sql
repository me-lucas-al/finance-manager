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

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_fixed_link_check') then
    alter table transactions add constraint transactions_fixed_link_check
      check (fixed_entry_id is null or fixed_reference_month is not null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'incomes_fixed_link_check') then
    alter table incomes add constraint incomes_fixed_link_check
      check (fixed_entry_id is null or fixed_reference_month is not null);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'transactions_fixed_reference_month_format') then
    alter table transactions add constraint transactions_fixed_reference_month_format
      check (fixed_reference_month is null or fixed_reference_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'incomes_fixed_reference_month_format') then
    alter table incomes add constraint incomes_fixed_reference_month_format
      check (fixed_reference_month is null or fixed_reference_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'fixed_entries_last_launched_month_format') then
    alter table fixed_entries add constraint fixed_entries_last_launched_month_format
      check (last_launched_month is null or last_launched_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  end if;
end $$;
