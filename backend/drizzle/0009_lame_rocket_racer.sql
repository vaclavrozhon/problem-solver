ALTER TYPE "main-dev"."run-phase" ADD VALUE 'verifier_failed' BEFORE 'summarizer_working';--> statement-breakpoint
ALTER TYPE "main-dev"."run-phase" ADD VALUE 'summarizer_failed' BEFORE 'ended';