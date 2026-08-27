CREATE TABLE IF NOT EXISTS "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" text NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_periods" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" text NOT NULL,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "incomes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" text NOT NULL,
	"received_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"type" text NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expense_notifications_enabled" boolean DEFAULT true NOT NULL,
	"investment_notifications_enabled" boolean DEFAULT true NOT NULL,
	"goal_notifications_enabled" boolean DEFAULT true NOT NULL,
	"closing_notifications_enabled" boolean DEFAULT true NOT NULL,
	"general_notifications_enabled" boolean DEFAULT true NOT NULL,
	"push_notifications_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_start_day" integer DEFAULT 15 NOT NULL,
	"period_end_day" integer DEFAULT 14 NOT NULL,
	"max_expenses_percentage" integer DEFAULT 80 NOT NULL,
	"min_investment_percentage" integer DEFAULT 20 NOT NULL,
	"expense_categories" json DEFAULT '[]'::json NOT NULL,
	"investment_types" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_period_id_financial_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "financial_periods"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "financial_periods" ADD CONSTRAINT "financial_periods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "incomes" ADD CONSTRAINT "incomes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "incomes" ADD CONSTRAINT "incomes_period_id_financial_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "financial_periods"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "investments" ADD CONSTRAINT "investments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "investments" ADD CONSTRAINT "investments_period_id_financial_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "financial_periods"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
CREATE TABLE IF NOT EXISTS "period_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"period_id" text NOT NULL,
	"total_incomes" numeric(12, 2) NOT NULL,
	"total_expenses" numeric(12, 2) NOT NULL,
	"total_investments" numeric(12, 2) NOT NULL,
	"balance" numeric(12, 2) NOT NULL,
	"expense_percentage" numeric(5, 2) NOT NULL,
	"investment_percentage" numeric(5, 2) NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "period_snapshots_period_id_unique" UNIQUE("period_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "period_snapshots" ADD CONSTRAINT "period_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "period_snapshots" ADD CONSTRAINT "period_snapshots_period_id_financial_periods_id_fk" FOREIGN KEY ("period_id") REFERENCES "financial_periods"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");
