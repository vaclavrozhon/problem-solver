# Jaroslav Cimrman

An AI-powered research system that automates mathematical problem-solving and proof generation using large language models (LLMs). The system orchestrates multiple AI agents in a collaborative research process, with a web interface for monitoring and control.

## 🌐 Deployment Strategy

This system is designed to work in two environments:

- **🔧 Local Development**: For testing, development, and personal use. Run `python3 run.py` to start both backend and frontend locally.
- **🌍 Global Production**: Public web application deployed on Railway for users worldwide. The developer pushes changes from local development that automatically deploy to the global version.

Users access the global version, while development and testing happen locally with periodic pushes to production.

## Overview

This project implements an automated research pipeline where AI agents work together to:
- Generate mathematical proofs and solutions (Prover agents)
- Verify and critique the proposed solutions (Verifier agent)
- Summarize research progress (Summarizer agent)
- Write and refine academic papers (Paper writing agents)

The system supports iterative rounds of research, with each round building on previous findings through feedback loops and accumulated knowledge.

## 🏗️ Project Structure

```
automatic-researcher/
├── README.md                   # This file
├── requirements.txt           # Python dependencies
├── venv/                     # Python virtual environment
├── orchestrator.py           # Main orchestrator entry point (102 lines)
├── orchestrator_old.py       # Original monolithic orchestrator (backup)
├── web_app.py               # Web application server
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints and server logic
│   ├── config.py           # Configuration settings
│   ├── models.py           # Data models
│   └── services/
│       └── tasks.py        # Task management services
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── SolvingPage.tsx      # Problem solving interface
│   │   │   ├── WritingPage.tsx      # Paper writing interface
│   │   │   └── TaskCreationPage.tsx # Task creation interface
│   │   ├── api.ts          # API client functions
│   │   └── [other React files]
│   ├── package.json        # Node.js dependencies
│   └── [other frontend files]
├── orchestrator/           # Modular orchestrator package
│   ├── __init__.py        # Package initialization
│   ├── models.py          # Pydantic data models for agent outputs
│   ├── utils.py           # Utility functions for status, file I/O
│   ├── papers.py          # PDF processing and context extraction
│   ├── agents.py          # OpenAI API interactions, prompt handling
│   ├── runner.py          # Round execution logic for research/paper modes
│   ├── problem_agents.py  # Prover, Verifier, Summarizer agents
│   ├── paper_agents.py    # Paper Suggester and Fixer agents
│   └── file_manager.py    # Research file and paper management
├── prompts/               # AI agent prompts
│   ├── prover.md          # Prover agent system prompt
│   ├── verifier.md        # Verifier agent system prompt
│   ├── summarizer.md      # Summarizer agent system prompt
│   ├── paper_suggester.md # Paper suggester system prompt
│   └── paper_fixer.md     # Paper fixer/writer system prompt
├── problems/              # Problem-solving tasks
│   └── [problem-name]/
│       ├── task.md        # Problem description
│       ├── notes.md       # Research notes
│       ├── output.md      # Current findings
│       ├── progress.md    # Round-by-round progress
│       ├── summary.md     # Final summary
│       ├── papers/        # Reference papers (PDFs)
│       ├── papers_parsed/ # Extracted text from papers
│       └── runs/          # Execution rounds
│           ├── live_status.json      # Current status
│           ├── run_metadata.json     # Run configuration
│           └── round-XXXX/          # Individual rounds
│               ├── prover-XX.*.txt  # Prover outputs
│               ├── verifier.*.md    # Verifier feedback
│               ├── summarizer.*.md  # Round summaries
│               └── timings.json     # Performance metrics
└── drafts/                # Paper writing tasks
    └── [draft-name]/
        ├── final_output.tex       # Current LaTeX draft
        ├── final_output.pdf       # Compiled PDF (if successful)
        ├── papers/               # Reference papers
        ├── papers_parsed/        # Extracted text
        ├── drafts/              # Draft versions
        └── runs/                # Writing rounds
            ├── live_status.json  # Current status
            ├── run_metadata.json # Run configuration
            └── round-XXXX/      # Individual rounds
                ├── paper_suggester.*     # Suggester advice
                ├── paper_fixer.*         # Writer output
                ├── final_output.tex      # Updated draft
                ├── paper.compile.*       # LaTeX compilation
                └── timings.json          # Performance metrics
```

## 💾 Database Setup

The system uses **Supabase** (PostgreSQL) for data storage, providing multi-user support, authentication, and scalable data management.

### Key Features:
- **Multi-user support** with Row Level Security (RLS)
- **Usage tracking** and billing support
- **Structured storage** for problems, files, and run history
- **Real-time capabilities** via Supabase subscriptions

### Database Tables:
- `users` - User accounts and settings
- `problems` - Research problems/tasks
- `problem_files` - All text files (tasks, outputs, papers)
- `runs` - Execution sessions with parameters
- `usage_log` - API usage tracking for billing

See **[DATABASE.md](DATABASE.md)** for complete schema documentation, setup instructions, and migration guide from file-based storage.

### Environment Variables:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # For admin operations
```

## 🚀 Railway Deployment

To deploy this application on Railway for public internet access:

### Quick Deploy

1. **Fork this repository** on GitHub
2. **Create Railway account** at https://railway.app
3. **Connect GitHub** and select your forked repo
4. **Set environment variables** in Railway dashboard:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   AR_DATA_ROOT=/app/data
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. **Deploy** - Railway will automatically detect the configuration

### Configuration Files

- **`railway.json`** - Railway deployment configuration
- **`railway-start.py`** - Production startup script (backend only)
- **`requirements.txt`** - Python dependencies

### Development vs Production

- **Local development**: Use `python3 run.py` (runs backend + frontend)
- **Railway production**: Uses `railway-start.py` (backend only)

The app will be available at `https://your-app-name.up.railway.app`

### Notes

- Frontend is not included in Railway deployment (backend API only)
- Consider deploying frontend separately on Netlify/Vercel
- Database connection via Supabase (no local storage in production)
- OpenAI API key is required for AI functionality

## 🧩 Architecture Overview

### Core Components

**Orchestrator System** (Modular Architecture)
- **orchestrator.py**: Main CLI entry point for running research/paper rounds
- **orchestrator/runner.py**: Manages the complete flow of each research round
- **orchestrator/problem_agents.py**: Research agents (Prover, Verifier, Summarizer)
- **orchestrator/paper_agents.py**: Paper writing agents (Suggester, Fixer)
- **orchestrator/agents.py**: Common agent utilities and OpenAI API interactions
- **orchestrator/models.py**: Pydantic models for structured agent outputs
- **orchestrator/file_manager.py**: Manages research files and paper attachments
- **orchestrator/utils.py**: Helper functions for status tracking, file I/O
- **orchestrator/papers.py**: PDF processing and context extraction

**Backend API** (FastAPI)
- **backend/main.py**: FastAPI application setup with CORS middleware
- **backend/routers/problems.py**: Problem CRUD operations, status tracking, round execution
- **backend/routers/tasks.py**: Background task execution for running rounds
- **backend/routers/drafts.py**: Draft paper management endpoints
- **backend/routers/auth.py**: Basic authentication endpoints (placeholder)
- **backend/services/tasks.py**: Task queue implementation for async operations
- **backend/models.py**: API request/response models
- **backend/config.py**: Environment and path configuration

**Frontend Interface** (React + TypeScript)
- **pages/SolvingPage.tsx**: Main research interface with problem list and details
- **pages/WritingPage.tsx**: Paper writing interface with draft management
- **pages/OverviewPage.tsx**: Dashboard view of all problems
- **pages/TaskCreationPage.tsx**: Create new problems or writing tasks
- **components/solving/ProblemSidebar.tsx**: Problem list with status indicators
- **components/solving/ProblemDetails.tsx**: Tabbed interface (Status/Conversations/Files)
- **components/solving/StatusPanel.tsx**: Real-time status monitoring and controls
- **components/solving/ConversationsPanel.tsx**: Round-by-round agent conversations
- **components/solving/FilesPanel.tsx**: Problem file editor
- **components/solving/RuntimeHistory.tsx**: Execution timeline visualization
- **components/solving/ProverConfig.tsx**: Prover agent configuration UI
- **components/solving/DeleteModals.tsx**: Confirmation dialogs
- **api.ts**: Backend API communication layer

### AI Agent Workflow

**Research Mode (Problem Solving):**
1. **Prover Phase**: Multiple prover agents (configurable 1-N) work in parallel
   - Each prover can have different focus strategies (creative, rigorous, etc.)
   - Optional calculator access for computations
   - Custom instructions per round
2. **Verifier Phase**: Single verifier reviews all prover outputs
   - Provides targeted feedback for each prover
   - Assigns scores (promising/uncertain/unlikely)
   - Updates research notes and proofs
3. **Summarizer Phase**: Creates concise round summary
   - Highlights key developments
   - Generates one-line summary for quick reference

**Paper Writing Mode:**
1. **Paper Suggester**: Analyzes current draft and research
   - Provides specific improvement recommendations
   - Identifies missing sections or weak arguments
2. **Paper Fixer**: Applies suggestions to improve the paper
   - Rewrites LaTeX content
   - Maintains academic paper structure
3. **LaTeX Compiler**: Automatic compilation with error handling

### Data Flow

1. **Task Creation**: Users create problems or drafts through the web interface
2. **Round Execution**: Orchestrator runs AI agents in sequence
3. **Status Updates**: Real-time status updates via live_status.json
4. **Result Storage**: All outputs saved in structured directories
5. **Web Interface**: Frontend displays progress, conversations, and files

## 🚀 Key Features

### Real-time Monitoring
- Live status updates during execution with phase tracking
- Progress indicators showing round X of Y
- Detailed timing information for each agent
- Error reporting with component-level granularity

### Multi-Agent Collaboration
- Parallel prover execution for diverse approaches
- Centralized verification for quality control
- Iterative refinement through feedback loops
- Accumulated knowledge across rounds

### Problem Solving
- **Multi-prover support**: Run multiple provers in parallel for diverse approaches
- **Iterative refinement**: Verifier provides feedback for continuous improvement
- **Progress tracking**: Detailed round-by-round progress and summaries
- **Paper integration**: Automatically parse and include reference papers

### Paper Writing
- **Draft management**: Track multiple draft versions
- **LaTeX compilation**: Automatic compilation with error handling
- **Structured feedback**: AI suggester provides specific improvement advice
- **PDF generation**: Compiled papers available as clickable links

### User Interface
- **Real-time status**: Live updates on current phase and progress
- **Conversation view**: Structured display of AI agent interactions (parsed JSON)
- **File management**: Easy access to all generated files and papers
- **Task management**: Create, run, delete, and reset tasks

### Flexible Configuration
- Customizable number of provers per round (1-N)
- Different prover focus strategies (creative, rigorous, systematic)
- Model selection via environment variables
- Per-problem paper attachments with descriptions
- Custom focus descriptions for targeted research

### Web Interface Features
- Problem management (create, delete, reset)
- Real-time execution monitoring with auto-refresh
- Round-by-round conversation history
- File editing capabilities (problem.md, notes.md, proofs.md)
- Stop/resume execution control
- Prover configuration UI
- PDF paper viewing and management

## 🔧 Configuration

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API key for AI agents
- `AR_MODE`: Override mode (research/writing)
- `AR_NUM_PROVERS`: Number of parallel provers (default: 1)
- `AR_PROVER_TEMPERATURE`: Temperature for prover agents (default: 0.8)
- `AR_GIT_AUTOCOMMIT`: Enable automatic Git commits after rounds

### Model Configuration
- `OPENAI_MODEL_PROVER`: Model for prover agents (default: gpt-5)
- `OPENAI_MODEL_VERIFIER`: Model for verifier agent (default: gpt-5)
- `OPENAI_MODEL_SUMMARIZER`: Model for summarizer agent (default: gpt-5-mini)
- `OPENAI_MODEL_PAPER_SUGGESTER`: Model for paper suggester (default: same as prover)
- `OPENAI_MODEL_PAPER_FIXER`: Model for paper fixer (default: same as prover)

## 📊 File Organization

### Problem Directory Structure
```
problems/[problem-name]/
├── problem.md              # Problem statement (user-provided)
├── notes.md               # Research notes (agent-maintained)
├── proofs.md              # Accumulated proofs (agent-maintained)
├── papers/                # Attached research papers
│   ├── paper1.pdf
│   └── paper1_description.txt
└── runs/                  # Execution history
    ├── live_status.json   # Current execution status
    ├── batch_status.json  # Batch round tracking
    ├── prover_configs.json # Prover configurations
    ├── run_metadata.json  # Run-level metadata
    └── round-XXXX/        # Per-round data
        ├── prover-XX.*.* # Prover inputs/outputs
        ├── verifier.*    # Verifier inputs/outputs
        ├── summarizer.*  # Summarizer inputs/outputs
        └── timings.json  # Execution timing
```

### Agent File Naming Convention
- `.pre.prompt.txt`: System prompt before variable substitution
- `.prompt.txt`: Final prompt sent to the model
- `.raw.json`: Raw API response
- `.out.json`: Parsed structured output
- `.text.txt`: Raw text response
- `.response.full.json`: Complete response metadata
- `.pre.meta.json`: Pre-execution metadata

## 🎯 Usage Modes

### Research Mode (`--mode research`)
Focus on problem-solving with iterative improvement:
- Multiple provers can work in parallel
- Verifier provides critical feedback
- Summarizer highlights key developments
- Early stopping when problem appears solved

### Paper Mode (`--mode paper`)
Focus on writing and improving academic papers:
- Paper suggester analyzes current draft
- Paper fixer applies improvements
- Automatic LaTeX compilation
- PDF generation for review

## 🏃‍♂️ Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+ (required for Vite and other frontend dependencies)
- OpenAI API key with access to GPT models

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd automatic-researcher
```

2. **Set up Python environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Set up frontend**
```bash
cd frontend
npm install
```

4. **Configure environment**
```bash
# Create ~/.openai.env file
echo "OPENAI_API_KEY=your-api-key-here" > ~/.openai.env
```

### Running the System

#### Option 1: CLI (Direct Orchestrator)
```bash
# Run research rounds
python orchestrator.py problems/[problem-name] --rounds 3 --mode research

# Generate paper
python orchestrator.py problems/[problem-name] --rounds 1 --mode paper
```

#### Option 2: Web Interface
```bash
# Terminal 1: Start backend
python -m backend.main
# Or: uvicorn backend.main:app --reload --port 8001

# Terminal 2: Start frontend
cd frontend
npm run dev
# Access at http://localhost:5173
```

### Creating a Problem

1. Via Web Interface:
   - Navigate to Overview page
   - Click "New Problem"
   - Enter problem statement
   - Optionally attach research papers

2. Via CLI:
   - Create directory: `problems/your-problem/`
   - Add `problem.md` with problem statement
   - Optionally add PDFs to `papers/` directory

## 🔍 How It Works

### Research Round Execution

1. **Initialization**: Load problem statement, papers, and previous round summaries
2. **Prover Phase**:
   - Each prover receives full context (problem, papers, previous work)
   - Provers work independently in parallel
   - Output structured JSON with reasoning
3. **Verification Phase**:
   - Verifier reviews all prover outputs
   - Provides feedback and scores
   - Updates persistent notes.md and proofs.md files
4. **Summarization Phase**:
   - Creates concise summary of round progress
   - Highlights key developments
   - Generates one-line summary for UI
5. **Loop**: Continue for specified number of rounds or until solved

### Key Design Decisions

- **Stateless Agents**: Each agent call is independent, context built fresh
- **Structured Output**: Using OpenAI's JSON mode for reliable parsing
- **Parallel Execution**: Multiple provers can work simultaneously
- **Persistent State**: notes.md and proofs.md accumulate knowledge
- **Modular Architecture**: Clean separation of concerns for maintainability

## 📝 Development Notes

This is an active research project focused on automating mathematical problem-solving. The system demonstrates multi-agent LLM collaboration for complex reasoning tasks.

### Current Limitations
- Basic authentication (placeholder implementation)
- Limited to OpenAI models (GPT-5, GPT-5-mini)
- No distributed execution support
- Web interface requires manual refresh for some updates

### Future Improvements
- Support for other LLM providers (Anthropic, Google, etc.)
- Distributed prover execution
- Advanced authentication and user management
- Real-time WebSocket updates
- Enhanced paper processing with vector search
