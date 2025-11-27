ALTER TYPE "main-dev"."files-types" ADD VALUE 'prover_prompt' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main-dev"."files-types" ADD VALUE 'verifier_prompt' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main-dev"."files-types" ADD VALUE 'summarizer_prompt' BEFORE 'round_meta';