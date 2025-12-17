import { create_job_factory } from "@shared/jobs/manager"
import type { Database } from "./index"

export const define_job = create_job_factory<Database>()
