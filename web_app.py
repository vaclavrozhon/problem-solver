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

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

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
    
    def start_problem(self, problem_path: Path, rounds: int = 1) -> bool:
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
            
            # Start the orchestrator process
            cmd = [
                sys.executable, "orchestrator.py",
                str(problem_path),
                "--rounds", str(rounds),
                "--start-round", str(start_round)
            ]
            
            runner.process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env=os.environ.copy()
            )
            
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
    
    def check_status(self, problem_path: Path) -> dict:
        """Check the status of a problem."""
        runner = self.get_or_create_runner(problem_path)
        
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
    
    # Global controls
    st.subheader("Global Actions")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 Refresh All"):
            st.rerun()
    
    with col2:
        if st.button("🛑 Stop All"):
            for problem in st.session_state.manager.discover_problems():
                st.session_state.manager.stop_problem(problem)
            st.rerun()
    
    # Settings
    st.subheader("Settings")
    default_rounds = st.number_input(
        "Rounds per Run",
        min_value=1,
        max_value=20,
        value=3,
        help="Number of rounds to run when starting a problem"
    )
    
    auto_refresh = st.checkbox(
        "Auto Refresh",
        value=False,
        help="Automatically refresh the dashboard every 10 seconds"
    )
    
    if auto_refresh:
        st.empty()
        time.sleep(10)
        st.rerun()

# Main content area
problems = st.session_state.manager.discover_problems()

if not problems:
    st.warning("No problems found in the `problems/` directory")
    st.info("""
    To add problems:
    1. Create a subdirectory in `problems/`
    2. Add a `task.tex`, `task.txt`, or `task.md` file
    3. Optionally add papers in the same directory
    """)
else:
    # Create tabs for different views
    tab_overview, tab_problems, tab_details = st.tabs([
        f"📊 Overview ({len(problems)} problems)",
        "🎯 Problem Control",
        "📝 Detailed View"
    ])
    
    # Overview Tab
    with tab_overview:
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
        
        status_data = []
        for problem in problems:
            stats = get_problem_stats(problem)
            status = st.session_state.manager.check_status(problem)
            
            status_data.append({
                "Problem": problem.name,
                "Status": status["status"].capitalize(),
                "Rounds": stats["total_rounds"],
                "Latest Verdict": status["latest_verdict"] or "—",
                "Last Update": format_time_ago(stats["last_modified"])
            })
        
        df = pd.DataFrame(status_data)
        st.dataframe(
            df,
            use_container_width=True,
            hide_index=True
        )
    
    # Problem Control Tab
    with tab_problems:
        st.subheader("Problem Management")
        
        # Create a grid of problem cards
        for i, problem in enumerate(problems):
            stats = get_problem_stats(problem)
            status = st.session_state.manager.check_status(problem)
            
            with st.container():
                col1, col2, col3 = st.columns([3, 1, 1])
                
                with col1:
                    # Problem info
                    st.markdown(f"### 📁 {problem.name}")
                    
                    # Status badge
                    status_color = {
                        "running": "🟢",
                        "stopped": "⚫",
                        "error": "🔴"
                    }
                    st.write(f"{status_color.get(status['status'], '⚫')} **Status:** {status['status']}")
                    
                    # Stats
                    if stats["total_rounds"] > 0:
                        st.write(f"**Rounds:** {stats['total_rounds']} | **Last:** {format_time_ago(stats['last_modified'])}")
                        if status["latest_verdict"]:
                            verdict_class = f"verdict-{status['latest_verdict']}"
                            st.markdown(
                                f"**Verdict:** <span class='{verdict_class}'>{status['latest_verdict']}</span>",
                                unsafe_allow_html=True
                            )
                    else:
                        st.write("*No runs yet*")
                
                with col2:
                    # Control buttons
                    if status["status"] == "running":
                        if st.button(f"⏹️ Stop", key=f"stop_{i}"):
                            st.session_state.manager.stop_problem(problem)
                            st.rerun()
                    else:
                        if st.button(f"▶️ Start", key=f"start_{i}"):
                            st.session_state.manager.start_problem(problem, default_rounds)
                            st.rerun()
                
                with col3:
                    # View button
                    if st.button(f"👁️ View", key=f"view_{i}"):
                        st.session_state.selected_problem = problem
                        st.success("Problem selected! Go to 'Detailed View' tab to see details.")
                        st.rerun()
                
                # Latest summary (collapsible)
                if status["latest_summary"]:
                    with st.expander("Latest Summary", expanded=False):
                        st.markdown(status["latest_summary"])
                
                # Error message if any
                if status["error_message"]:
                    st.error(f"Error: {status['error_message']}")
                
                st.markdown("---")
    
    # Detailed View Tab
    with tab_details:
        if 'selected_problem' not in st.session_state:
            st.info("Select a problem from the Problem Control tab to view details")
        else:
            problem = st.session_state.selected_problem
            st.subheader(f"📋 {problem.name}")
            
            # Navigation
            col1, col2 = st.columns([1, 5])
            with col1:
                if st.button("← Back"):
                    del st.session_state.selected_problem
                    st.rerun()
            
            # Load all rounds
            runs_dir = problem / "runs"
            if not runs_dir.exists():
                st.warning("No runs available for this problem")
            else:
                rounds = sorted([d for d in runs_dir.iterdir() if d.is_dir()])
                
                if not rounds:
                    st.warning("No rounds found")
                else:
                    # Round selector
                    round_options = [r.name for r in rounds]
                    selected_round_name = st.selectbox(
                        "Select Round",
                        round_options,
                        index=len(round_options)-1
                    )
                    
                    selected_round = runs_dir / selected_round_name
                    
                    # Display round content
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.markdown("#### 🎯 Verifier Summary")
                        summary_file = selected_round / "verifier.summary.md"
                        if summary_file.exists():
                            st.markdown(summary_file.read_text(encoding="utf-8"))
                        
                        # Verdict and issues
                        verifier_json = selected_round / "verifier.out.json"
                        if verifier_json.exists():
                            with open(verifier_json) as f:
                                verifier_data = json.load(f)
                            
                            verdict = verifier_data.get("verdict", "unknown")
                            st.markdown(f"**Verdict:** `{verdict}`")
                            
                            issues = verifier_data.get("blocking_issues", [])
                            if issues:
                                st.markdown("**Blocking Issues:**")
                                for issue in issues:
                                    st.write(f"• {issue}")
                    
                    with col2:
                        st.markdown("#### 📝 Progress Added")
                        progress_file = selected_round / "progress.appended.md"
                        if progress_file.exists():
                            st.markdown(progress_file.read_text(encoding="utf-8"))
                    
                    # Full conversation view
                    st.markdown("---")
                    st.markdown("#### 💬 Full Conversation")
                    
                    tab1, tab2, tab3 = st.tabs(["Prover Output", "Verifier Feedback", "Raw JSON"])
                    
                    with tab1:
                        prover_json = selected_round / "prover.out.json"
                        if prover_json.exists():
                            with open(prover_json) as f:
                                prover_data = json.load(f)
                            
                            st.markdown("**Progress Notes:**")
                            st.markdown(prover_data.get("progress_md", ""))
                            
                            if prover_data.get("requests_for_more_materials"):
                                st.markdown("**Material Requests:**")
                                for req in prover_data["requests_for_more_materials"]:
                                    st.write(f"• {req}")
                            
                            if prover_data.get("next_actions_for_prover"):
                                st.markdown("**Next Actions:**")
                                for action in prover_data["next_actions_for_prover"]:
                                    st.write(f"• {action}")
                    
                    with tab2:
                        feedback_file = selected_round / "verifier.feedback.md"
                        if feedback_file.exists():
                            st.markdown(feedback_file.read_text(encoding="utf-8"))
                    
                    with tab3:
                        col1, col2 = st.columns(2)
                        with col1:
                            st.markdown("**Prover JSON:**")
                            if prover_json.exists():
                                with open(prover_json) as f:
                                    st.json(json.load(f))
                        
                        with col2:
                            st.markdown("**Verifier JSON:**")
                            if verifier_json.exists():
                                with open(verifier_json) as f:
                                    st.json(json.load(f))
                    
                    # Download options
                    st.markdown("---")
                    col1, col2, col3 = st.columns(3)
                    
                    with col1:
                        progress_full = problem / "progress.md"
                        if progress_full.exists():
                            st.download_button(
                                "📥 Download Full Progress",
                                progress_full.read_text(encoding="utf-8"),
                                file_name=f"{problem.name}_progress.md",
                                mime="text/markdown"
                            )
                    
                    with col2:
                        if summary_file.exists():
                            st.download_button(
                                "📥 Download Summary",
                                summary_file.read_text(encoding="utf-8"),
                                file_name=f"{problem.name}_{selected_round_name}_summary.md",
                                mime="text/markdown"
                            )

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