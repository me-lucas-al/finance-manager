-- drizzle: 0005_onboarding_data_mode, 0006_pluggy_external_ids
alter table users add column if not exists data_mode text;
alter table users add column if not exists onboarding_completed_at timestamp;

update users
  set data_mode = 'manual', onboarding_completed_at = now()
  where onboarding_completed_at is null and created_at < '2026-10-14';

alter table incomes add column if not exists external_id text;
alter table investments add column if not exists external_id text;

create unique index if not exists incomes_user_external_id_idx on incomes using btree (user_id, external_id);
create unique index if not exists investments_user_external_id_idx on investments using btree (user_id, external_id);
