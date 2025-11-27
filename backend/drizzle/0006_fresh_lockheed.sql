CREATE TABLE "main-dev"."llms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"response" text NOT NULL,
	"prompt_file_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "main-dev"."llms" ADD CONSTRAINT "problem_files_id_in_llms_fkey" FOREIGN KEY ("prompt_file_id") REFERENCES "main-dev"."problem_files"("id") ON DELETE no action ON UPDATE no action;