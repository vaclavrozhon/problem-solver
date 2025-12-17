import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test"
import { JobManager, create_job_factory } from "../src/jobs/manager"
import { Job } from "bullmq"
import { z } from "zod"

mock.module("bullmq", () => {
  return {
    Queue: class {
      name: string
      constructor(name: string) { this.name = name }
      add = mock(() => Promise.resolve({} as Job))
      close = mock(() => Promise.resolve())
    },
    Worker: class {
      handlers = new Map()
      constructor(name: string, processor: any) {
        // @ts-ignore - private access
        this.processor = async (job) => {
          try {
            return await processor(job)
          } catch (err) {
            const failed = this.handlers.get("failed")
            if (failed) await failed(job, err)
            throw err
          }
        }
      }
      on = mock((event, cb) => {
        this.handlers.set(event, cb)
      })
      close = mock(() => Promise.resolve())
    },
    QueueEvents: class {
      on = mock()
      close = mock(() => Promise.resolve())
    },
    Job: class { }
  }
})

type MockDB = { mock_db: true }
type MockOpenRouter = { mock_openrouter: true }

const mock_db: MockDB = { mock_db: true }
const mock_openrouter: MockOpenRouter = { mock_openrouter: true }

const define_job = create_job_factory<MockDB>()

describe("JobManager", () => {
  let manager: JobManager<any, MockDB>

  const create_manager = () => new JobManager<[], MockDB>({
    redis_url: "redis://localhost:6379",
    db: mock_db,
    openrouter: mock_openrouter as any,
  })

  beforeEach(() => {
    manager = create_manager()
  })

  afterEach(async () => {
    await manager.stop()
  })

  it("should register jobs correctly", () => {
    const job1 = define_job("test-job-1")
    const job2 = define_job("test-job-2")

    manager.register(job1, job2)

    expect(() => manager.register(job1))
      .toThrow(/duplicate job/)
  })

  it("should start and initialize queues", async () => {
    const job = define_job("test-job")
      .queue("test-queue")
    manager.register(job)

    await manager.start()

    const existing_queue = (manager as any).queues.get("test-queue")
    const non_existent_queue = (manager as any).queues.get("non-existent")
    expect(existing_queue).toBeDefined()
    expect(non_existent_queue).toBeUndefined()
  })

  it("should add jobs to the correct queue", async () => {
    const job_in_custom_queue = define_job("test-job").queue("test-queue")
    const job_in_default_queue = define_job("test-job-2")
    manager.register(job_in_custom_queue, job_in_default_queue)
    await manager.start()

    expect(job_in_custom_queue.get_queue_name()).toBe("test-queue")
    expect(job_in_default_queue.get_queue_name()).toBe("jobs")
  })

  it("should fail to emit if job is not registered", async () => {
    const job = define_job("test-job").queue("my-queue")
    manager.register(job)
    await manager.start()

    await expect(manager.queue("my-queue").emit("non-existent"))
      .rejects.toThrow(/not registered/)
  })

  it("should fail to emit if payload is invalid", async () => {
    const job = define_job("test-job").queue("my-queue").input(z.number())
    manager.register(job)
    await manager.start()

    await expect(manager.queue("my-queue").emit("test-job", "not a number"))
      .rejects.toThrow(/invalid payload/)
  })

  it("should process a job successfully", async () => {
    const payload = { some: "data" }
    const handler = mock((received_payload, { db, openrouter }) => {
      expect(received_payload).toEqual(payload)
      expect(db).toBe(mock_db)
      expect(openrouter).toBe(mock_openrouter)
      return Promise.resolve()
    })
    const job = define_job("test-job").work(handler)

    manager.register(job)
    await manager.start()

    // @ts-ignore - private access
    const worker = manager.workers.get("jobs")
    // @ts-ignore - private access
    const processor = worker.processor

    const mock_job = { name: "test-job", data: payload }
    await processor(mock_job)

    expect(handler).toHaveBeenCalled()
    expect(handler).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ db: mock_db, openrouter: mock_openrouter })
    )
  })

  it(`should trigger on("failed") handler when a job fails`, async () => {
    const failed_handler = mock()
    const job = define_job("test-job")
      .work(mock(() => { throw new Error("something failed") }))
      .on("failed", failed_handler)
    manager.register(job)
    await manager.start()

    // @ts-ignore - private access
    const worker = manager.workers.get("jobs")!
    // @ts-ignore - private access
    await expect(worker.processor({ name: "test-job" }))
      .rejects.toThrow("something failed")

    expect(failed_handler).toHaveBeenCalled()
    expect(failed_handler).toHaveBeenCalledWith(
      expect.objectContaining({ db: mock_db, openrouter: mock_openrouter }),
      expect.anything(),
      expect.any(Error),
    )
  })
})
