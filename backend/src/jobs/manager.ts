import { PgBoss, SendOptions, WorkHandler } from "pg-boss"
import type { z } from "zod"

import { get_db_connection_string } from "../db/plugins"

export class JobBuilder<Name extends string = string, Input = any> {
  readonly name: Name
  private input_schema?: z.ZodType<Input>
  private options: SendOptions = {
    retryLimit: 0,
  }
  private handler?: WorkHandler<Input>
  private boss?: PgBoss

  constructor(name: Name) {
    this.name = name
  }

  input<T>(schema: z.ZodType<T>): JobBuilder<Name, T> {
    this.input_schema = schema as any
    return this as any
  }

  work(handler: WorkHandler<Input>) {
    const wrappedHandler: WorkHandler<Input> = async (jobs) => {
      try {
        return await handler(jobs);
      } catch (error) {
        console.error(`Job ${this.name} failed`, error);
        throw error;
      }
    };
    this.handler = wrappedHandler;
    return this;
  }

  set_boss(boss: PgBoss) {
    this.boss = boss;
    return this;
  }

  async emit(data: Input) {
    if (!this.boss) throw new Error(`[job]{${this.name}} is not registered in a JobManager!`)
    let payload = data
    if (this.input_schema) {
      const result = this.input_schema.safeParse(data)
      if (!result.success) {
        throw new Error(`Invalid payload for job ${this.name}: ${result.error.message}`)
      }
      payload = result.data as Input
    }

    console.debug(`[job]{${this.name}} emitted"`)
    return await this.boss.send(this.name as string, payload as any, this.options)
  }

  build() {
    if (!this.handler) {
      throw new Error(`No handler defined for job ${this.name}`)
    }

    return {
      name: this.name as string,
      schema: this.input_schema,
      handler: this.handler,
    }
  }
}

export const define_job = <Name extends string>(name: Name) => new JobBuilder<Name>(name)

// Registry maps job names to their input payload types
export class JobManager<Registry extends Record<string, any> = {}> {
  private boss: PgBoss
  private jobs: JobBuilder<any, any>[] = []
  private jobMap: Map<string, JobBuilder<any, any>> = new Map()

  constructor() {
    this.boss = new PgBoss(get_db_connection_string())
    this.boss.on("error", error => console.error(`[JobManager]{error}: ${JSON.stringify(error, null, 2)}`))
  }

  register<Builders extends readonly JobBuilder<any, any>[]>(...jobs: Builders): JobManager<
    Registry & { [K in Builders[number] as K["name"]]: K extends JobBuilder<any, infer I> ? I : never }
  > {
    for (const jb of jobs) {
      const job = jb as unknown as JobBuilder<any, any>
      job.set_boss(this.boss)
      this.jobs.push(job)
      this.jobMap.set(job.name as string, job)
    }
    return this as unknown as JobManager<
      Registry & { [K in Builders[number] as K["name"]]: K extends JobBuilder<any, infer I> ? I : never }
    >
  }

  async start() {
    this.boss = await this.boss.start()
    for (const job of this.jobs) {
      const built = job.build()
      await this.boss.createQueue(built.name)
      await this.boss.work(
        built.name,
        { pollingIntervalSeconds: 0.5 }, // TODO what limits should we impose if any?
        built.handler,
      )
    }
    console.log("🔥 [JobManager] started!")
  }

  async stop() {
    /**
     * If `graceful` === `true`, then stopping will actually really wait for all jobs to
     * finish, set their `status` to `completed` in DB and close the connection.
     * If `graceful` === `false`, the job work function still executes until the end
     * because i guess there is no way to stop it executing,
     * unless we explicitly process.exit() the backend?
     * But after it completes the execution it throws an error that crashes Elysia
     * because it attempts to edit the `status` to `completed` in the DB but fails
     * cause there is no active connection since we just stopped it.
     * But the job's `status` gets set to `failed` in the DB by the `stop` function
     * and on next start is not actually rerun. So it just stays like that.
     */
    await this.boss.stop({ graceful: true })
    console.log("🚫 [JobManager] stopped!")
  }

  job<N extends keyof Registry & string>(name: N): JobBuilder<N, Registry[N]> {
    const found = this.jobMap.get(name)
    if (!found) throw new Error(`[JobManager] job '${name}' is not registered`)
    return found as JobBuilder<N, Registry[N]>
  }

  async emit<N extends keyof Registry & string>(name: N, data: Registry[N]): Promise<string | null> {
    const job = this.jobMap.get(name)
    if (!job) throw new Error(`[JobManager] job '${name}' is not registered`)
    return await (job as JobBuilder<N, Registry[N]>).emit(data)
  }
}