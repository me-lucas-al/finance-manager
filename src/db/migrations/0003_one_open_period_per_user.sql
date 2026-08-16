-- Close any duplicate OPEN periods a user may already have (keeping the most
-- recently started one OPEN), so the unique index below can be created safely.
-- Rows are only marked CLOSED, never deleted, so their incomes/expenses/
-- investments are preserved.
UPDATE "financial_periods" p
SET "status" = 'CLOSED'
WHERE p."status" = 'OPEN'
  AND EXISTS (
    SELECT 1 FROM "financial_periods" p2
    WHERE p2."user_id" = p."user_id"
      AND p2."status" = 'OPEN'
      AND (p2."start_date", p2."id") > (p."start_date", p."id")
  );--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "financial_periods_one_open_per_user_idx" ON "financial_periods" USING btree ("user_id") WHERE "financial_periods"."status" = 'OPEN';
