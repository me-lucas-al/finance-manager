ALTER TABLE "incomes" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "investments" ADD COLUMN "external_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX "incomes_user_external_id_idx" ON "incomes" USING btree ("user_id","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "investments_user_external_id_idx" ON "investments" USING btree ("user_id","external_id");