import { create_job_factory } from "@shared/jobs/manager"
import type { Database } from "../db"

export const define_job = create_job_factory<Database>()
