#!/usr/bin/env python3
"""
Simple UI for the automatic researcher.
Main page: list problems, click to view, run with iterations parameter.
"""

import streamlit as st
from pathlib import Path
import json
import subprocess
import sys
import os
from datetime import datetime
from typing import Dict, Optional
import hashlib
from dataclasses import dataclass

# Page config
st.set_page_config(
    page_title="Automatic Researcher",
    page_icon="🔬", 
    layout="wide"
)

# Load API key
def load_api_key():
    home_env = Path.home() / ".openai.env"
    if home_env.exists():
        with open(home_env) as f:
            for line in f:
                if line.startswith("OPENAI_API_KEY="):
                    os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip()
                    return True
    return False

@dataclass
class ProblemRunner:
    problem_path: Path
    process: Optional[subprocess.Popen] = None
    status: str = "stopped"
    log_path: Optional[str] = None

class SimpleManager:
    def __init__(self):
        self.runners: Dict[str, ProblemRunner] = {}
        self.problems_dir = Path("problems")
        load_api_key()
    
    def get_problems(self):
        if not self.problems_dir.exists():
            return []
        
        problems = []
        for item in self.problems_dir.iterdir():
            if item.is_dir():
                # Check if it has a task file
                task_files = ["task.tex", "task.txt", "task.md"]
                if any((item / f).exists() for f in task_files):
                    problems.append(item)
        
        return sorted(problems, key=lambda p: p.name)
    
    def get_runner(self, problem_path: Path) -> ProblemRunner:
        key = str(problem_path)
        if key not in self.runners:
            self.runners[key] = ProblemRunner(problem_path)
        return self.runners[key]
    
    def start_problem(self, problem_path: Path, rounds: int):
        runner = self.get_runner(problem_path)
        
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
            
            # Setup logging
            runs_dir.mkdir(parents=True, exist_ok=True)
            log_path = runs_dir / "orchestrator.log"
            log_fp = open(log_path, "a", buffering=1)
            
            # Start orchestrator
            cmd = [
                sys.executable, "orchestrator.py",
                str(problem_path),
                "--rounds", str(rounds),
                "--start-round", str(start_round)
            ]
            
            runner.process = subprocess.Popen(
                cmd,
                stdout=log_fp,
                stderr=log_fp,
                text=True,
                env=os.environ.copy(),
                cwd=str(Path(__file__).parent)
            )
            
            runner.log_path = str(log_path)
            runner.status = "running"
            return True
            
        except Exception as e:
            st.error(f"Failed to start: {e}")
            return False
    
    def stop_problem(self, problem_path: Path):
        runner = self.get_runner(problem_path)
        if runner.process and runner.process.poll() is None:
            runner.process.terminate()
            runner.status = "stopped"
            return True
        return False
    
    def stop_all(self):
        for runner in self.runners.values():
            if runner.process and runner.process.poll() is None:
                runner.process.terminate()
                runner.status = "stopped"
    
    def update_status(self, problem_path: Path):
        runner = self.get_runner(problem_path)
        if runner.process:
            if runner.process.poll() is None:
                runner.status = "running"
            else:
                runner.status = "stopped"
    
    def get_problem_info(self, problem_path: Path):
        runs_dir = problem_path / "runs"
        if not runs_dir.exists():
            return {"rounds": 0, "last_round": None}
        
        rounds = [d for d in runs_dir.iterdir() if d.is_dir()]
        if not rounds:
            return {"rounds": 0, "last_round": None}
        
        latest = max(rounds, key=lambda x: x.name)
        return {"rounds": len(rounds), "last_round": latest}

# Initialize manager
if 'manager' not in st.session_state:
    st.session_state.manager = SimpleManager()

manager = st.session_state.manager

# Main UI
st.title("🔬 Automatic Researcher")

problems = manager.get_problems()

if not problems:
    st.warning("No problems found in `problems/` directory")
    st.stop()

# Global controls
col1, col2, col3, col4 = st.columns([2, 1, 1, 1])

with col1:
    st.subheader(f"Problems ({len(problems)})")

with col2:
    rounds_to_run = st.number_input("Rounds", min_value=1, max_value=10, value=1, key="global_rounds")

with col3:
    if st.button("🛑 Stop All"):
        manager.stop_all()
        st.rerun()

with col4:
    selected_problems = st.session_state.get('selected_problems', set())
    if selected_problems and st.button(f"▶️ Run Selected ({len(selected_problems)})"):
        for problem_name in selected_problems:
            problem_path = manager.problems_dir / problem_name
            manager.start_problem(problem_path, rounds_to_run)
        st.rerun()

st.markdown("---")

# Check if viewing a specific problem
if 'viewing_problem' in st.session_state:
    problem = st.session_state.viewing_problem
    
    # Back button and problem header
    col1, col2 = st.columns([1, 6])
    with col1:
        if st.button("← Back"):
            del st.session_state.viewing_problem
            st.rerun()
    
    with col2:
        st.subheader(f"📁 {problem.name}")
    
    # Problem info
    info = manager.get_problem_info(problem)
    manager.update_status(problem)
    runner = manager.get_runner(problem)
    
    col1, col2, col3 = st.columns([2, 1, 1])
    
    with col1:
        status_emoji = "🟢" if runner.status == "running" else "⚫"
        st.write(f"{status_emoji} **Status:** {runner.status} | **Rounds:** {info['rounds']}")
    
    with col2:
        if runner.status == "running":
            if st.button("⏹️ Stop"):
                manager.stop_problem(problem)
                st.rerun()
        else:
            if st.button(f"▶️ Run {rounds_to_run} rounds"):
                manager.start_problem(problem, rounds_to_run)
                st.rerun()
    
    with col3:
        if st.button("🔄 Refresh"):
            st.rerun()
    
    # Show progress if available
    if info['last_round']:
        st.markdown("### Latest Progress")
        
        # Summary
        summary_file = info['last_round'] / "verifier.summary.md"
        if summary_file.exists():
            st.markdown("**Verifier Summary:**")
            st.markdown(summary_file.read_text(encoding="utf-8"))
        
        # Progress
        progress_file = info['last_round'] / "progress.appended.md"
        if progress_file.exists():
            st.markdown("**Progress Added:**")
            st.markdown(progress_file.read_text(encoding="utf-8"))
        
        # Verdict
        verifier_json = info['last_round'] / "verifier.out.json"
        if verifier_json.exists():
            with open(verifier_json) as f:
                data = json.load(f)
            st.write(f"**Verdict:** `{data.get('verdict', 'unknown')}`")
            
            issues = data.get('blocking_issues', [])
            if issues:
                st.write("**Issues:**", ", ".join(issues))
    
    # Logs
    if runner.log_path and Path(runner.log_path).exists():
        with st.expander("📄 Orchestrator Log"):
            log_content = Path(runner.log_path).read_text(encoding="utf-8")
            st.code(log_content[-2000:])  # Last 2000 chars

else:
    # Main problem list
    if 'selected_problems' not in st.session_state:
        st.session_state.selected_problems = set()
    
    for problem in problems:
        info = manager.get_problem_info(problem)
        manager.update_status(problem)
        runner = manager.get_runner(problem)
        
        with st.container():
            col1, col2, col3, col4, col5 = st.columns([1, 4, 1, 1, 1])
            
            with col1:
                # Checkbox for selection
                selected = st.checkbox(
                    "", 
                    value=problem.name in st.session_state.selected_problems,
                    key=f"select_{problem.name}"
                )
                if selected:
                    st.session_state.selected_problems.add(problem.name)
                else:
                    st.session_state.selected_problems.discard(problem.name)
            
            with col2:
                # Problem info
                status_emoji = "🟢" if runner.status == "running" else "⚫"
                st.write(f"**{problem.name}**")
                st.write(f"{status_emoji} {runner.status} | {info['rounds']} rounds")
            
            with col3:
                # Individual run button
                if runner.status != "running":
                    if st.button("▶️", key=f"run_{problem.name}"):
                        manager.start_problem(problem, rounds_to_run)
                        st.rerun()
                else:
                    if st.button("⏹️", key=f"stop_{problem.name}"):
                        manager.stop_problem(problem)
                        st.rerun()
            
            with col4:
                # View button
                if st.button("👁️", key=f"view_{problem.name}"):
                    st.session_state.viewing_problem = problem
                    st.rerun()
            
            with col5:
                # Quick status
                if info['last_round']:
                    verifier_json = info['last_round'] / "verifier.out.json"
                    if verifier_json.exists():
                        with open(verifier_json) as f:
                            data = json.load(f)
                        verdict = data.get('verdict', '?')
                        verdict_color = {
                            'promising': '🟢',
                            'uncertain': '🟡', 
                            'unlikely': '🔴'
                        }
                        st.write(verdict_color.get(verdict, '⚪') + f" {verdict}")

            st.markdown("---")

# Auto-refresh for running processes
import time
if any(runner.status == "running" for runner in manager.runners.values()):
    time.sleep(2)
    st.rerun()