-- Financial goals via Telegram, Fase 1: savings goals with a deadline
-- (metas de economia com prazo) and the prompt/reply correlation table for
-- the day-16 prompt and /goal without arguments (mirrors
-- transactions.telegram_question_message_id).

create table if not exists savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) not null default 0,
  target_date date,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists savings_goals_user_id_idx on savings_goals (user_id);
create index if not exists savings_goals_status_idx on savings_goals (status);

create table if not exists goal_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  telegram_message_id integer not null unique,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists goal_prompts_user_id_idx on goal_prompts (user_id);
create index if not exists goal_prompts_telegram_message_id_idx on goal_prompts (telegram_message_id);

alter table savings_goals enable row level security;
alter table goal_prompts enable row level security;

create policy "service_role_only" on savings_goals for all to service_role using (true) with check (true);
create policy "service_role_only" on goal_prompts for all to service_role using (true) with check (true);
