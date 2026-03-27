ALTER TABLE "main"."profiles"
ADD COLUMN IF NOT EXISTS "metacentrum_key_encrypted" text;
--> statement-breakpoint
ALTER TABLE "main"."profiles"
ADD COLUMN IF NOT EXISTS "metacentrum_key_iv" text;
--> statement-breakpoint
ALTER TABLE "main"."profiles"
ADD COLUMN IF NOT EXISTS "metacentrum_encryption_key_version" integer;
