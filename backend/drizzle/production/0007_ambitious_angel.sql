ALTER TYPE "main"."files-types" ADD VALUE 'prover_reasoning' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'verifier_reasoning' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'summarizer_reasoning' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'prover_output' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'verifier_output' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'summarizer_output' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."run-phase" ADD VALUE 'prover_failed' BEFORE 'verifier_working';--> statement-breakpoint
ALTER TABLE "main"."llms" ADD COLUMN "usage" json NOT NULL;--> statement-breakpoint
ALTER TABLE "main"."llms" ADD COLUMN "modeels" text NOT NULL;--> statement-breakpoint
ALTER TABLE "main"."problem_files" ADD COLUMN "usage" json;--> statement-breakpoint
ALTER TABLE "main"."runs" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;