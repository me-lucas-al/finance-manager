-- drizzle: 0007_holdings_and_initial_balance
CREATE TABLE "holdings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"item_id" text NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"balance" numeric(12, 2) NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "user_settings" ADD COLUMN "initial_balance" numeric(12, 2) DEFAULT '0' NOT NULL;
ALTER TABLE "holdings" ADD CONSTRAINT "holdings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "holdings_user_id_idx" ON "holdings" USING btree ("user_id");
CREATE UNIQUE INDEX "holdings_user_external_id_idx" ON "holdings" USING btree ("user_id","external_id");
alter table public.accounts
  add column if not exists balance numeric(12, 2),
  add column if not exists credit_limit numeric(12, 2),
  add column if not exists balance_synced_at timestamptz;
