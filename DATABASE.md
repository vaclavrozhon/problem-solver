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
Core table for research problems/tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `owner_id` | UUID | References profiles.id |
| `name` | VARCHAR(255) | Problem identifier/name |
| `status` | VARCHAR(50) | 'idle', 'running', 'completed' |
| `current_round` | INT | Current research round (0 = not started) |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last modification (auto-updated) |
| `config` | JSONB | Default settings for this problem |

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

### 4. **runs**
Tracks research run sessions.

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

### 5. **usage_log**
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

### Authentication Architecture
The system uses a centralized authentication approach:

**JWT Token Verification:**
- Each API request includes a JWT token in the Authorization header
- Tokens are verified offline using Supabase's `get_claims()` method
- User information is extracted from token claims (user ID, email, etc.)

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

## Automatic Features

### Triggers
- `update_problems_updated_at` - Auto-updates timestamp on problem changes
- `on_auth_user_created` - Creates user profile on signup

### Functions
- `update_updated_at_column()` - Timestamp update logic
- `handle_new_user()` - Profile creation logic

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

## Query Examples

### Get all problems for a user:
```sql
SELECT * FROM problems
WHERE owner_id = auth.uid()
ORDER BY created_at DESC;
```

### Get all files for a specific round:
```sql
SELECT * FROM problem_files
WHERE problem_id = ? AND round = ?
ORDER BY file_type;
```

### Calculate total usage for current month:
```sql
SELECT SUM(cost) as total_cost
FROM usage_log
WHERE user_id = auth.uid()
AND timestamp >= date_trunc('month', CURRENT_DATE);
```