-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE SCHEMA "main";
--> statement-breakpoint
CREATE TABLE "main"."problem_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"problem_id" uuid NOT NULL,
	"round" integer NOT NULL,
	"file_type" text NOT NULL,
	"file_name" text NOT NULL,
	"content" text,
	"metadata" jsonb
);
--> statement-breakpoint
ALTER TABLE "main"."problem_files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "main"."runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"parameters" jsonb
);
--> statement-breakpoint
ALTER TABLE "main"."runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "main"."problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"owner_id" uuid NOT NULL,
	"status" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"active_run_id" uuid,
	"current_round" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "main"."problems" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "main"."problem_files" ADD CONSTRAINT "problem_files_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "main"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."problems" ADD CONSTRAINT "problems_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
*/