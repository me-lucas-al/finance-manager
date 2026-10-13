alter table chat_messages
  add column if not exists channel text not null default 'telegram'
  check (channel in ('telegram', 'web'));
