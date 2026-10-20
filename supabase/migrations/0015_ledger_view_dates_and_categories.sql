drop view if exists ledger_view;

create view ledger_view with (security_invoker = true) as
select 'expense'::text as kind, t.id::text as id, t.user_id, t.period_id, t.reference_month,
       t.occurred_at as date, t.description,
       coalesce(nullif(t.category, ''), t.category_suggested, 'Outros') as category,
       t.amount, t.source
from transactions t
union all
select 'income', i.id, i.user_id, i.period_id, i.reference_month,
       ((i.received_at at time zone 'UTC') at time zone 'America/Sao_Paulo')::date, i.description,
       coalesce(nullif(i.category, ''), 'Outros'),
       i.amount,
       case when i.external_id is null then 'manual' else 'pluggy' end
from incomes i
union all
select 'investment', v.id, v.user_id, v.period_id, v.reference_month,
       ((v.date at time zone 'UTC') at time zone 'America/Sao_Paulo')::date, v.description,
       coalesce(nullif(v.type, ''), 'Outros'),
       v.amount,
       case when v.external_id is null then 'manual' else 'pluggy' end
from investments v;

revoke all on ledger_view from anon, authenticated;
