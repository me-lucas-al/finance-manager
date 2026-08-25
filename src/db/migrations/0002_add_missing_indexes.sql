CREATE INDEX IF NOT EXISTS "expenses_user_id_idx" ON "expenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_period_id_idx" ON "expenses" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "financial_periods_user_id_idx" ON "financial_periods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "financial_periods_status_idx" ON "financial_periods" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "incomes_user_id_idx" ON "incomes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "incomes_period_id_idx" ON "incomes" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "investments_user_id_idx" ON "investments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "investments_period_id_idx" ON "investments" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
-- Dedupe rows that would violate the new unique indexes below (a known bug let
-- push subscriptions duplicate on every re-register; keep the most recent row).
DELETE FROM "notification_preferences" p
WHERE EXISTS (
  SELECT 1 FROM "notification_preferences" p2
  WHERE p2.user_id = p.user_id
    AND (p2.updated_at, p2.id) > (p.updated_at, p.id)
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_id_idx" ON "notification_preferences" USING btree ("user_id");--> statement-breakpoint
DELETE FROM "push_subscriptions" p
WHERE EXISTS (
  SELECT 1 FROM "push_subscriptions" p2
  WHERE p2.user_id = p.user_id AND p2.endpoint = p.endpoint
    AND (p2.updated_at, p2.id) > (p.updated_at, p.id)
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_user_id_endpoint_idx" ON "push_subscriptions" USING btree ("user_id","endpoint");--> statement-breakpoint
DELETE FROM "user_settings" p
WHERE EXISTS (
  SELECT 1 FROM "user_settings" p2
  WHERE p2.user_id = p.user_id
    AND (p2.updated_at, p2.id) > (p.updated_at, p.id)
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_settings_user_id_idx" ON "user_settings" USING btree ("user_id");
