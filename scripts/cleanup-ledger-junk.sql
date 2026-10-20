begin;

create temp table junk_transactions on commit drop as
select id from transactions where status = 'pending_reason'
union
select p.id
from transactions p
join transactions m
  on m.user_id = p.user_id
 and m.source = 'manual'
 and m.amount = p.amount
 and abs(m.occurred_at - p.occurred_at) <= 5
where p.source = 'pluggy';

create temp table junk_incomes on commit drop as
select p.id
from incomes p
join incomes m
  on m.user_id = p.user_id
 and m.external_id is null
 and m.amount = p.amount
 and abs(extract(epoch from (m.received_at - p.received_at))) <= 5 * 86400
where p.external_id is not null;

select
  (select count(*) from junk_transactions) as transactions_to_delete,
  (select count(*) from junk_incomes) as incomes_to_delete;

do $$
begin
  if (select count(*) from junk_transactions) <> 181 or (select count(*) from junk_incomes) <> 2 then
    raise exception 'Unexpected rows selected for deletion, aborting';
  end if;
end $$;

delete from transactions where id in (select id from junk_transactions);
delete from incomes where id in (select id from junk_incomes);

with totals as (
  select
    s.id as snapshot_id,
    coalesce((select sum(i.amount) from incomes i where i.period_id = p.id), 0) as total_incomes,
    coalesce((
      select sum(abs(t.amount)) from transactions t
      where t.user_id = p.user_id
        and t.occurred_at >= p.start_date::date
        and t.occurred_at <= p.end_date::date
    ), 0) as total_expenses,
    coalesce((select sum(v.amount) from investments v where v.period_id = p.id), 0) as total_investments,
    coalesce(us.max_expenses_percentage, 80) as max_expenses,
    coalesce(us.min_investment_percentage, 20) as min_investments
  from period_snapshots s
  join financial_periods p on p.id = s.period_id
  left join user_settings us on us.user_id = p.user_id
),
metrics as (
  select
    snapshot_id,
    total_incomes,
    total_expenses,
    total_investments,
    max_expenses,
    min_investments,
    case when total_incomes > 0 then total_expenses / total_incomes * 100 else 0 end as expense_pct,
    case when total_incomes > 0 then total_investments / total_incomes * 100 else 0 end as investment_pct
  from totals
)
update period_snapshots s
set
  total_incomes = m.total_incomes,
  total_expenses = m.total_expenses,
  total_investments = m.total_investments,
  balance = m.total_incomes - m.total_expenses - m.total_investments,
  expense_percentage = round(m.expense_pct::numeric, 2),
  investment_percentage = round(m.investment_pct::numeric, 2),
  status = case
    when m.total_incomes = 0 and m.total_expenses > 0 then 'OFF_TRACK'
    when m.total_incomes = 0 then 'ON_TRACK'
    when m.expense_pct > m.max_expenses or m.investment_pct < m.min_investments then 'OFF_TRACK'
    when m.expense_pct > m.max_expenses - 5 then 'WARNING'
    else 'ON_TRACK'
  end
from metrics m
where s.id = m.snapshot_id;

select period_id, total_incomes, total_expenses, total_investments, balance, status from period_snapshots;

commit;
