-- Lock every public table away from the anon/authenticated API roles. The app only
-- talks to the database as postgres (Drizzle) or service_role, both of which bypass RLS.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- Every per-user table points at users and goes away with the user.
do $$
declare t text;
begin
  foreach t in array array[
    'chat_messages', 'assistant_memory', 'accounts', 'transactions', 'goals',
    'savings_goals', 'goal_prompts', 'telegram_link_codes', 'telegram_links', 'alerts_log'
  ] loop
    if not exists (select 1 from pg_constraint where conname = t || '_user_id_users_id_fk') then
      execute format(
        'alter table public.%I add constraint %I foreign key (user_id) references public.users (id) on delete cascade',
        t, t || '_user_id_users_id_fk'
      );
    end if;
  end loop;
end $$;

-- A row can only reference a parent owned by the same user.
alter table credit_cards add constraint credit_cards_id_user_id_key unique (id, user_id);
alter table fixed_entries add constraint fixed_entries_id_user_id_key unique (id, user_id);
alter table accounts add constraint accounts_id_user_id_key unique (id, user_id);

alter table transactions drop constraint transactions_credit_card_id_fkey;
alter table transactions
  add constraint transactions_credit_card_owner_fk
  foreign key (credit_card_id, user_id) references credit_cards (id, user_id)
  on delete set null (credit_card_id);

alter table transactions drop constraint transactions_fixed_entry_id_fkey;
alter table transactions
  add constraint transactions_fixed_entry_owner_fk
  foreign key (fixed_entry_id, user_id) references fixed_entries (id, user_id)
  on delete set null (fixed_entry_id);

alter table transactions drop constraint transactions_account_id_fkey;
alter table transactions
  add constraint transactions_account_owner_fk
  foreign key (account_id, user_id) references accounts (id, user_id)
  on delete set null (account_id);

alter table incomes drop constraint incomes_fixed_entry_id_fkey;
alter table incomes
  add constraint incomes_fixed_entry_owner_fk
  foreign key (fixed_entry_id, user_id) references fixed_entries (id, user_id)
  on delete set null (fixed_entry_id);
