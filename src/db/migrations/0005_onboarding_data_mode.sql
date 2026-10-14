ALTER TABLE "users" ADD COLUMN "data_mode" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
UPDATE "users" SET "data_mode" = 'manual', "onboarding_completed_at" = now() WHERE "onboarding_completed_at" IS NULL;
