# Session Context: Fixing TypeScript Errors in Graphile Worker Refactor

## 1. Overall Goal

The primary goal is to fix TypeScript errors in the recently refactored job management code, which was converted from `pg-boss` to `graphile-worker`.

## 2. Background & Context

- The user has a job management system with a type-safe `JobBuilder` and `JobManager` class.
- It was originally implemented using `pg-boss`.
- We decided to refactor it to use `graphile-worker` to take advantage of its more intuitive concurrency API (`{ concurrency: N }`).
- I provided the refactored code below. The user has reported that this new code contains TypeScript errors that need to be fixed.

## 3. The Task at Hand

Your task is to act as a new instance, take the code provided below, place it in the correct files, diagnose the TypeScript errors, and fix them until the project compiles successfully.

**Your step-by-step plan should be:**
1.  Ensure the `graphile-worker` and `pg` dependencies are installed (`bun add graphile-worker pg`).
2.  Take the code for `manager.ts` below and write it to the file at `problem-solver/orchestrator/manager.ts`, overwriting the existing content.
3.  Take the code for `research.ts` below and write it to the file at `problem-solver/orchestrator/research.ts`, overwriting the existing content.
4.  Run the TypeScript compiler (e.g., `npx tsc --noEmit` or by checking the IDE's language server) to identify the specific errors.
5.  Analyze the errors and apply fixes to the code.
6.  Repeat steps 4 and 5 until all TypeScript errors are resolved.

---

## 4. Code to Work With

### `problem-solver/orchestrator/manager.ts`

```typescript
import {
  run,
  makeWorkerUtils,
  Task,
  WorkerUtils,
  Runner,
} from "graphile-worker";
import type { z } from "zod";
import { get_db_connection_string } from "../db/plugins";

// A Graphile Worker handler receives the payload and helpers.
// We'll just expose the payload to the user for simplicity.
export type WorkHandler<Input = any> = (payload: Input) => Promise<void>;

export class JobBuilder<Name extends string = string, Input = any> {
  readonly name: Name;
  private input_schema?: z.ZodType<Input>;
  private handler?: WorkHandler<Input>;
  private workerUtils?: WorkerUtils;

  constructor(name: Name) {
    this.name = name;
  }

  input<T>(schema: z.ZodType<T>): JobBuilder<Name, T> {
    this.input_schema = schema as any;
    return this as any;
  }

  work(handler: WorkHandler<Input>): JobBuilder<Name, Input> {
    this.handler = handler;
    return this;
  }

  // Internal method to connect to the worker utils
  setWorkerUtils(utils: WorkerUtils) {
    this.workerUtils = utils;
    return this;
  }

  async emit(data: Input) {
    if (!this.workerUtils) {
      throw new Error(`[job]{${this.name}} is not registered in a JobManager!`);
    }

    // With Graphile, validation happens inside the task, but we can do it here too.
    if (this.input_schema) {
      const result = this.input_schema.safeParse(data);
      if (!result.success) {
        throw new Error(`Invalid payload for job ${this.name}: ${result.error.message}`);
      }
    }
    
    console.debug(`[job]{${this.name}} emitted`);
    // Use addJob to enqueue the task
    return await this.workerUtils.addJob(this.name, data as any);
  }

  build(): [string, Task] {
    if (!this.handler) {
      throw new Error(`No handler defined for job ${this.name}`);
    }

    // Create the Graphile Task, wrapping the user's handler with validation and logging
    const task: Task = async (payload, helpers) => {
      let validatedPayload = payload;

      if (this.input_schema) {
        const result = this.input_schema.safeParse(payload);
        if (!result.success) {
          helpers.logger.error(`Invalid payload for job ${this.name}: ${result.error.message}`);
          throw result.error; // Fail the job
        }
        validatedPayload = result.data;
      }

      try {
        await this.handler!(validatedPayload);
      } catch (error) {
        helpers.logger.error(`Job ${this.name} failed`);
        helpers.logger.error(error);
        throw error;
      }
    };

    return [this.name, task];
  }
}

export const define_job = <Name extends string>(name: Name) => new JobBuilder<Name>();

export class JobManager<Registry extends Record<string, any> = {}> {
  private workerUtils: WorkerUtils;
  private runner?: Runner;
  private jobs: JobBuilder<any, any>[] = [];
  private jobMap: Map<string, JobBuilder<any, any>> = new Map();

  constructor() {
    // makeWorkerUtils creates an object to interact with the queue (e.g., addJob)
    this.workerUtils = makeWorkerUtils({
      connectionString: get_db_connection_string(),
    });
  }

  register<Builders extends readonly JobBuilder<any, any>[]>(...jobs: Builders): JobManager<
    Registry & { [K in Builders[number] as K["name"]]: K extends JobBuilder<any, infer I> ? I : never }
  > {
    for (const jb of jobs) {
      const job = jb as unknown as JobBuilder<any, any>;
      job.setWorkerUtils(this.workerUtils);
      this.jobs.push(job);
      this.jobMap.set(job.name as string, job);
    }
    return this as any;
  }

  async start() {
    // 1. Build the taskList from all registered jobs
    const taskList = this.jobs.reduce((acc, job) => {
      const [name, task] = job.build();
      acc[name] = task;
      return acc;
    }, {} as { [key: string]: Task });

    // 2. Start the runner
    this.runner = await run({
      connectionString: get_db_connection_string(),
      concurrency: 5, // Set your desired concurrency directly here
      noHandleSignals: false,
      pollInterval: 1000,
      taskList,
    });

    console.log("🔥 [JobManager] started with Graphile Worker!");
  }

  async stop() {
    // Graceful shutdown is much simpler in Graphile Worker
    await this.runner?.stop();
    await this.workerUtils.release();
    console.log("🚫 [JobManager] stopped!");
  }

  job<N extends keyof Registry & string>(name: N): JobBuilder<N, Registry[N]> {
    const found = this.jobMap.get(name);
    if (!found) throw new Error(`[JobManager] job '${name}' is not registered`);
    return found as JobBuilder<N, Registry[N]>;
  }

  async emit<N extends keyof Registry & string>(name: N, data: Registry[N]
  ): Promise<void> {
    const job = this.jobMap.get(name);
    if (!job) throw new Error(`[JobManager] job '${name}' is not registered`);
    await (job as JobBuilder<N, Registry[N]>).emit(data);
  }
}
```

### `problem-solver/orchestrator/research.ts`

```typescript
import { define_job } from "./manager";
import { z } from "zod";

export const run_standard_research = define_job("standard_research")
  .input(z.number().min(1))
  // Change: The handler now receives the payload directly, not an array of jobs.
  .work(async (payload) => {
    console.log("[job]{standard_research} received:", payload);
    await sleep(7000);
    console.log("[job]{standard_research} finished after 7 seconds!");
  });

export const research_jobs = [
  run_standard_research
] as const;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```
