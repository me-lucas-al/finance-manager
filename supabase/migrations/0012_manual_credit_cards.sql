create table if not exists credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) > 0),
  last_digits text check (last_digits is null or last_digits ~ '^[0-9]{4}$'),
  credit_limit numeric(12, 2) not null default 0 check (credit_limit >= 0),
  closing_day smallint check (closing_day is null or closing_day between 1 and 31),
  created_at timestamp not null default now(),
  updated_at timestamp not null default now()
);
create index if not exists credit_cards_user_id_idx on credit_cards (user_id);
alter table credit_cards enable row level security;

alter table transactions
  add column if not exists credit_card_id uuid references credit_cards (id) on delete set null;
create index if not exists transactions_credit_card_id_idx
  on transactions (credit_card_id)
  where credit_card_id is not null;
