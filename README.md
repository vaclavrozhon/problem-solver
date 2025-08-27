# 🔬 Automatic Researcher

A fully automated system for solving mathematical research problems using GPT-5 models through a prover-verifier-summarizer loop with strict JSON schema enforcement and comprehensive debugging support.

## 🚀 Quick Start

### One-Command Startup
```bash
# Set up your API key (one time only)
echo "OPENAI_API_KEY=sk-your-key-here" > ~/.openai.env

# Run the system (renamed from run_simple.py)
python3 run.py
```

That's it! The script will:
- Create/update a virtual environment with all dependencies
- Start the Streamlit web interface (port 8501)
- Open your browser automatically
- Keep running until you press Ctrl+C

### Direct Orchestrator Usage
For command-line testing without the UI:
```bash
python3 orchestrator.py problems/your-problem --rounds 1 --start-round 1
```

## 🏗️ Architecture

### Data Persistence
All model outputs and debugging information are automatically saved:

```
problems/
├── your-problem/
│   ├── task.tex                    # Problem statement
│   ├── *.pdf                       # PDFs next to task are auto-included
│   ├── papers/                     # Additional papers directory
│   ├── progress.md                 # Cumulative progress (auto-generated)
│   ├── summary.md                  # Aggregated summaries + user feedback
│   └── runs/                       # All model outputs saved here
│       ├── live_status.json        # Current phase and timing
│       ├── round-0001/
│       │   ├── prover.prompt.txt   # Full system+user prompts
│       │   ├── prover.raw.json     # Complete API response with usage
│       │   ├── prover.text.txt     # Extracted text for parsing
│       │   ├── prover.out.json     # Structured prover output
│       │   ├── verifier.prompt.txt # Full verifier prompts
│       │   ├── verifier.raw.json   # Complete verifier response
│       │   ├── verifier.text.txt   # Extracted verifier text
│       │   ├── verifier.out.json   # Structured verifier output
│       │   ├── verifier.feedback.md # Detailed feedback
│       │   ├── summarizer.*        # Same pattern for summarizer
│       │   ├── timings.json        # Performance metrics
│       │   └── user.feedback.md    # Human-in-the-loop feedback
│       └── round-0002/
│           └── ...
```

### System Components

- **Streamlit UI**: Web dashboard with real-time updates and model preset selection
- **Orchestrator**: Runs prover-verifier-summarizer loops with strict JSON schema enforcement
- **Debugging Support**: Saves all prompts, raw responses, and extracted text for analysis
- **Auto Git Commits**: Each round is automatically committed for version control

## 💡 Features

- **GPT-5 Support**: Uses GPT-5 with maximum reasoning depth (`reasoning.effort=high`)
- **Strict JSON Schema**: Enforces exact output format via Responses API
- **Comprehensive Debugging**: Saves all prompts, raw responses, and parsed outputs
- **PDF Extraction**: Automatically extracts and includes PDF content (PyMuPDF)
- **Human-in-the-Loop**: Add feedback during rounds that persists across sessions
- **Model Presets**: Quick switching between GPT-5 and GPT-4o-mini configurations
- **Auto Git Integration**: Each round automatically committed with verdict
- **Robust Error Handling**: Fail-soft JSON parsing, default values for missing fields
- **Real-time Monitoring**: Live phase tracking with accurate elapsed time

## 📁 Adding Problems

Create a folder in `problems/` with:
```bash
mkdir problems/my-problem
echo "Prove that P != NP" > problems/my-problem/task.tex
# PDFs next to task.* are automatically included
cp reference-paper.pdf problems/my-problem/
# Or place PDFs in papers/ subdirectory
mkdir problems/my-problem/papers/
cp *.pdf problems/my-problem/papers/
```

Supported formats:
- Task files: `task.tex`, `task.txt`, `task.md`
- Reference materials: PDFs are automatically extracted (first 10 pages)
- All `.txt` and `.md` files in problem directory are included

## 🎮 Usage

### Web Interface (http://localhost:8501)

1. **Overview Tab**: 
   - Dashboard with all problems
   - Total rounds, running status, latest verdicts
   - Click problem name to view details

2. **Detailed View Tab**:
   - Select problem and model preset (gpt5 or fast)
   - Click "▶ Run more rounds" to start
   - View Prover ↔ Verifier ↔ Summarizer conversation
   - Add human feedback that persists across rounds
   - Monitor current phase with elapsed time
   - See included files (task, PDFs, previous feedback)

### Model Presets

- **gpt5 (default)**: Uses GPT-5 for prover/verifier, GPT-5-mini for summarizer
- **fast (test)**: Uses GPT-4o-mini for all roles (cheaper, faster, less capable)

## 🔧 Configuration

### Environment Variables
```bash
# Required - store in ~/.openai.env
OPENAI_API_KEY=sk-your-key-here

# Optional - override model selection (set before starting)
OPENAI_MODEL_PROVER=gpt-5        # Default from preset
OPENAI_MODEL_VERIFIER=gpt-5      # Default from preset
OPENAI_MODEL_SUMMARIZER=gpt-5-mini  # Default from preset
```

### Model Configuration

Models are configured in `web_app.py`:
```python
MODEL_PRESETS = {
    "gpt5": {
        "prover": "gpt-5",      # Maximum reasoning
        "verifier": "gpt-5",    # Maximum reasoning
        "summarizer": "gpt-5-mini",
    },
    "fast": {
        "prover": "gpt-4o-mini",
        "verifier": "gpt-4o-mini", 
        "summarizer": "gpt-4o-mini",
    },
}
```

All GPT-5 calls use:
- `reasoning={"effort": "high"}` - Maximum depth and cost
- Strict JSON schema enforcement via Responses API
- Medium verbosity via system prompts

## 📊 How It Works

1. **Prover**: 
   - Receives problem context, previous progress, PDFs
   - Generates mathematical exploration with mini-plans
   - Returns structured JSON with progress_md, new_files, next_actions

2. **Verifier**: 
   - Audits prover's work for correctness and rigor
   - Creates claim status tables (OK/Unclear/Broken)
   - Returns verdict (promising/uncertain/unlikely) with feedback

3. **Summarizer**: 
   - Condenses round into human-readable summary
   - Highlights key findings and next questions
   - Aggregates into persistent summary.md

4. **Persistence**: 
   - Each round auto-committed to git with verdict
   - All raw responses saved for debugging
   - Human feedback preserved across sessions

The system uses:
- **GPT-5 Responses API** with `reasoning.effort=high` for maximum depth
- **Strict JSON Schema** enforcement for reliable parsing
- **Fail-soft error handling** to keep rounds running despite issues
- **Unix timestamps** for timezone-proof elapsed time tracking

## 🛠️ Troubleshooting

### Empty Prover/Verifier Output
- Check `runs/round-XXXX/prover.raw.json` for error messages
- Look at `prover.prompt.txt` to verify PDFs were included
- Ensure OpenAI SDK is updated: `./venv/bin/pip install --upgrade openai>=1.40.0`

### Incorrect Elapsed Time
- System now uses Unix timestamps - refresh browser if seeing old format
- Check `runs/live_status.json` for current phase timestamp

### PDFs Not Being Included
- Place PDFs either next to `task.*` or in `papers/` subdirectory
- Check `runs/round-XXXX/context.files.json` for included files list
- Ensure PyMuPDF is installed: `pip install pymupdf`

### Model Access Issues
- GPT-5 requires special access - check `prover.raw.json` for "model_not_found"
- Use "fast" preset with GPT-4o-mini if GPT-5 unavailable
- Connection errors show exact reason in UI when clicking "Run more rounds"

### Debugging Failed Rounds
Each round saves comprehensive debug info:
```bash
cat runs/round-0001/prover.prompt.txt   # See what was sent
cat runs/round-0001/prover.raw.json     # Full API response
cat runs/round-0001/prover.text.txt     # Extracted text
cat runs/round-0001/timings.json        # Performance metrics
```

All outputs preserved even if rounds fail - nothing is lost.