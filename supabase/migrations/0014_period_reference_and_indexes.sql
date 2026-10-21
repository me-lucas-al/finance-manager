alter table transactions
  add column if not exists period_id text references financial_periods (id) on delete cascade,
  add column if not exists reference_month text;
alter table incomes add column if not exists reference_month text;
alter table investments add column if not exists reference_month text;

update transactions t
set period_id = p.id
from financial_periods p
where t.period_id is null
  and p.user_id = t.user_id
  and t.occurred_at >= p.start_date::date
  and t.occurred_at <= p.end_date::date;

update transactions t
set reference_month = to_char(p.start_date, 'YYYY-MM')
from financial_periods p
where t.reference_month is null and p.id = t.period_id;

update incomes i
set reference_month = to_char(p.start_date, 'YYYY-MM')
from financial_periods p
where i.reference_month is null and p.id = i.period_id;

update investments v
set reference_month = to_char(p.start_date, 'YYYY-MM')
from financial_periods p
where v.reference_month is null and p.id = v.period_id;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_reference_month_format') then
    alter table transactions add constraint transactions_reference_month_format
      check (reference_month is null or reference_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'incomes_reference_month_format') then
    alter table incomes add constraint incomes_reference_month_format
      check (reference_month is null or reference_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'investments_reference_month_format') then
    alter table investments add constraint investments_reference_month_format
      check (reference_month is null or reference_month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
  end if;
end $$;

create index if not exists transactions_user_period_date_idx
  on transactions (user_id, period_id, occurred_at desc);
create index if not exists transactions_user_period_category_idx
  on transactions (user_id, period_id, category);
create index if not exists incomes_user_period_date_idx
  on incomes (user_id, period_id, received_at desc);
create index if not exists investments_user_period_date_idx
  on investments (user_id, period_id, date desc);

drop view if exists ledger_view;

create view ledger_view with (security_invoker = true) as
select 'expense'::text as kind, t.id::text as id, t.user_id, t.period_id, t.reference_month,
       t.occurred_at::timestamp as date, t.description, t.category, t.amount, t.source
from transactions t
union all
select 'income', i.id, i.user_id, i.period_id, i.reference_month,
       i.received_at, i.description, i.category, i.amount,
       case when i.external_id is null then 'manual' else 'pluggy' end
from incomes i
union all
select 'investment', v.id, v.user_id, v.period_id, v.reference_month,
       v.date, v.description, v.type, v.amount,
       case when v.external_id is null then 'manual' else 'pluggy' end
from investments v;

revoke all on ledger_view from anon, authenticated;
