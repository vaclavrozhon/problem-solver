CREATE SCHEMA "main";
--> statement-breakpoint
CREATE TYPE "main"."files-types" AS ENUM('task', 'proofs', 'notes', 'output', 'prover_prompt', 'verifier_prompt', 'summarizer_prompt', 'prover_reasoning', 'verifier_reasoning', 'summarizer_reasoning', 'prover_output', 'verifier_output', 'summarizer_output');--> statement-breakpoint
CREATE TYPE "main"."problem-status" AS ENUM('created', 'idle', 'queued', 'running', 'failed', 'completed');--> statement-breakpoint
CREATE TYPE "main"."research-type" AS ENUM('standard', 'adrian');--> statement-breakpoint
CREATE TYPE "main"."run-phase" AS ENUM('prover_working', 'prover_finished', 'prover_failed', 'verifier_working', 'verifier_finished', 'verifier_failed', 'summarizer_working', 'summarizer_finished', 'summarizer_failed', 'finished');--> statement-breakpoint
CREATE TABLE "main"."llms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"response" text NOT NULL,
	"usage" json NOT NULL,
	"prompt_file_id" uuid,
	"model" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."problem_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"problem_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"file_type" "main"."files-types" NOT NULL,
	"file_name" text NOT NULL,
	"content" text NOT NULL,
	"usage" json,
	"model_id" text
);
--> statement-breakpoint
CREATE TABLE "main"."problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"status" "main"."problem-status" DEFAULT 'created' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active_round_id" uuid,
	"current_round" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."research_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"index" integer NOT NULL,
	"research_type" "main"."research-type" NOT NULL,
	"phase" "main"."run-phase" NOT NULL,
	"failed_provers" json,
	"prover_time" numeric,
	"verifier_time" numeric,
	"summarizer_time" numeric,
	"usage" numeric DEFAULT 0 NOT NULL,
	"estimated_usage" numeric,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"error_message" text,
	"research_config" json
);
--> statement-breakpoint
ALTER TABLE "main"."llms" ADD CONSTRAINT "problem_files_id_in_llms_fkey" FOREIGN KEY ("prompt_file_id") REFERENCES "main"."problem_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."problem_files" ADD CONSTRAINT "problem_files_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "main"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."problem_files" ADD CONSTRAINT "problem_files_rounds_id_fkey" FOREIGN KEY ("round_id") REFERENCES "main"."research_rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."problems" ADD CONSTRAINT "problems_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "main"."research_rounds" ADD CONSTRAINT "problems_round_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "main"."problems"("id") ON DELETE no action ON UPDATE no action;