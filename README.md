# 🔬 Automatic Researcher

A fully automated React + FastAPI system for solving mathematical research problems using GPT models through a prover-verifier loop.

## 🚀 Quick Start

### One-Command Startup
```bash
# Set up your API key (one time only)
echo "OPENAI_API_KEY=sk-your-key-here" > ~/.openai.env

# Option 1: Streamlit-only (recommended)
python3 run_streamlit.py

# Option 2: React + FastAPI (if you have frontend set up)
python3 run.py
```

That's it! The script will:
- Install any missing dependencies
- Start the FastAPI backend (port 8000)
- Start the React frontend (port 3000)
- Open your browser to http://localhost:3000
- Keep both running until you press Ctrl+C

### Alternative: Manual Setup
If you prefer to run services separately:

```bash
# Terminal 1 - Backend
cd backend && pip install -r requirements.txt && python server.py

# Terminal 2 - Frontend  
cd frontend && npm install && npm run dev
```

## 🏗️ Architecture

### Data Persistence
All model outputs are automatically saved to the repository:

```
problems/
├── your-problem/
│   ├── task.tex                    # Problem statement
│   ├── progress.md                 # Cumulative progress (auto-generated)
│   └── runs/                       # All model outputs saved here
│       ├── round-0001/
│       │   ├── prover.out.json     # Full prover output 
│       │   ├── verifier.out.json   # Full verifier output
│       │   ├── progress.appended.md # Progress added this round
│       │   ├── verifier.feedback.md # Detailed feedback
│       │   └── verifier.summary.md  # Human summary
│       └── round-0002/
│           └── ...
```

### System Components

- **React Frontend** (Next.js): Real-time dashboard with auto-refresh
- **FastAPI Backend**: Problem management, orchestrator control, WebSocket updates  
- **Orchestrator**: Runs prover-verifier loops with structured JSON outputs
- **File System**: All conversations permanently stored in git repo

## 💡 Features

- **Fully Automatic**: Click "Start" on any problem and watch it work
- **Real-time Updates**: Auto-refreshing status with WebSocket support
- **Persistent Storage**: All model outputs saved to filesystem/git
- **Rich UI**: Expandable conversations, verdict tracking, progress monitoring
- **Background Execution**: Problems run independently, survive browser refresh

## 📁 Adding Problems

Create a folder in `problems/` with:
```bash
mkdir problems/my-problem
echo "Prove the Riemann Hypothesis" > problems/my-problem/task.tex
# Optional: Add PDFs or other reference materials
```

Supported task files: `task.tex`, `task.txt`, `task.md`

## 🎮 Usage

1. **Overview Tab**: Dashboard showing all problems and statistics
2. **Problem Control Tab**: Start/stop problems, view latest summaries  
3. **Detailed View Tab**: Full conversation history, round-by-round analysis

Each problem automatically:
- Runs prover-verifier loops in background processes
- Saves all model outputs to `runs/` directory
- Maintains cumulative `progress.md` file
- Tracks verdicts: promising, uncertain, unlikely

## 🔧 Configuration

### Environment Variables
```bash
# Required
OPENAI_API_KEY=sk-your-key-here

# Optional (defaults shown)
OPENAI_MODEL_PROVER=gpt-5-mini
OPENAI_MODEL_VERIFIER=gpt-5-mini
REASONING_PROVER=high
REASONING_VERIFIER=medium
VERBOSITY_PROVER=high
VERBOSITY_VERIFIER=low
```

### API Endpoints

The FastAPI backend provides:
- `GET /api/problems` - List all problems
- `GET /api/problems/{id}` - Get problem details
- `POST /api/problems/{id}/start` - Start problem
- `POST /api/problems/{id}/stop` - Stop problem
- `WebSocket /ws/problems` - Real-time updates

## 📊 How It Works

1. **Prover**: Explores problem, generates ideas, maintains progress notes
2. **Verifier**: Audits correctness, identifies gaps, provides feedback
3. **Loop**: Continues automatically for specified rounds
4. **Persistence**: Everything saved to git repository structure

The system uses:
- **Structured JSON outputs** for reliable parsing
- **Append-only progress files** for clean research tracking  
- **Background processes** for non-blocking execution
- **Auto-refresh UI** for real-time monitoring

## 🔄 Development

### Backend Development
```bash
cd backend
uvicorn server:app --reload --port 8000
```

### Frontend Development
```bash
cd frontend 
npm run dev
```

The React app will auto-refresh when you make changes to the backend API.

## 🛠️ Troubleshooting

**API Key Issues:**
- Ensure `~/.openai.env` contains your key
- Backend logs will show "API key not configured" if missing

**Problems Not Appearing:**
- Check that problem directories contain `task.tex/txt/md`
- Verify backend is running on port 8000
- Check browser network tab for API errors

**Process Management:**
- Orphaned processes: restart backend server
- Problems stuck running: use stop button or restart

All model outputs are preserved in the file system regardless of crashes.