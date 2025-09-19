# Database Schema Documentation

## Overview
The Automatic Researcher application uses Supabase (PostgreSQL) for data persistence, moving from a file-based storage system to a relational database for better scalability, multi-user support, and structured querying.

## Database Tables

### 1. **users**
Stores user accounts and settings.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `email` | VARCHAR | Unique email address |
| `created_at` | TIMESTAMP | Account creation time |
| `credits_used` | DECIMAL(10,4) | Total credits consumed |
| `credits_limit` | DECIMAL(10,4) | Maximum credit allowance (default: 100) |
| `is_active` | BOOLEAN | Account status |
| `last_login` | TIMESTAMP | Most recent login |
| `settings` | JSONB | User preferences, API keys, etc. |

### 2. **problems**
Core table for research problems/tasks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `owner_id` | UUID | References users.id |
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
| `user_id` | UUID | References users.id |
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
- Users see only their profile
- Problems filtered by owner_id
- Problem files accessible only to problem owner
- Runs and usage logs restricted to owner

### Authentication
- Integrates with Supabase Auth
- User profiles auto-created on signup via trigger
- JWT tokens used for API authentication

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
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # For admin operations
```

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