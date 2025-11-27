import { run, makeWorkerUtils, Task, WorkerUtils, Runner } from "graphile-worker"
import { z } from "zod"
import { createOpenRouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider"

import { get_db_connection_string, new_db_connection } from "../db/plugins"

type DatabaseAccess = ReturnType<typeof new_db_connection>
type WorkHandler<Input = any> = (
  payload: Input,
  utils: { db: DatabaseAccess, openrouter: OpenRouterProvider }
) => Promise<void>

export class JobManager<Registry extends Record<string, any> = {}> {
  private db!: DatabaseAccess
  private worker!: WorkerUtils
  private openrouter!: OpenRouterProvider
  private runner?: Runner
  private jobs: JobBuilder<any, any>[] = []
  private job_map: Map<string, JobBuilder<any, any>> = new Map()

  register<Builders extends readonly JobBuilder<any, any>[]>(...jobs: Builders):
    JobManager<Registry & {
      [K in Builders[number] as K["name"]]: K extends JobBuilder<any, infer I> ? I : never
    }> {
    for (const job of jobs) {
      this.jobs.push(job)
      this.job_map.set(job.name as string, job)
    }
    return this as any
  }

  async start() {
    this.db = new_db_connection()
    this.worker = await makeWorkerUtils({ connectionString: get_db_connection_string() })
    this.openrouter = createOpenRouter({ apiKey: Bun.env.OPENROUTER_API_KEY })

    await this.worker.migrate()

    const taskList = this.jobs.reduce((acc, job) => {
      const [name, task] = job.build(this.worker, this.db, this.openrouter)
      acc[name] = task
      return acc
    }, {} as { [key: string]: Task })

    this.runner = await run({
      connectionString: get_db_connection_string(),
      concurrency: 10,
      taskList,
      schema: Bun.env.NODE_ENV === "production" ? "jobs" : "jobs_dev",
    })

    console.log("👍 [job_manager] was started!")
  }

  async stop() {
    await this.runner?.stop()
    await this.worker.release()
    console.log("🚫 [job_manager] was stopped!")
  }

  async emit<N extends keyof Registry & string>(name: N, data: Registry[N]
  ): Promise<void> {
    const job = this.job_map.get(name);
    if (!job) throw new Error(`[JobManager] job '${name}' is not registered`);

    if (job.input_schema) {
      const result = job.input_schema.safeParse(data)
      if (!result.success) {
        throw new Error(`[jobs]{${job.name}} invalid payload: ${result.error.message}`)
      }
    }
    
    console.debug(`[job]{${job.name}} was added to queue.`)

    await this.worker.addJob(job.name, data as any)
  }
}

export const define_job = <Name extends string>(name: Name) => new JobBuilder<Name>(name)

export class JobBuilder<Name extends string = string, Input = any> {
  readonly name: Name
  input_schema?: z.ZodType<Input>
  private handler?: WorkHandler<Input>
  private worker?: WorkerUtils

  constructor(name: Name) {
    this.name = name
  }

  input<T>(schema: z.ZodType<T>): JobBuilder<Name, T> {
    this.input_schema = schema as any
    return this as any
  }

  work(handler: WorkHandler<Input>): JobBuilder<Name, Input> {
    this.handler = handler
    return this
  }

  async emit(data: Input) {
    if (!this.worker) throw new Error(`[job]{${this.name}} is not registered in a JobManager!`)

    if (this.input_schema) {
      const result = this.input_schema.safeParse(data)
      if (!result.success) {
        throw new Error(`[jobs]{${this.name}} invalid payload: ${result.error.message}`)
      }
    }
    
    console.debug(`[job]{${this.name}} was added to queue.`)

    await this.worker.addJob(this.name, data as any)
  }

  build(worker: WorkerUtils, db: DatabaseAccess, openrouter: OpenRouterProvider): [string, Task] {
    if (!this.handler) throw new Error(`[job]{${this.name}} no handler has been defined!`)

    this.worker = worker

    const task: Task = async (payload) => {
      try {
        await this.handler!(payload as Input, { db, openrouter })
      } catch (error) {
        console.error(`[job]{${this.name}} failed: ${(error as Error).message}`)
        throw error
      }
    }

    return [this.name, task]
  }
}