CREATE TYPE "main"."invite-status" AS ENUM('pending', 'redeemed', 'expired');--> statement-breakpoint
CREATE TYPE "main"."key-source" AS ENUM('provisioned', 'self');--> statement-breakpoint
CREATE TYPE "main"."user-role" AS ENUM('basic_user', 'admin');--> statement-breakpoint
CREATE TABLE "main"."invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"recipient_name" text NOT NULL,
	"recipient_email" text,
	"openrouter_key_encrypted" text NOT NULL,
	"openrouter_key_iv" text NOT NULL,
	"openrouter_key_hash" text NOT NULL,
	"encryption_key_version" integer DEFAULT 1,
	"credit_limit" numeric DEFAULT 10 NOT NULL,
	"status" "main"."invite-status" DEFAULT 'pending' NOT NULL,
	"redeemed_by" uuid,
	"redeemed_at" timestamp with time zone,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"notes" text,
	CONSTRAINT "invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "main"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "main"."user-role" DEFAULT 'basic_user' NOT NULL,
	"openrouter_key_encrypted" text,
	"openrouter_key_iv" text,
	"encryption_key_version" integer DEFAULT 1,
	"key_source" "main"."key-source",
	"provisioned_invite_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "main"."invites" ADD CONSTRAINT "invites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "main"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."invites" ADD CONSTRAINT "invites_redeemed_by_fkey" FOREIGN KEY ("redeemed_by") REFERENCES "main"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;