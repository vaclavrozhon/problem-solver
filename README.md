# Automatic Researcher

An AI-powered research system that can solve problems and write papers automatically using multiple AI agents working in coordinated rounds.

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
│   ├── models.py          # Pydantic data models (74 lines)
│   ├── utils.py           # Utility functions (264 lines)
│   ├── papers.py          # Paper processing (122 lines)
│   ├── agents.py          # AI agent interactions (387 lines)
│   └── runner.py          # Round execution logic (158 lines)
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

## 🧩 Architecture Overview

### Core Components

**Orchestrator System** (Modular Architecture)
- **orchestrator.py**: Main entry point (102 lines, down from 1537)
- **orchestrator/models.py**: Pydantic models for structured AI outputs
- **orchestrator/utils.py**: File operations, status management, JSON processing
- **orchestrator/papers.py**: PDF extraction, paper parsing, context building
- **orchestrator/agents.py**: AI agent interactions (OpenAI API calls)
- **orchestrator/runner.py**: Round execution logic for research and writing

**Backend API** (FastAPI)
- **backend/main.py**: REST API endpoints for frontend
- **backend/services/tasks.py**: Task creation, deletion, management
- **backend/models.py**: API request/response models

**Frontend Interface** (React + TypeScript)
- **SolvingPage**: Problem-solving interface with rounds, conversations, files
- **WritingPage**: Paper writing interface with draft management
- **TaskCreationPage**: Create new problems or writing tasks

### AI Agent Workflow

**Problem Solving Mode:**
1. **Prover(s)**: Generate research progress and hypotheses
2. **Verifier**: Review prover outputs, provide feedback and verdict
3. **Summarizer**: Create concise round summaries and highlight key points

**Paper Writing Mode:**
1. **Paper Suggester**: Analyze current draft and provide improvement advice
2. **Paper Fixer**: Apply suggestions and rewrite LaTeX content
3. **LaTeX Compiler**: Attempt to compile the updated paper

### Data Flow

1. **Task Creation**: Users create problems or drafts through the web interface
2. **Round Execution**: Orchestrator runs AI agents in sequence
3. **Status Updates**: Real-time status updates via live_status.json
4. **Result Storage**: All outputs saved in structured directories
5. **Web Interface**: Frontend displays progress, conversations, and files

## 🚀 Key Features

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

### Technical Improvements
- **Modular architecture**: Orchestrator broken into logical, maintainable modules
- **Proper round tracking**: Accurate remaining rounds based on user requests
- **Clean UI**: Removed redundant sections, improved PDF handling
- **Delete functionality**: Complete task deletion with proper cleanup

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

### Rounds Structure
Each round creates a timestamped directory containing:
- **Agent outputs**: Raw text, JSON responses, and parsed results
- **Timing data**: Performance metrics for each agent
- **Context files**: List of files used as context
- **Progress updates**: Incremental progress and summaries

### Status Tracking
- **live_status.json**: Current phase, round number, timestamp, models used
- **run_metadata.json**: Original run configuration (rounds, preset, parameters)
- **timings.json**: Cumulative performance data across agents

### Output Files
- **progress.md**: Chronological progress across all rounds
- **summary.md**: Final summary of results
- **notes.md**: Research notes (updated by verifier)
- **output.md**: Current findings and conclusions (updated by verifier)

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

1. **Setup**: Install dependencies and configure environment variables
2. **Create Task**: Use web interface to create problem or writing task
3. **Run Rounds**: Specify number of rounds and model preset
4. **Monitor Progress**: Watch real-time updates in the web interface
5. **Review Results**: Access all outputs, conversations, and generated files

The system is designed for autonomous operation while providing full transparency into the AI reasoning process through structured outputs and comprehensive logging.