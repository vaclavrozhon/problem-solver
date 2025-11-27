CREATE TYPE "main-dev"."files-types" AS ENUM('task');--> statement-breakpoint
ALTER TYPE "main-dev"."problem-status" ADD VALUE 'created' BEFORE 'idle';--> statement-breakpoint
ALTER TABLE "main-dev"."problem_files" ALTER COLUMN "file_type" SET DATA TYPE "main-dev"."files-types" USING "file_type"::"main-dev"."files-types";--> statement-breakpoint
ALTER TABLE "main-dev"."problem_files" ALTER COLUMN "content" SET NOT NULL;