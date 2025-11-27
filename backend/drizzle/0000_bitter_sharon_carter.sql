CREATE SCHEMA "main-dev";
--> statement-breakpoint
CREATE TYPE "main-dev"."problem-status" AS ENUM('idle', 'queued', 'running', 'failed', 'completed');--> statement-breakpoint
CREATE TYPE "main-dev"."run-phase" AS ENUM('queued', 'prover_working', 'prover_finished', 'verifier_working', 'verifier_finished', 'summarizer_working', 'summarizer_finished', 'ended');--> statement-breakpoint
CREATE TYPE "main-dev"."run-status" AS ENUM('running', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "main-dev"."problem_files" (
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
CREATE TABLE "main-dev"."problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"status" "main-dev"."problem-status" DEFAULT 'idle' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active_run_id" uuid,
	"current_round" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main-dev"."runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"phase" "main-dev"."run-phase" NOT NULL,
	"status" "main-dev"."run-status" DEFAULT 'running' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"parameters" jsonb
);
--> statement-breakpoint
ALTER TABLE "main-dev"."problem_files" ADD CONSTRAINT "problem_files_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "main-dev"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main-dev"."problems" ADD CONSTRAINT "problems_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main-dev"."runs" ADD CONSTRAINT "runs_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "main-dev"."problems"("id") ON DELETE no action ON UPDATE no action;
