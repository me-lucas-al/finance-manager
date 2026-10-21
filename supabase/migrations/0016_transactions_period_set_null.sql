alter table transactions drop constraint if exists transactions_period_id_fkey;
alter table transactions
  add constraint transactions_period_id_fkey
  foreign key (period_id) references financial_periods (id) on delete set null;
