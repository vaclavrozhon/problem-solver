import { Queue, Worker, Job, QueueEvents, WorkerListener, JobType } from "bullmq"
import { z } from "zod"
import { createOpenRouter, OpenRouterProvider } from "@openrouter/ai-sdk-provider"

import { get_db } from "../db/plugins"

import { QueueState, JobInputSchema, JobStatus } from "@shared/admin"

const DEFAULT_QUEUE = "jobs"
const DEFAULT_CONCURRENCY = 10

type RedisConfig = ReturnType<typeof parse_redis_url>

type JobManagerOptions = {
  /** When true, only connects to Redis for reading state - no workers spawned */
  observer_mode?: boolean
  /** Override the default REDIS_URL from environment */
  redis_url?: string
}

type Database = ReturnType<typeof get_db>

type JobContext = {
  db: Database
  openrouter: OpenRouterProvider
}

type JobHandler<Input = unknown> = (
  payload: Input,
  utils: JobContext
) => Promise<void>

type AnyJobBuilder = JobBuilder<any, any, any>

type BuildersArray = readonly AnyJobBuilder[]

/**
 * Helper type to extract only those events from WorkerListener where the first argument is a Job.
 * This ensures we only allow listening to events that are specific to a job instance.
 * We use NonNullable to include events like 'failed' where the job might be undefined (e.g. stalled jobs).
 */
type JobEventKeys = {
  [K in keyof WorkerListener]: NonNullable<Parameters<WorkerListener[K]>[0]> extends Job ? K : never
}[keyof WorkerListener]

/**
 * Augmented event handler type that prepends JobContext to the original BullMQ event handler arguments.
 */
type AugmentedEventHandler<E extends JobEventKeys> = (
  utils: JobContext,
  ...args: Parameters<WorkerListener[E]>
) => void | Promise<void>

/**
 * Extracts the union of all queue names from an array of JobBuilders.
 * Example: if builders have queues "A" and "B", this type is "A" | "B".
 */
export type QueueNameUnion<Bs extends BuildersArray> =
  Bs[number] extends JobBuilder<any, any, infer Q> ? Q : never

/**
 * Extracts the subset of JobBuilders that belong to a specific queue.
 */
type BuildersForQueue<Bs extends BuildersArray, Q extends string> =
  Extract<Bs[number], JobBuilder<any, any, Q>>

/**
 * Creates a registry object type for a specific queue, mapping job names to their input types.
 * Used for type-safe job emission.
 */
type QueueJobRegistry<Bs extends BuildersArray, Q extends string> = {
  [B in BuildersForQueue<Bs, Q> as B["name"]]: B extends JobBuilder<any, infer I, any> ? I : never
}

/**
 * JobManager handles the lifecycle of queues, workers, and job registration.
 * It provides a type-safe API for emitting jobs to specific queues.
 */
export class JobManager<Builders extends BuildersArray = []> {
  // Options
  private observer_mode: boolean
  private redis_url: string

  // Dependencies (not initialized in observer mode)
  private db!: Database
  private openrouter!: OpenRouterProvider

  // BullMQ components
  private queues = new Map<string, Queue>()
  private workers = new Map<string, Worker>()
  private queue_events = new Map<string, QueueEvents>()

  // Job Registry
  private jobs: AnyJobBuilder[] = []
  private job_map: Record<string, Record<string, AnyJobBuilder>> = {}

  constructor(options?: JobManagerOptions) {
    this.observer_mode = options?.observer_mode ?? false
    this.redis_url = options?.redis_url ?? Bun.env.REDIS_URL
  }

  /**
   * Registers new job builders with the manager.
   * Returns a new JobManager instance with updated type definitions.
   */
  register<NewBuilders extends readonly AnyJobBuilder[]>(...jobs: NewBuilders):
    JobManager<[...Builders, ...NewBuilders]> {
    for (const job of jobs) {
      const queue_name = job.get_queue_name()

      // Check for duplicate job names within the same queue
      const duplicate_job_name_in_queue = this.jobs.some(j =>
        j.get_queue_name() === queue_name && j.name === job.name
      )
      if (duplicate_job_name_in_queue) {
        throw new Error(`[job_manager] duplicate job '${job.name}' in queue '${queue_name}'!`)
      }

      this.jobs.push(job)

      if (!this.job_map[queue_name]) this.job_map[queue_name] = {}
      this.job_map[queue_name][job.name] = job
    }
    // Cast to update the generic type parameter with the new builders
    return this as unknown as JobManager<[...Builders, ...NewBuilders]>
  }

  /**
   * Starts the job manager: connects to Redis and initializes queues.
   * In observer mode, only queue connections are created (no workers).
   */
  async start() {
    const redis_config = parse_redis_url(this.redis_url)
    const queue_names = new Set(this.jobs.map(j => j.get_queue_name()))

    for (let queue_name of queue_names) {
      this.initialize_queue_connection(queue_name)
    }

    if (this.observer_mode) {
      console.log(`👀 [job_manager] started in observer mode with ${queue_names.size} queues.`)
      return
    }

    // Worker mode: initialize dependencies, events, and workers
    this.db = get_db()
    this.openrouter = createOpenRouter({ apiKey: Bun.env.OPENROUTER_API_KEY })

    for (let queue_name of queue_names) {
      this.initialize_queue_events(queue_name, redis_config)
      this.initialize_worker(queue_name, redis_config)
    }

    for (let job of this.jobs) {
      const queue_name = job.get_queue_name()
      const queue = this.queues.get(queue_name)!
      job.bind(queue, this.db, this.openrouter)
    }

    console.log(`👍 [job_manager] started with ${queue_names.size} queues.`)
  }

  /**
   * Stops all workers and closes queue connections.
   * It should wait for all workers to finish before closing the connection.
   */
  async stop() {
    for (const worker of this.workers.values()) await worker.close()
    for (const queue of this.queues.values()) await queue.close()
    console.log("🚫 [job_manager] was stopped!")
  }

  /**
   * Returns the details of all queues with job counts, details and input schemas.
   * Used in AdminDashboard for overview of all jobs.
   */
  async get_all_job_details(): Promise<Record<QueueNameUnion<Builders>, QueueState>> {
    const result = {} as Record<QueueNameUnion<Builders>, QueueState>

    for (const [name, queue] of this.queues) {
      const counts = await queue.getJobCounts(
        "active",
        "waiting",
        "delayed",
        "completed",
        "failed",
      )
      const schemas: Record<string, JobInputSchema> = {}
      for (const [job_name, job] of Object.entries(this.job_map[name])) {
        schemas[job_name] = job.input_schema
          ? z.toJSONSchema(
              job.input_schema, 
              { target: "openapi-3.0" },
            )
          : null
      }

      result[name as QueueNameUnion<Builders>] = {
        counts: {
          running: counts.active,
          queued: counts.waiting,
          delayed: counts.delayed,
          finished: counts.completed,
          failed: counts.failed,
        },
        jobs: {
          // TODO: Decide how many we want to retrieve.
          // oldest first for queue – next to be processed
          queued: await get_job_summaries(queue, "waiting", 10, true),
          // for others latest first
          running: await get_job_summaries(queue, "active", 10, false),
          delayed: await get_job_summaries(queue, "delayed", 10, false),
          finished: await get_job_summaries(queue, "completed", 10, false),
          failed: await get_job_summaries(queue, "failed", 10, false)
        },
        schemas,
      }
    }

    return result
  }

  /**
   * Retrieves job details by `job_id` and `queue_name`.
   * Used in API for Dashboard insights for given Job.
   */
  async get_job(queue_name: string, job_id: string) {
    const queue = this.queues.get(queue_name)
    if (!queue) return null
    const job = await queue.getJob(job_id)
    if (!job) return null

    const state = await job.getState()
    if (state === "waiting-children" || state === "unknown" || state === "prioritized") return null
    const state_status_map: Record<typeof state, JobStatus> = {
      active: "running",
      completed: "finished",
      waiting: "queued",
      delayed: "delayed",
      failed: "failed",
    }
    const status = state_status_map[state]

    return {
      job,
      job_status: status as JobStatus,
    }
  }

  /**
   * Returns a type-safe emitter for a specific queue.
   * Throws in observer mode - observers cannot emit jobs.
   */
  queue<Q extends QueueNameUnion<Builders>>(queue_name: Q) {
    if (this.observer_mode) throw new Error("[job_manager] cannot emit jobs in observer mode!")

    type SubReg = QueueJobRegistry<Builders, Q & string>
    const self = this

    return {
      async emit<N extends keyof SubReg & string>(name: N, data?: SubReg[N]) {
        const job = self.job_map[queue_name]?.[name]
        if (!job) throw new Error(`[job_manager]{${name}} is not registered in queue '${queue_name}'!`)

        await job.emit(data)
      }
    }
  }

  private initialize_queue_connection(queue_name: string) {
    const queue = new Queue(queue_name, {
      connection: {
        url: this.redis_url,
        enableOfflineQueue: false,
      }
    })
    this.queues.set(queue_name, queue)
  }

  private initialize_queue_events(queue_name: string, redis_config: RedisConfig) {
    const queue_events = new QueueEvents(queue_name, { connection: redis_config })
    queue_events.on("error", error => {
      console.error(`[job_manager][${queue_name}] error: ${error.message}`)
    })
    this.queue_events.set(queue_name, queue_events)
  }

  private initialize_worker(queue_name: string, redis_config: RedisConfig) {
    const worker = new Worker(
      queue_name,
      (job) => this.process_job(queue_name, job),
      { connection: redis_config, concurrency: DEFAULT_CONCURRENCY }
    )
    this.workers.set(queue_name, worker)

    // Attach job event listeners
    const jobs_in_queue = this.jobs.filter(j => j.get_queue_name() === queue_name)
    const handlers_by_event = new Map<string, Map<string, Function>>()

    for (const job of jobs_in_queue) {
      for (const { event, handler } of job.event_handlers) {
        if (!handlers_by_event.has(event)) {
          handlers_by_event.set(event, new Map())
        }
        handlers_by_event.get(event)!.set(job.name, handler)
      }
    }

    const context: JobContext = { db: this.db, openrouter: this.openrouter }

    for (const [event, handlers] of handlers_by_event) {
      worker.on(event as any, async (job: Job, ...args: any[]) => {
        if (job && job.name && handlers.has(job.name)) {
          try {
            await handlers.get(job.name)!(context, job, ...args)
          } catch (error) {
            console.error(`[${queue_name}]{${job.name}} error in '${event}' handler:`, error)
          }
        }
      })
    }
  }

  private async process_job(queue_name: string, job: Job) {
    const builder = this.job_map[queue_name]?.[job.name]
    if (!builder) {
      throw new Error(`[job_manager] no handler registered for job '${job.name}' in queue '${queue_name}'`)
    }

    // Validate Input
    if (builder.input_schema) {
      const result = builder.input_schema.safeParse(job.data)
      if (!result.success) {
        throw new Error(`[job]{${builder.name}} invalid payload: ${result.error.message}`)
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

/**
 * Helper to define a new job builder.
 */
export const define_job = <Name extends string>(name: Name) => new JobBuilder<Name>(name)

/**
 * Builder class for configuring and defining a job.
 * Supports fluent API for setting input schema, handler, and queue.
 */
export class JobBuilder<Name extends string = string, Input = unknown, Q extends string = "jobs"> {
  readonly name: Name
  input_schema?: z.ZodTypeAny

  private handler?: JobHandler<Input>
  private in_queue?: Queue
  private queue_name: Q = DEFAULT_QUEUE as unknown as Q

  // Publicly accessible for JobManager to wire up listeners
  readonly event_handlers: { event: string, handler: Function }[] = []

  // Dependencies injected at runtime
  private db?: Database
  private openrouter?: OpenRouterProvider

  constructor(name: Name) {
    this.name = name
  }

  /**
   * Define the Zod schema for the job input.
   */
  input<T extends z.ZodTypeAny>(schema: T): JobBuilder<Name, z.infer<T>, Q> {
    this.input_schema = schema
    return this as unknown as JobBuilder<Name, z.infer<T>, Q>
  }

  /**
   * Define the handler function that processes the job.
   */
  work(handler: JobHandler<Input>): JobBuilder<Name, Input, Q> {
    this.handler = handler
    return this
  }

  /**
   * Specify the queue this job belongs to.
   */
  queue<Q2 extends string>(name: Q2): JobBuilder<Name, Input, Q2> {
    this.queue_name = name as unknown as Q
    return this as unknown as JobBuilder<Name, Input, Q2>
  }

  /**
   * Register a handler for a specific job event (e.g., "completed", "failed").
   * Only events where the first argument is a Job are supported.
   * The handler receives the standard BullMQ arguments followed by the JobContext.
   */
  on<E extends JobEventKeys>(event: E, handler: AugmentedEventHandler<E>): JobBuilder<Name, Input, Q> {
    this.event_handlers.push({ event, handler: handler as Function })
    return this
  }

  /**
   * Emit a job to the queue.
   */
  async emit(data?: Input) {
    if (!this.in_queue) throw new Error(`[job]{${this.name}} is not registered in the JobManager!`)

    if (this.input_schema) {
      const result = this.input_schema.safeParse(data)
      if (!result.success) {
        throw new Error(`[job]{${this.name}} invalid payload: ${result.error.message}`)
      }
    }

    console.log(`[job]{${this.name}} was added to queue.`)

    await this.in_queue.add(this.name, data)
  }

  /**
   * Internal: Bind the job to a queue and dependencies.
   */
  bind(queue: Queue, db: Database, openrouter: OpenRouterProvider) {
    this.in_queue = queue
    this.db = db
    this.openrouter = openrouter
  }

  get_queue_name(): Q {
    return this.queue_name
  }

  /**
   * Internal: Invoke the handler with dependencies.
   */
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

async function get_job_summaries(queue: Queue, job_status: JobType, count: number, asc?: boolean) {
  const jobs = await queue.getJobs([job_status], 0, count - 1, asc)
  return jobs.map(job => ({
    /**
     * BullMQ docs state that all jobs must have unique ID
     * but typescript disagrees
     * https://docs.bullmq.io/guide/jobs/job-ids
     */
    id: job.id!,
    name: job.name,
    created_at: job.timestamp,
    started_at: job.processedOn,
    attempts: job.attemptsStarted,
    error: job.failedReason && job.stacktrace
      ? {
        message: job.failedReason,
        stacktrace: job.stacktrace,
      }
      : null
  }))
}