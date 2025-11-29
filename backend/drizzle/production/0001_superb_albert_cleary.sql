CREATE TYPE "main"."files-types" AS ENUM('task');--> statement-breakpoint
ALTER TYPE "main"."problem-status" ADD VALUE 'created' BEFORE 'idle';--> statement-breakpoint
ALTER TABLE "main"."problem_files" ALTER COLUMN "file_type" SET DATA TYPE "main"."files-types" USING "file_type"::"main"."files-types";--> statement-breakpoint
ALTER TABLE "main"."problem_files" ALTER COLUMN "content" SET NOT NULL;