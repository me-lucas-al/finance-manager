alter table public.accounts
  add column if not exists balance numeric(12, 2),
  add column if not exists credit_limit numeric(12, 2),
  add column if not exists balance_synced_at timestamptz;
