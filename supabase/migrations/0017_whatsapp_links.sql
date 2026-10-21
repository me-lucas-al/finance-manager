create table if not exists whatsapp_links (
  user_id text primary key references users (id) on delete cascade,
  jid text not null unique,
  linked_at timestamptz not null default now()
);
alter table whatsapp_links enable row level security;
create policy "service_role_only" on whatsapp_links for all to service_role using (true) with check (true);

create table if not exists whatsapp_auth_keys (
  user_id text not null references users (id) on delete cascade,
  name text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, name)
);
alter table whatsapp_auth_keys enable row level security;
create policy "service_role_only" on whatsapp_auth_keys for all to service_role using (true) with check (true);
