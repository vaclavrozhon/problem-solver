ALTER TABLE "main"."invites" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "main"."invites" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "main"."invite-status";--> statement-breakpoint
CREATE TYPE "main"."invite-status" AS ENUM('pending', 'redeemed', 'to-be-removed');--> statement-breakpoint
ALTER TABLE "main"."invites" ALTER COLUMN "status" SET DEFAULT 'pending'::"main"."invite-status";--> statement-breakpoint
ALTER TABLE "main"."invites" ALTER COLUMN "status" SET DATA TYPE "main"."invite-status" USING "status"::"main"."invite-status";--> statement-breakpoint
ALTER TABLE "main"."research_rounds" ALTER COLUMN "research_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "main"."research-type";--> statement-breakpoint
CREATE TYPE "main"."research-type" AS ENUM('standard');--> statement-breakpoint
ALTER TABLE "main"."research_rounds" ALTER COLUMN "research_type" SET DATA TYPE "main"."research-type" USING "research_type"::"main"."research-type";--> statement-breakpoint
ALTER TABLE "main"."profiles" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "main"."profiles" ALTER COLUMN "role" SET DEFAULT 'default'::text;--> statement-breakpoint
DROP TYPE "main"."user-role";--> statement-breakpoint
CREATE TYPE "main"."user-role" AS ENUM('default', 'admin');--> statement-breakpoint
ALTER TABLE "main"."profiles" ALTER COLUMN "role" SET DEFAULT 'default'::"main"."user-role";--> statement-breakpoint
ALTER TABLE "main"."profiles" ALTER COLUMN "role" SET DATA TYPE "main"."user-role" USING "role"::"main"."user-role";--> statement-breakpoint
ALTER TABLE "main"."invites" ALTER COLUMN "credit_limit" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "main"."profiles" ALTER COLUMN "encryption_key_version" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "main"."invites" DROP COLUMN "recipient_email";--> statement-breakpoint
ALTER TABLE "main"."invites" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "main"."invites" DROP COLUMN "notes";