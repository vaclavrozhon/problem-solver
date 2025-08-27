#!/usr/bin/env python3
"""
Fully automatic web interface for managing multiple research problems.
Provides start/stop controls, real-time monitoring, and detailed conversation views.
"""

import streamlit as st
from pathlib import Path
import json
import asyncio
import threading
import time
from datetime import datetime
from typing import Dict, Optional, List
import subprocess
import signal
import os
import sys
from dataclasses import dataclass, field
import hashlib
import pandas as pd
from openai import OpenAI

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# --- Model presets ---
MODEL_PRESETS = {
    "gpt5": {
        "label": "gpt5 (default)",
        "prover": "gpt-5",
        "verifier": "gpt-5", 
        "summarizer": "gpt-5-mini",
    },
    "fast": {
        "label": "fast (test)",
        "prover": "gpt-4o-mini",
        "verifier": "gpt-4o-mini",
        "summarizer": "gpt-4o-mini",
    },
}

# small connectivity check
@st.cache_data(show_spinner=False, ttl=60)
def ping_model(model_name: str) -> dict:
    try:
        t0 = time.perf_counter()
        client = OpenAI()
        if model_name.startswith("gpt-5") or model_name.lower().startswith("o"):
            # Use Responses API for GPT-5 and o-models with max reasoning
            r = client.responses.create(
                model=model_name, 
                reasoning={"effort": "high"},
                input="ping"
            )
            # just touch the text to ensure the request succeeded
            _ = getattr(r, "output_text", None)
        else:
            _ = client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
            )
        dt = time.perf_counter() - t0
        return {"ok": True, "latency_s": round(dt, 3)}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}"}

# Page configuration
st.set_page_config(
    page_title="Automatic Researcher Dashboard",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    /* Hide Streamlit toolbar, deploy button, viewer badge, hamburger */
    div[data-testid="stToolbar"] { display: none !important; }
    div[data-testid="stDecoration"] { display: none !important; }
    div[data-testid="stStatusWidget"] { display: none !important; }
    #MainMenu { visibility: hidden !important; }
    header[data-testid="stHeader"] { display: none !important; }
    
    /* Scrollable fixed-height panes */
    .pane { 
        height: 430px; 
        overflow-y: auto; 
        padding: 0.75rem; 
        border: 1px solid #ddd; 
        border-radius: 8px; 
        background: #f8f9fa;
        font-family: monospace;
    }
    
    .problem-card {
        padding: 1rem;
        border-radius: 0.5rem;
        border: 1px solid #ddd;
        margin-bottom: 1rem;
    }
    .running { background-color: #d4f1d4; }
    .stopped { background-color: #f1f1f1; }
    .error { background-color: #ffd4d4; }
    .verdict-promising { color: #28a745; font-weight: bold; }
    .verdict-uncertain { color: #ffc107; font-weight: bold; }
    .verdict-unlikely { color: #dc3545; font-weight: bold; }
    .small-font { font-size: 0.8rem; color: #666; }
    .stButton > button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# --------------------------
# Problem Runner Management
# --------------------------
@dataclass
class ProblemRunner:
    """Manages a single problem's execution."""
    problem_path: Path
    process: Optional[subprocess.Popen] = None
    status: str = "stopped"  # stopped, running, error
    current_round: int = 0
    last_update: Optional[datetime] = None
    error_message: str = ""
    log_path: Optional[str] = None
    
    def get_id(self) -> str:
        """Generate unique ID for this problem."""
        return hashlib.md5(str(self.problem_path).encode()).hexdigest()[:8]

class ProblemManager:
    """Manages all problem runners."""
    
    def __init__(self):
        self.runners: Dict[str, ProblemRunner] = {}
        self.problems_dir = Path("problems")
        self.load_api_key()
        
    def load_api_key(self):
        """Load API key from ~/.openai.env or .env file."""
        # Try ~/.openai.env first
        home_env = Path.home() / ".openai.env"
        if home_env.exists():
            with open(home_env) as f:
                for line in f:
                    if line.startswith("OPENAI_API_KEY="):
                        os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip()
                        return
        
        # Try local .env
        local_env = Path(".env")
        if local_env.exists():
            with open(local_env) as f:
                for line in f:
                    if line.startswith("OPENAI_API_KEY="):
                        os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip()
                        return
    
    def discover_problems(self) -> List[Path]:
        """Find all problems in the problems directory."""
        problems = []
        if self.problems_dir.exists():
            for item in sorted(self.problems_dir.iterdir()):
                if item.is_dir():
                    # Check if it has a task file
                    has_task = any([
                        (item / "task.tex").exists(),
                        (item / "task.txt").exists(),
                        (item / "task.md").exists()
                    ])
                    if has_task:
                        problems.append(item)
        return problems
    
    def get_or_create_runner(self, problem_path: Path) -> ProblemRunner:
        """Get existing runner or create new one."""
        problem_id = hashlib.md5(str(problem_path).encode()).hexdigest()[:8]
        if problem_id not in self.runners:
            self.runners[problem_id] = ProblemRunner(problem_path)
        return self.runners[problem_id]
    
    def start_problem(self, problem_path: Path, rounds: int = 1, preset: str = "gpt5") -> bool:
        """Start running a problem."""
        runner = self.get_or_create_runner(problem_path)
        
        if runner.process and runner.process.poll() is None:
            return False  # Already running
        
        try:
            # Determine starting round
            runs_dir = problem_path / "runs"
            start_round = 1
            if runs_dir.exists():
                existing_rounds = [d for d in runs_dir.iterdir() if d.is_dir()]
                if existing_rounds:
                    start_round = len(existing_rounds) + 1
            
            # Start the orchestrator process with model preset
            cmd = [
                sys.executable, "orchestrator.py",
                str(problem_path),
                "--rounds", str(rounds),
                "--start-round", str(start_round)
            ]
            
            # Set model environment variables from preset
            env = os.environ.copy()
            preset_cfg = MODEL_PRESETS.get(preset, MODEL_PRESETS["gpt5"])
            env["OPENAI_MODEL_PROVER"] = preset_cfg["prover"]
            env["OPENAI_MODEL_VERIFIER"] = preset_cfg["verifier"]
            env["OPENAI_MODEL_SUMMARIZER"] = preset_cfg["summarizer"]
            
            # Ensure runs directory exists for logs
            runs_dir = problem_path / "runs"
            runs_dir.mkdir(parents=True, exist_ok=True)
            
            # Log to file to avoid pipe blocking
            log_path = runs_dir / "orchestrator.log"
            log_fp = open(log_path, "a", buffering=1)  # line-buffered log
            
            runner.process = subprocess.Popen(
                cmd,
                stdout=log_fp,  # write to file, not PIPE
                stderr=log_fp,
                text=True,
                env=env,  # use updated environment with model settings
                cwd=str(Path(__file__).parent)  # ensure orchestrator.py is found
            )
            
            runner.log_path = str(log_path)
            runner.status = "running"
            runner.current_round = start_round
            runner.last_update = datetime.now()
            runner.error_message = ""
            
            return True
            
        except Exception as e:
            runner.status = "error"
            runner.error_message = str(e)
            return False
    
    def stop_problem(self, problem_path: Path) -> bool:
        """Stop running a problem."""
        runner = self.get_or_create_runner(problem_path)
        
        if runner.process and runner.process.poll() is None:
            runner.process.terminate()
            time.sleep(0.5)
            if runner.process.poll() is None:
                runner.process.kill()
            
            runner.status = "stopped"
            runner.process = None
            return True
        
        return False
    
    def clear_problem(self, problem_path: Path) -> bool:
        """Stop & delete all runs, progress, notes, and outputs for this problem."""
        self.stop_problem(problem_path)
        files_to_clear = [
            problem_path / "runs",
            problem_path / "progress.md",
            problem_path / "notes.md",
            problem_path / "output.md",
            problem_path / "summary.md"
        ]
        try:
            for item in files_to_clear:
                if item.exists():
                    if item.is_dir():
                        import shutil
                        shutil.rmtree(item)
                    else:
                        item.unlink()
            return True
        except Exception as e:
            print("clear_problem error:", e)
            return False
    
    def check_status(self, problem_path: Path) -> dict:
        """Check the status of a problem."""
        runner = self.get_or_create_runner(problem_path)
        
        # Check live_status.json for actual running state
        status_file = problem_path / "runs" / "live_status.json"
        if status_file.exists():
            try:
                live = json.loads(status_file.read_text(encoding="utf-8"))
                phase = live.get("phase", "idle")
                ts = live.get("ts")
                # If we have a recent timestamp and phase is not idle, consider it running
                if phase != "idle" and ts:
                    # Check if timestamp is recent (within last 10 minutes)
                    if isinstance(ts, (int, float)):
                        elapsed = time.time() - ts
                        if elapsed < 600:  # 10 minutes
                            runner.status = "running"
            except:
                pass
        
        # Update status if process exists
        if runner.process:
            poll = runner.process.poll()
            if poll is not None:
                # Process finished
                runner.status = "stopped" if poll == 0 else "error"
                if poll != 0:
                    stderr = runner.process.stderr.read() if runner.process.stderr else ""
                    runner.error_message = stderr[-500:] if stderr else "Process exited with error"
                runner.process = None
        
        # Get latest round info
        runs_dir = problem_path / "runs"
        latest_round = 0
        latest_verdict = None
        latest_summary = None
        
        if runs_dir.exists():
            rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir()])
            if rounds:
                latest_round = len(rounds)
                latest_round_dir = rounds[-1]
                
                # Get verifier output
                verifier_json = latest_round_dir / "verifier.out.json"
                if verifier_json.exists():
                    with open(verifier_json) as f:
                        data = json.load(f)
                        latest_verdict = data.get("verdict")
                        latest_summary = data.get("summary_md")
        
        return {
            "status": runner.status,
            "current_round": latest_round,
            "last_update": runner.last_update,
            "error_message": runner.error_message,
            "latest_verdict": latest_verdict,
            "latest_summary": latest_summary
        }

# Initialize manager
if 'manager' not in st.session_state:
    st.session_state.manager = ProblemManager()

# Handle URL query parameters for navigation persistence
query_params = st.query_params
if 'view' in query_params:
    st.session_state.active_tab = query_params['view']
    if 'problem' in query_params:
        # Find and restore selected problem
        problem_name = query_params['problem']
        for p in st.session_state.manager.discover_problems():
            if p.name == problem_name:
                st.session_state.selected_problem = p
                break

# --------------------------
# Helper Functions
# --------------------------
def get_problem_stats(problem_path: Path) -> dict:
    """Get statistics for a problem."""
    stats = {
        "total_rounds": 0,
        "verdicts": [],
        "has_progress": False,
        "last_modified": None
    }
    
    runs_dir = problem_path / "runs"
    if runs_dir.exists():
        rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir()])
        stats["total_rounds"] = len(rounds)
        
        for round_dir in rounds:
            verifier_json = round_dir / "verifier.out.json"
            if verifier_json.exists():
                with open(verifier_json) as f:
                    verdict = json.load(f).get("verdict")
                    if verdict:
                        stats["verdicts"].append(verdict)
                
                stats["last_modified"] = datetime.fromtimestamp(
                    verifier_json.stat().st_mtime
                )
    
    progress_file = problem_path / "progress.md"
    stats["has_progress"] = progress_file.exists()
    
    return stats

def format_time_ago(dt: Optional[datetime]) -> str:
    """Format datetime as time ago."""
    if not dt:
        return "Never"
    
    delta = datetime.now() - dt
    if delta.days > 0:
        return f"{delta.days}d ago"
    elif delta.seconds > 3600:
        return f"{delta.seconds // 3600}h ago"
    elif delta.seconds > 60:
        return f"{delta.seconds // 60}m ago"
    else:
        return "Just now"

def append_user_feedback(problem: Path, round_dir: Path, feedback_text: str):
    """Persist user's feedback and ensure it is visible in future rounds."""
    feedback_text = feedback_text.strip()
    if not feedback_text:
        return False

    # 1) Save per-round user feedback file
    uf = round_dir / "user.feedback.md"
    stamp = datetime.now().isoformat() + "Z"
    block = f"**User additional feedback ({stamp})**\n\n{feedback_text}\n"
    existing = uf.read_text(encoding="utf-8") if uf.exists() else ""
    uf.write_text(existing + ("" if existing.endswith("\n") else "\n") + block + "\n", encoding="utf-8")

    # 2) Append into the round's summarizer summary (so the 'Summary' pane shows it)
    sm = round_dir / "summarizer.summary.md"
    base = sm.read_text(encoding="utf-8") if sm.exists() else ""
    sm.write_text(base + ("\n\n---\n" if base else "") + block, encoding="utf-8")

    # 3) Append into aggregated summary.md at problem root (so models see it next rounds)
    agg = problem / "summary.md"
    prev = agg.read_text(encoding="utf-8") if agg.exists() else ""
    header = f"## {round_dir.name} — user's additional feedback — {stamp}\n"
    agg.write_text(prev + ("" if prev.endswith("\n") else "\n") + header + feedback_text + "\n\n", encoding="utf-8")
    return True

# --------------------------
# Main Interface
# --------------------------
st.title("🔬 Automatic Researcher Dashboard")

# Sidebar controls
with st.sidebar:
    st.header("⚙️ Controls")
    
    # API key status
    if os.environ.get("OPENAI_API_KEY"):
        st.success("✅ API Key Loaded")
    else:
        st.error("❌ No API Key Found")
        st.info("Add key to ~/.openai.env")
    

# Main content area
problems = st.session_state.manager.discover_problems()
default_rounds = 3  # Default value since we removed it from sidebar

if not problems:
    st.warning("No problems found in the `problems/` directory")
    st.info("""
    To add problems:
    1. Create a subdirectory in `problems/`
    2. Add a `task.tex`, `task.txt`, or `task.md` file
    3. Optionally add papers in the same directory
    """)
else:
    # Initialize active tab
    if 'active_tab' not in st.session_state:
        st.session_state.active_tab = 'overview'
    
    # Create tabs for different views
    tab_names = [f"📊 Overview ({len(problems)} problems)", "📝 Detailed View"]
    if st.session_state.active_tab == 'detailed':
        selected_tab_idx = 1
    else:
        selected_tab_idx = 0
        
    # Use columns to simulate tab behavior with selection
    col1, col2 = st.columns(2)
    with col1:
        if st.button(tab_names[0], use_container_width=True, type="primary" if selected_tab_idx==0 else "secondary"):
            st.session_state.active_tab = 'overview'
            st.query_params.clear()  # Clear query params when going to overview
            st.rerun()
    with col2:
        if st.button(tab_names[1], use_container_width=True, type="primary" if selected_tab_idx==1 else "secondary"):
            st.session_state.active_tab = 'detailed'
            # Preserve problem selection in URL if one is selected
            if 'selected_problem' in st.session_state:
                st.query_params['view'] = 'detailed'
                st.query_params['problem'] = st.session_state.selected_problem.name
            st.rerun()
    
    st.markdown("---")
    
    # Show content based on active tab
    # Debug: show current tab
    # st.write(f"DEBUG: active_tab = {st.session_state.active_tab}")
    if st.session_state.active_tab == 'overview':
        # Overview Tab content
        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)
        
        total_rounds = sum(get_problem_stats(p)["total_rounds"] for p in problems)
        running_count = sum(
            1 for p in problems 
            if st.session_state.manager.get_or_create_runner(p).status == "running"
        )
        
        with col1:
            st.metric("Total Problems", len(problems))
        with col2:
            st.metric("Total Rounds", total_rounds)
        with col3:
            st.metric("Currently Running", running_count)
        with col4:
            problems_with_progress = sum(
                1 for p in problems if get_problem_stats(p)["has_progress"]
            )
            st.metric("With Progress", problems_with_progress)
        
        # Problem status grid
        st.subheader("Problem Status")
        st.markdown("Click on a problem name to view details:")
        
        # Simple table using Streamlit columns to mimic table rows
        # Header row
        col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1.5, 1.5])
        with col1:
            st.markdown("**Problem**")
        with col2:
            st.markdown("**Status**")
        with col3:
            st.markdown("**Rounds**")
        with col4:
            st.markdown("**Latest Verdict**")
        with col5:
            st.markdown("**Last Update**")
        
        st.markdown("---")
        
        # Data rows
        for i, problem in enumerate(problems):
            stats = get_problem_stats(problem)
            status = st.session_state.manager.check_status(problem)
            
            col1, col2, col3, col4, col5 = st.columns([2, 1, 1, 1.5, 1.5])
            
            with col1:
                if st.button(f"📁 {problem.name}", key=f"select_{i}", use_container_width=True):
                    st.session_state.selected_problem = problem
                    st.session_state.active_tab = "detailed"
                    # Set query params to persist on refresh
                    st.query_params['view'] = 'detailed'
                    st.query_params['problem'] = problem.name
                    st.rerun()
            
            with col2:
                status_emoji = {"running": "🟢", "stopped": "⚫", "error": "🔴"}.get(status["status"], "⚫")
                st.write(f"{status_emoji} {status['status'].capitalize()}")
            
            with col3:
                st.write(str(stats["total_rounds"]))
            
            with col4:
                if status["latest_verdict"]:
                    verdict_emoji = {"promising": "✅", "uncertain": "⚠️", "unlikely": "❌"}.get(status["latest_verdict"], "—")
                    st.write(f"{verdict_emoji} {status['latest_verdict']}")
                else:
                    st.write("—")
            
            with col5:
                st.write(format_time_ago(stats["last_modified"]))
    
    elif st.session_state.active_tab == 'detailed':
        # Detailed View Tab content
        if 'selected_problem' not in st.session_state:
            st.info("Select a problem from the Problem Control tab to view details")
        else:
            problem = st.session_state.selected_problem
            st.subheader(f"📋 {problem.name}")
            
            # Controls row (Run more rounds / preset / Stop / Clear all)
            c1, c2, c3, c4, spacer = st.columns([1.2, 2.2, 1, 1, 4])
            
            more = c1.number_input("Rounds to run", min_value=1, max_value=50, value=1, step=1)
            provers = c1.number_input("Provers", min_value=1, max_value=10, value=2, step=1)
            temp = c1.slider("Prover temperature", min_value=0.0, max_value=1.0, value=0.4, step=0.05)
            
            preset_labels = {k: v["label"] for k, v in MODEL_PRESETS.items()}
            preset_keys = list(MODEL_PRESETS.keys())
            default_idx = preset_keys.index("gpt5")
            chosen_preset = c2.selectbox("Model preset", preset_keys, index=default_idx, format_func=lambda k: preset_labels[k])
            
            if c3.button("▶ Run more rounds"):
                # Test connectivity before starting
                ping = ping_model(MODEL_PRESETS[chosen_preset]["prover"])
                if ping["ok"]:
                    c3.markdown("🔄 Working...")
                    # Pass provers via environment var understood by orchestrator CLI
                    os.environ["AR_NUM_PROVERS"] = str(int(provers))
                    os.environ["AR_PROVER_TEMPERATURE"] = str(float(temp))
                    st.session_state.manager.start_problem(problem, rounds=int(more), preset=chosen_preset)
                    st.rerun()
                else:
                    # Show error and don't start
                    c3.markdown(f"❌ Connect error")
                    c3.error(f"Model connectivity failed: {ping.get('error', 'Unknown error')}")
                    # Don't append anything to conversation or start process
            
            status = st.session_state.manager.check_status(problem)
            if status["status"] == "running":
                if c4.button("⏹ Stop"):
                    st.session_state.manager.stop_problem(problem)
                    st.rerun()
            else:
                # Clear all button with confirmation
                clear_confirm_key = f"clear_confirm_{problem.name}"
                if clear_confirm_key not in st.session_state:
                    st.session_state[clear_confirm_key] = False
                
                if not st.session_state[clear_confirm_key]:
                    if c4.button("🧹 Clear all"):
                        st.session_state[clear_confirm_key] = True
                        st.rerun()
                else:
                    # Show confirmation dialog
                    st.warning("⚠️ Do you really want to clear all conversation thus far?")
                    st.write("This will delete:")
                    st.write("• All rounds (prover/verifier/summarizer outputs)")
                    st.write("• Progress notes (progress.md)")
                    st.write("• Research notes (notes.md)")
                    st.write("• Verified outputs (output.md)")
                    st.write("• Summary (summary.md)")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        if st.button("✅ Yes, clear all", key=f"confirm_yes_{problem.name}"):
                            if st.session_state.manager.clear_problem(problem):
                                st.success("All conversation data cleared.")
                                st.session_state[clear_confirm_key] = False
                                time.sleep(1)
                                st.rerun()
                            else:
                                st.error("Failed to clear data.")
                    with col2:
                        if st.button("❌ Cancel", key=f"confirm_no_{problem.name}"):
                            st.session_state[clear_confirm_key] = False
                            st.rerun()
            
            # Current phase & since when
            status_file = problem / "runs" / "live_status.json"
            if status_file.exists():
                live = json.loads(status_file.read_text(encoding="utf-8"))
                phase = live.get("phase", "idle")
                ts = live.get("ts")
                elapsed = ""
                if ts:
                    if isinstance(ts, (int, float)):
                        # Unix timestamp (new format)
                        secs = max(0, int(time.time() - ts))
                        elapsed = f" (elapsed {secs}s)"
                    else:
                        # ISO datetime string (old format, for compatibility)
                        try:
                            from datetime import timezone
                            started = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                            now_utc = datetime.now(timezone.utc)
                            dt = now_utc - started
                            secs = max(0, int(dt.total_seconds()))
                            elapsed = f" (elapsed {secs}s)"
                        except:
                            pass
                
                # Display status
                st.info(f"🧠 Current phase: **{phase}**{elapsed}")
            
            # Notes.md and output.md viewers
            notes_path = problem / "notes.md"
            output_path = problem / "output.md"
            
            col1, col2 = st.columns(2)
            
            with col1:
                if notes_path.exists():
                    with st.expander("📓 notes.md"):
                        import html as _html
                        notes_txt = notes_path.read_text(encoding="utf-8")
                        if notes_txt.strip():
                            st.markdown(f"<div class='pane'>{_html.escape(notes_txt).replace('\\n','<br>')}</div>", unsafe_allow_html=True)
                        else:
                            st.caption("Currently empty")
                else:
                    with st.expander("📓 notes.md"):
                        st.caption("Currently empty")
            
            with col2:
                if output_path.exists():
                    with st.expander("📋 output.md"):
                        import html as _html
                        output_txt = output_path.read_text(encoding="utf-8")
                        if output_txt.strip():
                            st.markdown(f"<div class='pane'>{_html.escape(output_txt).replace('\\n','<br>')}</div>", unsafe_allow_html=True)
                        else:
                            st.caption("Currently empty")
                else:
                    with st.expander("📋 output.md"):
                        st.caption("Currently empty")
            
            # Files sent to Prover (for latest round)
            runs_dir = problem / "runs"
            rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir()]) if runs_dir.exists() else []
            if rounds:
                latest = rounds[-1]
                ctxf = latest / "context.files.json"
                if ctxf.exists():
                    files = json.loads(ctxf.read_text(encoding="utf-8"))
                    with st.expander("📦 Files included for Prover (latest round)"):
                        for f in files:
                            st.write("•", f)
            
            # ===== ALL ROUNDS (newest first) =====
            if not rounds:
                st.warning("No runs yet for this problem.")
            else:
                # CSS for panes already defined at top in your file (class 'pane').
                st.markdown("### 🧪 Prover ↔ Verifier ↔ Summarizer — All Rounds")
                
                for rd in reversed(rounds):
                    colh1, colh2, colh3, colh4 = st.columns([2,1,1,2])
                    with colh1:
                        st.markdown(f"**{rd.name}**")
                    # verdict + timings (if available)
                    verdict = None
                    vj = rd / "verifier.out.json"
                    if vj.exists():
                        try:
                            verdict = json.loads(vj.read_text(encoding="utf-8")).get("verdict")
                        except: pass
                    if verdict:
                        with colh2:
                            emoji = {"promising":"✅","uncertain":"⚠️","unlikely":"❌"}.get(verdict,"—")
                            st.markdown(f"**Verdict:** {emoji} {verdict}")
            
                    timings = {}
                    tj = rd / "timings.json"
                    if tj.exists():
                        timings = json.loads(tj.read_text(encoding="utf-8"))
                    with colh3:
                        if timings:
                            st.markdown("**Time (s):** " + ", ".join([f"{k[0].upper()}:{v['duration_s']}" for k,v in timings.items()]))
            
                    # three scrollable panes
                    pj = rd / "prover.out.json"
                    # Detect multi-prover artifacts
                    provers_multi = sorted(rd.glob("prover-*.out.json"))
                    vf = rd / "verifier.feedback.md"
                    sm = rd / "summarizer.summary.md"
                    vs = rd / "verifier.summary.md"
            
                    # Build prover pane content
                    prover_markdown = ""
                    if provers_multi:
                        for pfile in provers_multi:
                            try:
                                pdata = json.loads(pfile.read_text(encoding="utf-8"))
                                prover_markdown += f"### {pfile.name}\n\n" + pdata.get("progress_md", "") + "\n\n"
                            except:
                                pass
                    else:
                        if pj.exists():
                            try:
                                prover_markdown = json.loads(pj.read_text(encoding="utf-8")).get("progress_md","")
                            except:
                                pass
                    vtxt = vf.read_text(encoding="utf-8") if vf.exists() else ""
                    stxt = sm.read_text(encoding="utf-8") if sm.exists() else (vs.read_text(encoding="utf-8") if vs.exists() else "")
            
                    import html as _html
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.markdown("**Prover**")
                        st.markdown(f"<div class='pane'>{_html.escape(prover_markdown).replace('\\n','<br>')}</div>", unsafe_allow_html=True)
                    with col2:
                        st.markdown("**Verifier**")
                        st.markdown(f"<div class='pane'>{_html.escape(vtxt).replace('\\n','<br>')}</div>", unsafe_allow_html=True)
                    with col3:
                        st.markdown("**Summary**")
                        st.markdown(f"<div class='pane'>{_html.escape(stxt).replace('\\n','<br>')}</div>", unsafe_allow_html=True)

                    # --- Add feedback (human-in-the-loop) ---
                    st.markdown("#### ✍️ Add feedback")
                    fb_key = f"fb_{problem.name}_{rd.name}"
                    if st.button("➕ Add feedback", key=f"btn_{fb_key}"):
                        st.session_state[f"show_{fb_key}"] = True

                    if st.session_state.get(f"show_{fb_key}"):
                        fb_text = st.text_area("Write your feedback (will be appended to the round's summary):",
                                               key=f"txt_{fb_key}", height=160)
                        b1, b2 = st.columns([1,1])
                        with b1:
                            if st.button("OK", key=f"ok_{fb_key}"):
                                if fb_text.strip():
                                    ok = append_user_feedback(problem, rd, fb_text)
                                    if ok:
                                        st.success("Feedback added to the summary.")
                                        st.session_state.pop(f"show_{fb_key}", None)
                                        st.rerun()
                                else:
                                    st.warning("Feedback is empty.")
                        with b2:
                            if st.button("Cancel", key=f"cancel_{fb_key}"):
                                st.session_state.pop(f"show_{fb_key}", None)
                                st.rerun()
            
                    st.markdown("---")
            
            # Show log file if exists  
            log_file = runs_dir / "orchestrator.log"
            if log_file.exists():
                with st.expander("📋 View orchestrator log"):
                    log_content = log_file.read_text(encoding="utf-8")
                    st.text(log_content[-2000:] if len(log_content) > 2000 else log_content)

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <small>
    Automatic Researcher | 
    {running} running, {total} total problems | 
    Last refresh: {time}
    </small>
</div>
""".format(
    running=sum(1 for p in problems if st.session_state.manager.get_or_create_runner(p).status == "running"),
    total=len(problems),
    time=datetime.now().strftime("%H:%M:%S")
), unsafe_allow_html=True)