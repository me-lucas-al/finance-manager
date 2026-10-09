alter table transactions alter column pluggy_transaction_id drop not null;
alter table transactions alter column bank set default 'Manual';
alter table transactions add column if not exists source text not null default 'manual' check (source in ('manual', 'pluggy'));
update transactions set source = 'pluggy' where pluggy_transaction_id is not null;
alter table transactions add column if not exists necessity text check (necessity in ('essencial', 'importante', 'superfluo'));
create index if not exists transactions_source_idx on transactions (source);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  role text not null check (role in ('user', 'assistant', 'system', 'summary')),
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_user_created_idx on chat_messages (user_id, created_at);
alter table chat_messages enable row level security;
create policy "service_role_only" on chat_messages for all to service_role using (true) with check (true);

create table if not exists assistant_memory (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  fact text not null,
  created_at timestamptz not null default now()
);
create index if not exists assistant_memory_user_idx on assistant_memory (user_id);
alter table assistant_memory enable row level security;
create policy "service_role_only" on assistant_memory for all to service_role using (true) with check (true);

create table if not exists telegram_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);
alter table telegram_updates enable row level security;
create policy "service_role_only" on telegram_updates for all to service_role using (true) with check (true);
