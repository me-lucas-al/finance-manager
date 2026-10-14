create table if not exists telegram_links (
  user_id text primary key,
  chat_id bigint not null unique,
  linked_at timestamptz not null default now()
);
alter table telegram_links enable row level security;
create policy "service_role_only" on telegram_links for all to service_role using (true) with check (true);

create table if not exists telegram_link_codes (
  code text primary key,
  user_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists telegram_link_codes_user_idx on telegram_link_codes (user_id);
alter table telegram_link_codes enable row level security;
create policy "service_role_only" on telegram_link_codes for all to service_role using (true) with check (true);

alter table alerts_log add column if not exists user_id text;
create index if not exists alerts_log_user_idx on alerts_log (user_id, alert_type, sent_at);

-- Consumes a link code and binds the chat to its owner in one transaction, so a
-- failure can never burn the code without linking (or unlink the old owner
-- without linking the new one). Returns the user id, or null for an unknown/expired code.
create or replace function consume_telegram_link_code(p_code text, p_chat_id bigint)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id text;
  v_expires timestamptz;
begin
  delete from telegram_link_codes where code = upper(trim(p_code))
    returning user_id, expires_at into v_user_id, v_expires;

  if v_user_id is null or v_expires < now() then
    return null;
  end if;

  delete from telegram_links where chat_id = p_chat_id and user_id <> v_user_id;
  insert into telegram_links (user_id, chat_id, linked_at)
    values (v_user_id, p_chat_id, now())
    on conflict (user_id) do update set chat_id = excluded.chat_id, linked_at = excluded.linked_at;

  return v_user_id;
end;
$$;

revoke all on function consume_telegram_link_code(text, bigint) from public;
grant execute on function consume_telegram_link_code(text, bigint) to service_role;
