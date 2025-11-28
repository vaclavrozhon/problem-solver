import { Queue, Worker, Job } from "bullmq"
import { z } from "zod"
import { createOpenRouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider"

import { get_db } from "../db/plugins"

const DEFAULT_QUEUE = "jobs"
const DEFAULT_CONCURRENCY = 10

type Database = ReturnType<typeof get_db>

type JobHandler<Input = unknown> = (
  payload: Input,
  utils: { db: Database; openrouter: OpenRouterProvider }
) => Promise<void>

type AnyJobBuilder = JobBuilder<any, any, any>

type BuildersArray = readonly AnyJobBuilder[]

type QueueNameUnion<Bs extends BuildersArray> =
  Bs[number] extends JobBuilder<any, any, infer Q> ? Q : never

type BuildersForQueue<Bs extends BuildersArray, Q extends string> =
  Extract<Bs[number], JobBuilder<any, any, Q>>

type QueueJobRegistry<Bs extends BuildersArray, Q extends string> = {
  [B in BuildersForQueue<Bs, Q> as B["name"]]: B extends JobBuilder<any, infer I, any> ? I : never
}

export class JobManager<Builders extends BuildersArray = []> {
  private db!: Database
  private openrouter!: OpenRouterProvider
  private queues = new Map<string, Queue>()
  private workers = new Map<string, Worker>()
  private jobs: AnyJobBuilder[] = []
  private job_map = new Map<string, AnyJobBuilder>()

  register<NewBuilders extends readonly AnyJobBuilder[]>(...jobs: NewBuilders):
    JobManager<[...Builders, ...NewBuilders]> {
    for (const job of jobs) {
      const queue_name = job.get_queue_name()
      const duplicate_job_name_in_queue = this.jobs.some(j =>
        j.get_queue_name() === queue_name && j.name === job.name
      )
      if (duplicate_job_name_in_queue) {
        throw new Error(`[job_manager] duplicate job '${job.name}' in queue '${queue_name}'!`)
      }
      this.jobs.push(job)
      this.job_map.set(job.name, job)
    }
    return this as unknown as JobManager<[...Builders, ...NewBuilders]>
  }

  async start() {
    this.db = get_db()
    this.openrouter = createOpenRouter({ apiKey: Bun.env.OPENROUTER_API_KEY })

    const redis_url = parse_redis_url(Bun.env.REDIS_URL)

    const queue_names = new Set(this.jobs.map(j => j.get_queue_name()))

    for (let queue_name of queue_names) {
      const queue = new Queue(queue_name, { connection: redis_url })
      this.queues.set(queue_name, queue)

      const worker = new Worker(
        queue_name,
        this.process_job.bind(this),
        { connection: redis_url, concurrency: DEFAULT_CONCURRENCY }
      )

      this.workers.set(queue_name, worker)
    }

    for (let job of this.jobs) {
      const queue_name = job.get_queue_name()
      const queue = this.queues.get(queue_name)!
      job.bind(queue, this.db, this.openrouter)
    }

    console.log(`👍 [job_manager] started with ${queue_names.size} queues.`)
  }

  async stop() {
    for (const worker of this.workers.values()) await worker.close()
    for (const queue of this.queues.values()) await queue.close()
    console.log("🚫 [job_manager] was stopped!")
  }

  queue<Q extends QueueNameUnion<Builders>>(queue_name: Q) {
    type SubReg = QueueJobRegistry<Builders, Q & string>
    const self = this
    return {
      async emit<N extends keyof SubReg & string>(name: N, data: SubReg[N]) {
        const job = self.job_map.get(name)
        if (!job) throw new Error(`[job_manager]{${name}} is not registered!`)
        const expected_queue = job.get_queue_name()
        if (expected_queue !== String(queue_name)) {
          throw new Error(`[job_manager]{${name}} belongs to queue '${expected_queue}'`)
        }
        await job.emit(data)
      }
    }
  }

  private async process_job(job: Job) {
    const builder = this.job_map.get(job.name)
    if (!builder) {
      throw new Error(`[job_manager] no handler registered for job '${job.name}'`)
    }

    if (builder.input_schema) {
      const result = builder.input_schema.safeParse(job.data)
      if (!result.success) {
        throw new Error(`[jobs]{${builder.name}} invalid payload: ${result.error.message}`)
      }
    }

    console.log(`[job]{${builder.name}} started work.`)
    try {
      await builder.invoke(job.data)
    } catch (error) {
      console.error(`[job]{${builder.name}} failed: ${(error as Error).message}`)
      throw error
    }
    console.log(`[job]{${builder.name}} successfully finished!`)
  }
}

export const define_job = <Name extends string>(name: Name) => new JobBuilder<Name>(name)

export class JobBuilder<Name extends string = string, Input = unknown, Q extends string = "jobs"> {
  readonly name: Name
  input_schema?: z.ZodTypeAny
  private handler?: JobHandler<Input>
  private in_queue?: Queue
  private queue_name: Q = DEFAULT_QUEUE as unknown as Q
  private db?: Database
  private openrouter?: OpenRouterProvider

  constructor(name: Name) {
    this.name = name
  }

  input<T extends z.ZodTypeAny>(schema: T): JobBuilder<Name, z.infer<T>, Q> {
    this.input_schema = schema
    return this as unknown as JobBuilder<Name, z.infer<T>, Q>
  }

  work(handler: JobHandler<Input>): JobBuilder<Name, Input, Q> {
    this.handler = handler
    return this
  }

  queue<Q2 extends string>(name: Q2): JobBuilder<Name, Input, Q2> {
    this.queue_name = name as unknown as Q
    return this as unknown as JobBuilder<Name, Input, Q2>
  }

  async emit(data: Input) {
    if (!this.in_queue) throw new Error(`[job]{${this.name}} is not registered in the JobManager!`)

    if (this.input_schema) {
      const result = this.input_schema.safeParse(data)
      if (!result.success) {
        throw new Error(`[jobs]{${this.name}} invalid payload: ${result.error.message}`)
      }
    }

    console.log(`[job]{${this.name}} was added to queue.`)

    await this.in_queue.add(this.name, data)
  }

  bind(queue: Queue, db: Database, openrouter: OpenRouterProvider) {
    this.in_queue = queue
    this.db = db
    this.openrouter = openrouter
  }

  get_queue_name(): Q {
    return this.queue_name
  }

  async invoke(payload: unknown) {
    if (!this.handler || !this.db || !this.openrouter) {
      throw new Error(`[job]{${this.name}} no handler has been defined!`)
    }
    await this.handler(payload as Input, { db: this.db, openrouter: this.openrouter })
  }
}

function parse_redis_url(connection_url: string) {
  const url = new URL(connection_url)
  const port = Number(url.port)
  return {
    host: url.hostname,
    port,
    username: url.username,
    password: url.password,
  }
}