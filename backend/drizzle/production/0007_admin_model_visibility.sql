CREATE TABLE IF NOT EXISTS "main"."app_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"model_visibility" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
