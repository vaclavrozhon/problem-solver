#!/usr/bin/env python3
"""
Simple working orchestrator using basic Chat Completions API.
No complex file search or assistants - just works.
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
import argparse
import sys

from openai import OpenAI
from pydantic import BaseModel, Field
from rich.console import Console

# Load API key from ~/.openai.env
home_env = Path.home() / ".openai.env"
if home_env.exists():
    with open(home_env) as f:
        for line in f:
            if line.startswith("OPENAI_API_KEY="):
                os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip()

console = Console()
client = OpenAI()

MODEL_PROVER = os.environ.get("OPENAI_MODEL_PROVER", "gpt-4-turbo-preview")
MODEL_VERIFIER = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-4-turbo-preview")

class NewFile(BaseModel):
    path: str = Field(..., description="Relative path under problem dir")
    content: str = Field(..., description="Content of the file")

class ProverOutput(BaseModel):
    progress_md: str = Field(..., description="Append-only progress notes")
    new_files: List[NewFile] = Field(default_factory=list)
    requests_for_more_materials: List[str] = Field(default_factory=list)
    next_actions_for_prover: List[str] = Field(default_factory=list)

class VerifierOutput(BaseModel):
    feedback_md: str = Field(..., description="Detailed feedback")
    summary_md: str = Field(..., description="Concise summary")
    verdict: str = Field(..., description="promising|uncertain|unlikely")
    blocking_issues: List[str] = Field(default_factory=list)

def extract_json_from_response(text: str) -> Optional[dict]:
    """Extract JSON from model response."""
    # Remove markdown code blocks
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*$', '', text)
    text = text.strip()
    
    # Try direct parse
    try:
        data = json.loads(text)
        # Ensure blocking_issues is a list of strings
        if 'blocking_issues' in data and data['blocking_issues']:
            data['blocking_issues'] = [str(issue) for issue in data['blocking_issues']]
        return data
    except:
        pass
    
    # Find JSON in text
    json_match = re.search(r'\{.*\}', text, re.DOTALL)
    if json_match:
        try:
            data = json.loads(json_match.group(0))
            # Ensure blocking_issues is a list of strings
            if 'blocking_issues' in data and data['blocking_issues']:
                data['blocking_issues'] = [str(issue) for issue in data['blocking_issues']]
            return data
        except:
            pass
    
    return None

def read_problem_context(problem_dir: Path, include_pdfs: bool = True) -> str:
    """Read problem files into a context string."""
    context_parts = []
    
    # Task file
    for task_file in ["task.tex", "task.txt", "task.md"]:
        task_path = problem_dir / task_file
        if task_path.exists():
            context_parts.append(f"=== {task_file} ===\n{task_path.read_text(encoding='utf-8')}\n")
            break
    
    # Progress file
    progress_path = problem_dir / "progress.md"
    if progress_path.exists():
        # Only include last 50KB to avoid context overflow
        content = progress_path.read_text(encoding='utf-8')
        if len(content) > 50000:
            content = "...\n" + content[-50000:]
        context_parts.append(f"=== progress.md ===\n{content}\n")
    
    # Papers (as text only - no PDF parsing for now)
    papers_dir = problem_dir / "papers"
    if papers_dir.exists() and include_pdfs:
        for paper in papers_dir.rglob("*"):
            if paper.is_file():
                if paper.suffix.lower() in {'.txt', '.md'}:
                    try:
                        content = paper.read_text(encoding='utf-8')
                        context_parts.append(f"=== {paper.name} ===\n{content[:5000]}\n")
                    except:
                        pass
                elif paper.suffix.lower() == '.pdf':
                    context_parts.append(f"=== {paper.name} ===\n[PDF file available for reference]\n")
    
    # Recent verifier feedback (last 2 rounds)
    runs_dir = problem_dir / "runs"
    if runs_dir.exists():
        round_dirs = sorted([d for d in runs_dir.iterdir() if d.is_dir()])[-2:]
        for round_dir in round_dirs:
            feedback_file = round_dir / "verifier.feedback.md"
            if feedback_file.exists():
                try:
                    content = feedback_file.read_text(encoding='utf-8')
                    context_parts.append(f"=== {round_dir.name}/verifier.feedback.md ===\n{content}\n")
                except:
                    pass
    
    return "\n".join(context_parts)

def call_prover(problem_dir: Path, round_idx: int) -> ProverOutput:
    """Call the prover using simple Chat Completions."""
    console.print(f"[bold cyan]Calling Prover (Round {round_idx})...[/bold cyan]")
    
    context = read_problem_context(problem_dir)
    round_tag = f"Round {round_idx:04d} — {datetime.now().isoformat()}Z"
    
    system_prompt = """You are a research mathematician working on challenging problems.

Your goal is **incremental progress**, not necessarily a full solution. Work cleanly and reproducibly.

Before any derivations, write a 3-6 bullet mini-plan.
After each claim, write a one-line "How it can fail" and try a toy counterexample.

**What counts as progress:**
- Extracting useful lemmas from papers
- Checking small cases and examples  
- Building conflicting intuitions (arguments for "yes" vs "no")
- Proving special cases or nontrivial bounds
- Making an approach precise (even if it fails)

You MUST respond with a JSON object with these exact fields:
{
  "progress_md": "Your mathematical analysis starting with ## Round header",
  "new_files": [],
  "requests_for_more_materials": [],
  "next_actions_for_prover": []
}"""

    user_message = f"""Work on this problem:

{context}

Current round: {round_tag}

Include the round tag in your progress_md header. Provide structured JSON output."""

    try:
        response = client.chat.completions.create(
            model=MODEL_PROVER,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.4,
            max_tokens=2000
        )
        
        result_text = response.choices[0].message.content
        result_data = extract_json_from_response(result_text)
        
        if result_data:
            return ProverOutput(**result_data)
        else:
            # Fallback
            return ProverOutput(
                progress_md=f"## {round_tag}\n\n{result_text}",
                new_files=[],
                requests_for_more_materials=[],
                next_actions_for_prover=[]
            )
            
    except Exception as e:
        console.print(f"[bold red]Error calling prover: {e}[/bold red]")
        raise

def call_verifier(problem_dir: Path, round_idx: int) -> VerifierOutput:
    """Call the verifier using simple Chat Completions."""
    console.print(f"[bold cyan]Calling Verifier (Round {round_idx})...[/bold cyan]")
    
    context = read_problem_context(problem_dir)
    
    # Add the latest prover output
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    prover_json = round_dir / "prover.out.json"
    if prover_json.exists():
        prover_data = json.loads(prover_json.read_text(encoding='utf-8'))
        context += f"\n=== Latest Prover Output ===\n{prover_data['progress_md']}\n"

    system_prompt = """You are a strict mathematical verifier and research manager.

**Your tasks:**
1. Audit correctness & rigor - identify gaps and unjustified claims
2. Triage value - separate genuine progress from noise  
3. Guide next steps - suggest actionable experiments

Include a 3-row table:
| Claim (short) | Status [OK/Unclear/Broken] | Why |

You MUST respond with a JSON object with these exact fields:
{
  "feedback_md": "Detailed feedback for the prover",
  "summary_md": "Concise summary for human (2-10 bullets)",
  "verdict": "promising|uncertain|unlikely",
  "blocking_issues": []
}"""

    user_message = f"""Audit the prover's work:

{context}

Provide structured JSON feedback."""

    try:
        response = client.chat.completions.create(
            model=MODEL_VERIFIER,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.2,
            max_tokens=1500
        )
        
        result_text = response.choices[0].message.content
        result_data = extract_json_from_response(result_text)
        
        if result_data:
            return VerifierOutput(**result_data)
        else:
            # Fallback
            return VerifierOutput(
                feedback_md=result_text,
                summary_md="Verifier analysis completed",
                verdict="uncertain",
                blocking_issues=[]
            )
            
    except Exception as e:
        console.print(f"[bold red]Error calling verifier: {e}[/bold red]")
        raise

def run_round(problem_dir: Path, round_idx: int):
    """Execute one round of the prover-verifier loop."""
    console.print(f"\n[bold green]Starting Round {round_idx}[/bold green]")
    
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    
    # Step 1: Call Prover
    prover_output = call_prover(problem_dir, round_idx)
    
    # Save prover output
    (round_dir / "prover.out.json").write_text(
        json.dumps(prover_output.model_dump(), indent=2),
        encoding="utf-8"
    )
    
    # Process progress with header guard
    round_tag = f"## Round {round_idx:04d} — {datetime.now().isoformat()}Z"
    progress_content = prover_output.progress_md.strip()
    
    if not progress_content.startswith("##"):
        progress_content = round_tag + "\n\n" + progress_content
    
    appended_progress = progress_content + "\n\n"
    (round_dir / "progress.appended.md").write_text(appended_progress, encoding="utf-8")
    
    # Append to main progress.md
    progress_file = problem_dir / "progress.md"
    existing_progress = ""
    if progress_file.exists():
        existing_progress = progress_file.read_text(encoding="utf-8")
    
    separator = "\n" if existing_progress and not existing_progress.endswith("\n") else ""
    progress_file.write_text(
        existing_progress + separator + appended_progress,
        encoding="utf-8"
    )
    
    # Create new files
    for new_file in prover_output.new_files:
        file_path = problem_dir / new_file.path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(new_file.content, encoding="utf-8")
        console.print(f"[green]Created file: {new_file.path}[/green]")
    
    # Step 2: Call Verifier
    verifier_output = call_verifier(problem_dir, round_idx)
    
    # Save verifier output
    (round_dir / "verifier.out.json").write_text(
        json.dumps(verifier_output.model_dump(), indent=2),
        encoding="utf-8"
    )
    (round_dir / "verifier.feedback.md").write_text(
        verifier_output.feedback_md,
        encoding="utf-8"
    )
    (round_dir / "verifier.summary.md").write_text(
        verifier_output.summary_md,
        encoding="utf-8"
    )
    
    # Display summary
    console.print(f"\n[bold]Round {round_idx} Complete[/bold]")
    console.print(f"[yellow]Verdict: {verifier_output.verdict}[/yellow]")
    
    if verifier_output.blocking_issues:
        console.print("[red]Blocking Issues:[/red]")
        for issue in verifier_output.blocking_issues:
            console.print(f"  • {issue}")
    
    console.print("\n[bold]Summary for Human:[/bold]")
    console.print(verifier_output.summary_md)

def main():
    parser = argparse.ArgumentParser(description="Simple Prover-Verifier Loop")
    parser.add_argument("problem_dir", type=str, help="Problem directory")
    parser.add_argument("--rounds", type=int, default=1, help="Number of rounds")
    parser.add_argument("--start-round", type=int, default=1, help="Starting round")
    
    args = parser.parse_args()
    
    problem_dir = Path(args.problem_dir).resolve()
    if not problem_dir.exists():
        console.print(f"[red]Error: Directory not found: {problem_dir}[/red]")
        sys.exit(1)
    
    # Check for task file
    task_files = ["task.tex", "task.txt", "task.md"]
    if not any((problem_dir / f).exists() for f in task_files):
        console.print(f"[red]Error: No task file found[/red]")
        sys.exit(1)
    
    # Check API key
    if not os.environ.get("OPENAI_API_KEY"):
        console.print("[red]Error: OPENAI_API_KEY not set[/red]")
        sys.exit(1)
    
    console.print(f"[bold]Simple Prover-Verifier Loop[/bold]")
    console.print(f"Problem: {problem_dir}")
    console.print(f"Models: {MODEL_PROVER} / {MODEL_VERIFIER}")
    
    # Run rounds
    for round_num in range(args.start_round, args.start_round + args.rounds):
        try:
            run_round(problem_dir, round_num)
        except KeyboardInterrupt:
            console.print("\n[yellow]Interrupted[/yellow]")
            break
        except Exception as e:
            console.print(f"\n[red]Error in round {round_num}: {e}[/red]")
            break

if __name__ == "__main__":
    main()