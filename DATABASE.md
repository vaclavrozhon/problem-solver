# Database Schema Documentation

## Overview
The Automatic Researcher application uses Supabase (PostgreSQL) for data persistence, moving from a file-based storage system to a relational database for better scalability, multi-user support, and structured querying. The system implements a centralized authentication architecture with JWT-based user verification and per-request database client creation for secure data access.

## Database Tables

### 1. **profiles**
Stores user profile information and settings. References Supabase's `auth.users` table.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, references auth.users(id) |
| `credits_used` | DECIMAL(10,4) | Total credits consumed |
| `credits_limit` | DECIMAL(10,4) | Maximum credit allowance (default: 100) |
| `settings` | JSONB | User preferences, API keys, etc. |
| `created_at` | TIMESTAMP | Profile creation time |
| `updated_at` | TIMESTAMP | Last profile update time |

**Note:** User authentication is handled by Supabase's `auth.users` table. The `profiles` table only stores application-specific data like credits and settings.

### 2. **problems**
Core table for research problems/tasks. This table is the single source of truth for the current high-level status of each problem and maintains a lightweight pointer to the currently active run (if any).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `owner_id` | UUID | References profiles.id |
| `name` | VARCHAR(255) | Problem identifier/name |
| `status` | VARCHAR(50) | 'idle', 'running', 'completed', 'failed' |
| `current_round` | INT | Current research round (0 = not started) |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last modification (auto-updated) |
| `config` | JSONB | Default settings for this problem |
| `active_run_id` | INT (nullable) | References `runs.id` for the single active run (only set when `status = 'running'`) |

Important invariants (enforced by application code; recommended to enforce by DB constraints):
- Each problem has at most one active run.
- A problem has an active run if and only if `status = 'running'` and `active_run_id IS NOT NULL`.

Recommended DB constraints/indexes (see Migration section below):
- Partial unique index on `runs(problem_id)` where `status = 'running'` to ensure at most one active run per problem.
- Check constraint on `problems` that ties `status` and `active_run_id` together: `(status = 'running' AND active_run_id IS NOT NULL) OR (status <> 'running' AND active_run_id IS NULL)`.

### 3. **problem_files**
Stores all text files associated with problems (replaces file system).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `problem_id` | INT | References problems.id |
| `round` | INT | 0 for base files, 1+ for round-specific |
| `file_type` | VARCHAR(50) | File category (see below) |
| `file_name` | VARCHAR(255) | Original filename |
| `content` | TEXT | File contents |
| `metadata` | JSONB | Additional data (tokens, cost, model) |
| `created_at` | TIMESTAMP | Upload/creation time |

**File Types:**
- `task` - Problem description
- `notes` - Research notes
- `proofs` - Rigorous proofs
- `output` - Main results
- `prover_output` - AI prover responses
- `verifier_output` - Verifier feedback
- `summarizer_output` - Round summaries
- `paper` - Generated papers
 - `prover_raw` - Full raw model response for prover calls (debug)
 - `verifier_raw` - Full raw model response for verifier calls (debug)
 - `summarizer_raw` - Full raw model response for summarizer calls (debug)
 - `response_ids` - Reasoning/continuation IDs per agent/model (debug)
 - `round_meta` - Per-round timing and stage metadata JSON (debug)

### 4. **runs**
Tracks research run sessions (history). The current active run is linked from `problems.active_run_id`; a run row is never deleted when it completes (history is preserved).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `problem_id` | INT | References problems.id |
| `status` | VARCHAR(50) | 'running', 'stopped', 'failed', 'completed' |
| `started_at` | TIMESTAMP | Run start time |
| `completed_at` | TIMESTAMP | Run end time |
| `total_cost` | DECIMAL(10,4) | Total cost in credits |
| `error_message` | TEXT | Error details if failed |
| `parameters` | JSONB | Complete run configuration |

**Parameters JSON Structure:**
```json
{
  "requested_rounds": 5,
  "prover_count": 3,
  "temperature": 0.7,
  "preset": "aggressive",
  "models": {
    "prover": "gpt-5",
    "verifier": "gpt-5",
    "summarizer": "gpt-5-mini"
  },
  "focus_description": "Focus on edge cases",
  "max_tokens": 4000
}
```

### 5. (Optional) **active_runs** view
Convenience view to list currently running runs without filtering in every query.

```sql
CREATE OR REPLACE VIEW public.active_runs AS
SELECT * FROM public.runs WHERE status = 'running';
```

### 6. **usage_log**
Detailed API usage tracking for billing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `user_id` | UUID | References profiles.id |
| `problem_id` | INT | References problems.id (nullable) |
| `run_id` | INT | References runs.id (nullable) |
| `operation` | VARCHAR(50) | Operation type |
| `model` | VARCHAR(50) | AI model used |
| `tokens_in` | INT | Input tokens |
| `tokens_out` | INT | Output tokens |
| `cost` | DECIMAL(10,4) | Cost in credits |
| `timestamp` | TIMESTAMP | Operation time |

**Operation Types:**
- `prover_call` - Prover AI invocation
- `verifier_call` - Verifier AI invocation
- `summarizer_call` - Summarizer invocation
- `paper_generation` - Paper writing

## Data Migration from File System

### File System → Database Mapping

| File Path | Database Location |
|-----------|-------------------|
| `problems/{name}/task.txt` | `problem_files`: round=0, file_type='task' |
| `problems/{name}/notes.md` | `problem_files`: round=0, file_type='notes' |
| `problems/{name}/proofs.md` | `problem_files`: round=0, file_type='proofs' |
| `problems/{name}/output.md` | `problem_files`: round=0, file_type='output' |
| `problems/{name}/runs/live_status.json` | `problems`: status, current_round columns |
| `problems/{name}/runs/round-XXXX/*.json` | `problem_files`: round=X, various file_types |
| `problems/{name}/papers/*.md` | `problem_files`: round=0, file_type='paper' |

## Security

### Row Level Security (RLS)
All tables have RLS enabled to ensure users can only access their own data:
- Users see only their own profile
- Problems filtered by owner_id
- Problem files accessible only to problem owner
- Runs and usage logs restricted to owner

Recommended policies (illustrative):
- `problems`: `owner_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE
- `problem_files`: join to `problems` by `problem_id` and check the same owner
- `runs`: owner via join to `problems(problem_id)`

### Authentication Architecture
The system uses a centralized authentication approach:

**JWT Token Verification:**
- Each API request includes a JWT token in the Authorization header
- Tokens are verified using Supabase's `auth.get_user(jwt=token)` (validates signature/expiry and returns the user)
- User information (id/email) comes from the returned user object

**Per-Request Database Clients:**
- Authenticated Supabase clients are created for each request
- Clients are configured with the user's JWT token for RLS enforcement
- All database operations automatically respect user ownership

**FastAPI Dependencies:**
- `get_current_user()`: Extracts and validates user from JWT token
- `get_optional_user()`: Optional authentication for public endpoints
- `get_db_client()`: Creates authenticated Supabase client for database operations
- `get_db_client_with_token()`: Creates user-authenticated client for background tasks
- `supabase_as_user()`: Creates user-specific Supabase client

**Integration:**
- Integrates with Supabase Auth for user management
- User profiles auto-created on signup via trigger
- JWT tokens used for API authentication
- All service methods accept authenticated database clients as parameters

## Indexes
Strategic indexes for common queries:
- `idx_problems_owner` - Fast user problem listing
- `idx_problem_files` - Efficient file retrieval by problem/round
- `idx_usage_log_user` - Quick usage summaries
- `runs_one_active_per_problem` (partial unique) - At most one running run per problem

## Automatic Features

### Triggers
- `update_problems_updated_at` - Auto-updates timestamp on problem changes
- `on_auth_user_created` - Creates user profile on signup

### Functions
- `update_updated_at_column()` - Timestamp update logic
- `handle_new_user()` - Profile creation logic
- `increment_credits(user_id uuid, delta numeric)` - Atomically increase credits in profiles (used by backend; optional fallback if not present)

## Database Setup

To recreate this schema in a new Supabase project, run the SQL script in the Supabase SQL editor. The complete setup script is available in the initial project documentation.

## Environment Variables

Required for application:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## Backend Architecture

### Service Layer Pattern
All database operations are handled through service classes that accept authenticated Supabase clients:

**DatabaseService:**
- All methods accept `db: Client` as first parameter
- Methods include: `create_problem()`, `get_user_problems()`, `update_problem_file()`, `update_problem_status()`, etc.
- `update_problem_status()` now accepts optional `current_round` parameter for progress tracking
- Automatic RLS enforcement through authenticated client
  - Not anymore: RLS updated so that `SELECT` on `public.problems` and `public.problem_files` is available to all `authenticated` users to select all rows for the purposes of archive (upcoming feature)

**TaskService:**
- Updated to use centralized authentication
- Methods include: `create_problem()`, `create_draft()`, `delete_problem()`, `reset_problem()`
- All methods accept `db: Client` parameter for database operations

### Router Dependencies
All API endpoints use FastAPI dependency injection:

```python
@router.post("/problems")
async def create_problem(
    request: CreateProblemRequest,
    user: AuthedUser = Depends(get_current_user),
    db = Depends(get_db_client)
):
    # user.sub contains the user ID
    # db is an authenticated Supabase client
    problem = await DatabaseService.create_problem(db, ...)
```

### Asynchronous Research Execution
The system now supports fully asynchronous research execution with real-time progress tracking:

**Background Task Architecture:**
- Research runs are executed as background asyncio tasks
- Each research round runs in a thread pool executor to avoid blocking the event loop
- Database is updated after each round completion with current progress
- Stop signals are checked between rounds for responsive cancellation

**Progress Tracking:**
- `problems.current_round` field tracks active round number
- `problems.status` indicates overall execution state ('idle', 'running', 'completed', 'failed')
- Frontend polling receives real-time updates every 2 seconds
- Users can stop research mid-execution with immediate response

**Database Updates During Execution:**
```python
# Update status and round progress
await DatabaseService.update_problem_status(db, problem_id, "running", round_idx)

# Each round completion triggers database update
await DatabaseService.update_problem_status(db, problem_id, "running", round_idx + 1)
```

**Background Task Database Access:**
- Uses `get_db_client_with_token()` with user's JWT token
- Maintains RLS enforcement in background operations
- User context preserved for secure data access

## Research Run Execution Interface

The system now implements a **database-only execution model** that completely eliminates file system dependencies. All research execution state, progress tracking, and outputs are stored in the database.

### Run Execution Architecture

**Database-First Design:**
- All execution state stored in `runs.parameters` JSONB field (progress, phase, round info, costs)
- Current active run id is denormalized into `problems.active_run_id` for O(1) access
- Round outputs stored as rows in `problem_files` table
- No file system usage during execution
- Complete audit trail of all research activities

**Run Lifecycle:**

1. **Initialization Phase:**
   ```python
   # Create run record with initial parameters
   run_record = await DatabaseService.create_run(db, problem_id, {
       'total_rounds': 3,
       'current_round': 0,
       'provers_count': 2,
       'phase': 'initializing',
       'started_at': '2024-01-01T10:00:00Z',
       'completed_rounds': []
   })
   ```

2. **Round Execution Phase:**
   ```python
   # Update progress for each round
   await DatabaseService.update_run(db, run_id, parameters={
       'current_round': round_idx,
       'phase': f'executing_round_{round_idx}',
       'round_start_time': '2024-01-01T10:05:00Z'
   })

   # Store round outputs in problem_files
   await DatabaseService.create_problem_file(
       db=db,
       problem_id=problem_id,
       round_num=round_idx,
       file_type='prover_output',
       filename='prover-01.json',
       content=json.dumps(prover_result),
       metadata={'run_id': run_id, 'model': 'gpt-5'}
   )
   ```

3. **Completion Phase:**
   ```python
   # Finalize run with completion status
   await DatabaseService.update_run(db, run_id,
       status='completed',
       total_cost=15.75,
       parameters={
           'phase': 'completed',
           'final_round': 3,
           'total_cost': 15.75
       })
   ```

### Parameters JSON Schema

The `runs.parameters` field stores comprehensive execution metadata:

```json
{
  "total_rounds": 5,
  "current_round": 3,
  "provers_count": 2,
  "temperature": 0.7,
  "preset": "gpt5",
  "phase": "executing_round_3",
  "started_at": "2024-01-01T10:00:00Z",
  "completed_rounds": [
    {
      "round": 1,
      "completed_at": "2024-01-01T10:05:00Z",
      "cost": 5.25,
      "verdict": "needs_improvement"
    },
    {
      "round": 2,
      "completed_at": "2024-01-01T10:10:00Z",
      "cost": 5.50,
      "verdict": "partially_correct"
    }
  ],
  "total_cost_so_far": 10.75,
  "prover_configs": [...],
  "focus_description": "Focus on edge cases",
  "verifier_config": {...}
}
```

When a run transitions to a terminal state (`completed`, `failed`, `stopped`), application logic clears `problems.active_run_id` and updates `problems.status` accordingly. This preserves history in `runs` while ensuring overview queries stay lightweight.

### Execution Phases

The `phase` field tracks detailed execution state:

- `initializing` - Setting up run parameters
- `executing_round_N` - Currently processing round N
- `completed_round_N` - Finished processing round N
- `error_round_N` - Error occurred in round N
- `completed` - All rounds finished successfully
- `failed` - Run terminated due to error

### Output Storage Strategy

**Round Files Structure:**
```
problem_files table:
├── round=0 (base files)
│   ├── file_type='task' - Problem description
│   ├── file_type='notes' - Research notes
│   └── file_type='output' - Main results
├── round=1 (first research round)
│   ├── file_type='prover_output' - Prover 1 result
│   ├── file_type='prover_output' - Prover 2 result
│   ├── file_type='verifier_output' - Verification feedback
│   └── file_type='summarizer_output' - Round summary
└── round=2 (second research round)
    └── ... (similar structure)
```

**Metadata Tracking:**
Each file includes comprehensive metadata:
```json
{
  "run_id": 123,
  "model": "gpt-5",
  "tokens_used": 1500,
  "cost": 0.045,
  "prover_index": 1,
  "execution_time_ms": 2500
}
```

### Error Handling & Recovery

**Graceful Degradation:**
- Round-level errors don't fail entire run
- Failed rounds logged in parameters with error details
- Execution continues to next round where possible
- Complete error audit trail maintained

**Error Storage:**
```json
{
  "phase": "error_round_2",
  "last_error": "API rate limit exceeded",
  "completed_rounds": [...],
  "failed_rounds": [
    {
      "round": 2,
      "error": "API rate limit exceeded",
      "error_at": "2024-01-01T10:08:00Z"
    }
  ]
}
```

### Cost Tracking Integration

**Real-time Cost Monitoring:**
- Each API call logged to `usage_log` table
- Running total maintained in `runs.parameters.total_cost_so_far`
- Final cost stored in `runs.total_cost`
- User credit balance updated automatically

**Cost Breakdown:**
```sql
-- Get detailed cost breakdown for a run
SELECT
  operation,
  model,
  SUM(cost) as operation_cost,
  SUM(tokens_in + tokens_out) as total_tokens
FROM usage_log
WHERE run_id = ?
GROUP BY operation, model;
```

### Status Monitoring & Frontend Integration

**Real-time Progress Updates:**
- Frontend polls `/problems/status` endpoint every few seconds
- This endpoint now returns a lightweight status derived only from `problems` (phase/current_round/is_running/last_updated)
- When a specific problem is opened, the frontend calls `/problems/{problem_name}/status` which loads the detailed files/rounds and (optionally) derives deeper insights

**Status Response Format (lightweight):**
```json
{
  "problem": {...},
  "overall": {
    "phase": "running",
    "current_round": 2,
    "is_running": true,
    "total_rounds": 2,
    "last_updated": "2024-01-01T10:15:00Z"
  },
  "rounds": [],
  "base_files": {}
}
```

For detailed per-problem view, the UI calls `/problems/{problem_name}/status`, which computes rounds and extracts summaries from `problem_files`.

If you need to show current-run metadata in overview without a join, you can optionally denormalize a tiny `active_run_summary` JSONB column in `problems` (maintained by triggers) to store `{started_at, phase, total_rounds, current_round, cost_so_far}`.

## Query Examples

### Get all problems for a user:
```sql
SELECT * FROM problems
WHERE owner_id = auth.uid()
ORDER BY created_at DESC;
```

### Get current run status for a problem:
```sql
SELECT r.*, p.name as problem_name
FROM runs r
JOIN problems p ON r.problem_id = p.id
WHERE p.owner_id = auth.uid()
AND r.status = 'running'
ORDER BY r.started_at DESC;
```

### Enforce at most one active run per problem (index):
```sql
CREATE UNIQUE INDEX IF NOT EXISTS runs_one_active_per_problem
ON public.runs(problem_id)
WHERE status = 'running';
```

### Tie problem status to active_run_id (check constraint):
```sql
ALTER TABLE public.problems
ADD CONSTRAINT problems_running_active_run_chk
CHECK (
  (status = 'running' AND active_run_id IS NOT NULL)
  OR
  (COALESCE(status, '') <> 'running' AND active_run_id IS NULL)
);
```

### Optional: View of currently active runs
```sql
CREATE OR REPLACE VIEW public.active_runs AS
SELECT * FROM public.runs WHERE status = 'running';
```

### Optional: Atomic credits increment function used by backend
```sql
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id uuid, p_delta numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_used = COALESCE(credits_used, 0) + p_delta
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Get all files for a specific round:
```sql
SELECT * FROM problem_files
WHERE problem_id = ? AND round = ?
ORDER BY file_type;
```

### Get run execution timeline:
```sql
SELECT
  r.started_at,
  r.completed_at,
  r.status,
  r.parameters->>'phase' as current_phase,
  r.parameters->>'current_round' as current_round,
  r.total_cost
FROM runs r
WHERE r.problem_id = ?
ORDER BY r.started_at DESC;
```

### Calculate total usage for current month:
```sql
SELECT SUM(cost) as total_cost
FROM usage_log
WHERE user_id = auth.uid()
AND timestamp >= date_trunc('month', CURRENT_DATE);
```