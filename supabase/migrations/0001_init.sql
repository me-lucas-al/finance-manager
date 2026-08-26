-- Core tables for the Open Finance + AI migration (plano_migracao.xml, tarefa 1).
-- This is a NEW, separate Supabase Postgres project (not the app's Neon/Drizzle
-- database). Review before applying manually in the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  -- References the app's NextAuth user id (separate database, no FK across projects).
  user_id text not null,
  pluggy_account_id text not null unique,
  pluggy_item_id text not null,
  bank text not null,
  account_type text not null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists accounts_user_id_idx on accounts (user_id);
create index if not exists accounts_pluggy_item_id_idx on accounts (pluggy_item_id);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  pluggy_transaction_id text not null unique,
  account_id uuid references accounts (id) on delete set null,
  bank text not null,
  amount numeric(12, 2) not null,
  description text not null,
  occurred_at date not null,
  category text,
  category_suggested text,
  reason text,
  status text not null default 'pending_reason' check (status in ('pending_reason', 'categorized')),
  -- Telegram message_id of the question sent for this transaction, used to
  -- correlate the user's reply via reply_to_message (tarefa 4).
  telegram_question_message_id integer,
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_id_idx on transactions (user_id);
create index if not exists transactions_status_idx on transactions (status);
create index if not exists transactions_occurred_at_idx on transactions (occurred_at);
create index if not exists transactions_telegram_question_message_id_idx
  on transactions (telegram_question_message_id);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  month date not null,
  -- null category = general goal for the whole month.
  category text,
  target_amount numeric(12, 2) not null,
  created_at timestamptz not null default now()
);
create index if not exists goals_user_id_month_idx on goals (user_id, month);
-- At most one general goal (category is null) and one goal per category, per user/month.
create unique index if not exists goals_general_unique_idx
  on goals (user_id, month) where category is null;
create unique index if not exists goals_category_unique_idx
  on goals (user_id, month, category) where category is not null;

create table if not exists alerts_log (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,
  message text not null,
  sent_at timestamptz not null default now()
);
create index if not exists alerts_log_alert_type_sent_at_idx on alerts_log (alert_type, sent_at);

alter table accounts enable row level security;
alter table transactions enable row level security;
alter table goals enable row level security;
alter table alerts_log enable row level security;

-- Single-tenant infra: only this app's server-side code (service role key) ever
-- talks to this project, so every table is locked to service_role and the app
-- enforces user_id scoping itself (mirrors requireUserId() on the Neon side).
create policy "service_role_only" on accounts for all to service_role using (true) with check (true);
create policy "service_role_only" on transactions for all to service_role using (true) with check (true);
create policy "service_role_only" on goals for all to service_role using (true) with check (true);
create policy "service_role_only" on alerts_log for all to service_role using (true) with check (true);
