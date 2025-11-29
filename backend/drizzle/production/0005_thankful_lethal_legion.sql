ALTER TYPE "main"."files-types" ADD VALUE 'prover_prompt' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'verifier_prompt' BEFORE 'round_meta';--> statement-breakpoint
ALTER TYPE "main"."files-types" ADD VALUE 'summarizer_prompt' BEFORE 'round_meta';