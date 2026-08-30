-- Tracks the Pluggy Item's connection status (see ItemStatus in pluggy-sdk),
-- set on connect (onSuccess) and refreshed on every transaction ingestion, so a
-- stalled/errored bank connection is visible without waiting for a transaction.
alter table accounts add column if not exists item_status text;
