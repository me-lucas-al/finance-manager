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
