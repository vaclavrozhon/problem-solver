#!/usr/bin/env python3
"""
Simple working orchestrator using basic Chat Completions API.
No complex file search or assistants - just works.
"""

import os
import json
import re
from pathlib import Path
from datetime import datetime, UTC
from typing import List, Dict, Any, Optional
import argparse
import sys
import time
import subprocess

from openai import OpenAI
import openai as _openai
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

MODEL_PROVER = os.environ.get("OPENAI_MODEL_PROVER", "gpt-4o-mini")
MODEL_VERIFIER = os.environ.get("OPENAI_MODEL_VERIFIER", "gpt-4o-mini")
MODEL_SUMMARIZER = os.environ.get("OPENAI_MODEL_SUMMARIZER", "gpt-4o-mini")

PROMPTS_DIR = Path("prompts")

def load_prompt(name: str) -> str:
    p = PROMPTS_DIR / f"{name}.md"
    return p.read_text(encoding="utf-8")

def _enforce_no_additional_properties(schema_obj: dict) -> dict:
    """Ensure every object node has additionalProperties: False, in place."""
    def _visit(node: object):
        if isinstance(node, dict):
            node_type = node.get("type")
            if node_type == "object" and "additionalProperties" not in node:
                node["additionalProperties"] = False
            for value in list(node.values()):
                _visit(value)
        elif isinstance(node, list):
            for item in node:
                _visit(item)
    _visit(schema_obj)
    return schema_obj

def _enforce_required_all_properties(schema_obj: dict) -> dict:
    """Ensure every object node lists all of its properties in 'required'."""
    def _visit(node: object):
        if isinstance(node, dict):
            node_type = node.get("type")
            if node_type == "object" and isinstance(node.get("properties"), dict):
                props = list(node["properties"].keys())
                node["required"] = props
            for value in list(node.values()):
                _visit(value)
        elif isinstance(node, list):
            for item in node:
                _visit(item)
    _visit(schema_obj)
    return schema_obj

def _normalize_schema_strict(schema_obj: dict) -> dict:
    """Apply strict-mode normalizations required by Responses API."""
    _enforce_no_additional_properties(schema_obj)
    _enforce_required_all_properties(schema_obj)
    return schema_obj

def _dump_io(round_dir: Path, agent: str, system_prompt: str, user_message: str,
             raw_dump: str, text: str):
    """Save prompts and responses for debugging."""
    (round_dir / f"{agent}.prompt.txt").write_text(
        f"--- SYSTEM ---\n{system_prompt}\n\n--- USER ---\n{user_message}\n", encoding="utf-8")
    (round_dir / f"{agent}.raw.json").write_text(raw_dump, encoding="utf-8")
    (round_dir / f"{agent}.text.txt").write_text(text, encoding="utf-8")

def _is_o_model(name: str) -> bool:
    return name.lower().startswith("o")

def _complete_text(model: str, system_prompt: str, user_message: str,
                   max_tokens: int = 1500, temperature: float = 0.2,
                   force_json: bool = False, json_schema_obj: dict | None = None) -> tuple[str, str]:
    """
    Returns (text, raw_dump_json_string). Uses Responses API for GPT-5/o-models,
    Chat Completions for GPT-4o family.
    If json_schema_obj is provided and we use Responses, we enforce strict JSON.
    """
    # Clamp requested output tokens to avoid API errors
    # Default cap: allow higher for GPT-5/o-models, keep 16384 for others unless overridden by env
    default_cap = 100000 if (model.startswith("gpt-5") or _is_o_model(model)) else 16384
    try:
        max_cap_env = int(os.environ.get("OPENAI_MAX_OUTPUT_TOKENS", str(default_cap)))
    except ValueError:
        max_cap_env = default_cap
    effective_max = min(max_tokens, max_cap_env)
    if max_tokens > effective_max:
        try:
            console.print(f"[yellow]Clamping max output tokens from {max_tokens} to {effective_max}[/yellow]")
        except Exception:
            pass

    if model.startswith("gpt-5") or _is_o_model(model):
        kwargs = {}
        if force_json and json_schema_obj:
            name = json_schema_obj.get("name", "structured_output")
            schema = json_schema_obj.get("schema", {})
            strict = json_schema_obj.get("strict", True)
            kwargs["text"] = {
                "format": {
                    "type": "json_schema",
                    "name": name,
                    "schema": schema,
                    "strict": strict,
                },
                # Encourage the model to emit visible text
                "verbosity": "high",
            }
        # Use role-structured input for clarity
        r = client.responses.create(
            model=model,
            reasoning={"effort": "high"},
            input=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_output_tokens=effective_max,
            **kwargs
        )
        text = getattr(r, "output_text", "") or ""
        raw_dump = r.model_dump_json()
        return text, raw_dump
    else:
        # Chat Completions branch (gpt-4o family)
        kwargs = {}
        if force_json:
            kwargs["response_format"] = {"type": "json_object"}
        resp = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
            max_tokens=effective_max,
            **kwargs
        )
        text = resp.choices[0].message.content or ""
        raw_dump = json.dumps(resp.model_dump(), ensure_ascii=False)
        return text, raw_dump

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

class SummarizerOutput(BaseModel):
    summary_md: str = Field(..., description="Readable summary of the round")
    highlights: List[str] = Field(default_factory=list)
    next_questions: List[str] = Field(default_factory=list)

def _write_status(problem_dir: Path, phase: str, round_idx: int, extra: dict | None = None):
    """Write live status so the UI can show current phase + since when."""
    status = {
        "phase": phase,                 # "prover" | "verifier" | "summarizer" | "idle"
        "round": round_idx,
        "ts": int(time.time()),         # Unix timestamp for timezone-proof elapsed time
        "models": {
            "prover": MODEL_PROVER,
            "verifier": MODEL_VERIFIER,
            "summarizer": MODEL_SUMMARIZER,
        }
    }
    if extra: status.update(extra)
    (problem_dir / "runs").mkdir(parents=True, exist_ok=True)
    (problem_dir / "runs" / "live_status.json").write_text(
        json.dumps(status, indent=2), encoding="utf-8"
    )

def _gather_context_files(problem_dir: Path, round_idx: int) -> list[str]:
    """List the files we send to Prover this round (approximate, matches read_problem_context)."""
    files: list[str] = []
    # task
    for task_file in ["task.tex", "task.txt", "task.md"]:
        p = problem_dir / task_file
        if p.exists():
            files.append(task_file)
            break
    # progress (tail)
    if (problem_dir / "progress.md").exists():
        files.append("progress.md (tail)")
    
    # summary (tail)  
    if (problem_dir / "summary.md").exists():
        files.append("summary.md (tail)")
    
    # Non-PDF papers (txt/md files in papers/)
    papers_dir = problem_dir / "papers"
    if papers_dir.exists():
        for paper in sorted(papers_dir.rglob("*")):
            if paper.is_file() and paper.suffix.lower() in {'.txt', '.md'}:
                files.append(str(paper.relative_to(problem_dir)))
    
    # Non-PDF files in root directory (txt/md next to task files)
    for q in sorted(problem_dir.glob("*")):
        if q.is_file() and q.name not in {"task.tex", "task.txt", "task.md", "progress.md", "summary.md"}:
            if q.suffix.lower() in {".md", ".txt"}:
                files.append(q.name)
    
    # Ensure PDFs are parsed and show them as parsed files
    _ensure_pdfs_parsed(problem_dir)
    papers_parsed_dir = problem_dir / "papers_parsed"
    if papers_parsed_dir.exists():
        for parsed_file in sorted(papers_parsed_dir.glob("*.txt")):
            # Show as "paper.pdf (parsed)" to indicate it's the PDF content
            pdf_name = parsed_file.stem + ".pdf"
            files.append(f"{pdf_name} (parsed)")
    
    # last 2 rounds of verifier feedback (these are added in read_problem_context)
    runs_dir = problem_dir / "runs"
    if runs_dir.exists():
        for d in sorted([d for d in runs_dir.iterdir() if d.is_dir()])[-2:]:
            vf = d / "verifier.feedback.md"
            if vf.exists():
                files.append(str(vf.relative_to(problem_dir)))
    return files

def _auto_commit_round(problem_dir: Path, round_idx: int, verdict: str):
    """Auto-commit the round results to git if this is a git repo."""
    try:
        # Check if we're in a git repo
        result = subprocess.run(["git", "rev-parse", "--git-dir"], 
                              cwd=problem_dir.parent, capture_output=True, text=True)
        if result.returncode != 0:
            return  # Not a git repo
        
        # Add the problem directory
        problem_name = problem_dir.name
        subprocess.run(["git", "add", f"problems/{problem_name}/"], 
                      cwd=problem_dir.parent, check=False)
        
        # Commit with a descriptive message
        commit_msg = f"{problem_name} round-{round_idx:04d}: verdict={verdict}"
        subprocess.run(["git", "commit", "-m", commit_msg], 
                      cwd=problem_dir.parent, check=False)
        
        console.print(f"[green]Auto-committed: {commit_msg}[/green]")
    except Exception as e:
        console.print(f"[yellow]Git auto-commit failed: {e}[/yellow]")

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

def _extract_pdf_text(pdf_path: Path) -> str:
    """Extract full text from PDF using pymupdf (fitz) - no limits."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(len(doc)):  # All pages
            page = doc.load_page(page_num)
            text += f"\n--- Page {page_num + 1} ---\n"
            text += page.get_text()
        doc.close()
        return text  # No size limit
    except ImportError:
        return "[PDF text extraction requires: pip install pymupdf]"
    except Exception as e:
        return f"[PDF extraction failed: {e}]"

def _ensure_pdfs_parsed(problem_dir: Path) -> None:
    """Ensure all PDFs in problem directory are parsed and cached in papers_parsed/."""
    papers_parsed_dir = problem_dir / "papers_parsed"
    papers_parsed_dir.mkdir(exist_ok=True)
    
    # Find all PDFs in both papers/ and root directory
    pdf_paths = []
    
    # PDFs in papers/ directory
    papers_dir = problem_dir / "papers"
    if papers_dir.exists():
        pdf_paths.extend(papers_dir.rglob("*.pdf"))
    
    # PDFs in root directory (next to task files)
    for pdf_file in problem_dir.glob("*.pdf"):
        pdf_paths.append(pdf_file)
    
    for pdf_path in pdf_paths:
        # Create parsed filename: paper.pdf -> paper.txt
        parsed_filename = pdf_path.stem + ".txt"
        parsed_path = papers_parsed_dir / parsed_filename
        
        # Check if we need to parse (file doesn't exist or PDF is newer)
        should_parse = False
        if not parsed_path.exists():
            should_parse = True
        else:
            pdf_mtime = pdf_path.stat().st_mtime
            parsed_mtime = parsed_path.stat().st_mtime
            if pdf_mtime > parsed_mtime:
                should_parse = True
        
        if should_parse:
            console.print(f"[cyan]Parsing PDF: {pdf_path.name}[/cyan]")
            extracted_text = _extract_pdf_text(pdf_path)
            parsed_path.write_text(extracted_text, encoding="utf-8")
        # else: already parsed and up to date

def _get_parsed_pdf_content(problem_dir: Path) -> str:
    """Get all parsed PDF content from papers_parsed/ directory."""
    papers_parsed_dir = problem_dir / "papers_parsed"
    if not papers_parsed_dir.exists():
        return ""
    
    content_parts = []
    for parsed_file in sorted(papers_parsed_dir.glob("*.txt")):
        try:
            content = parsed_file.read_text(encoding="utf-8")
            # Use original PDF name for context headers
            pdf_name = parsed_file.stem + ".pdf"
            content_parts.append(f"=== {pdf_name} ===\n{content}\n")
        except Exception as e:
            content_parts.append(f"=== {parsed_file.name} ===\n[Error reading parsed content: {e}]\n")
    
    return "\n".join(content_parts)

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
    
    # Aggregated summaries (model + user feedback)
    summary_path = problem_dir / "summary.md"
    if summary_path.exists():
        content = summary_path.read_text(encoding='utf-8')
        if len(content) > 30000:
            content = "...\n" + content[-30000:]
        context_parts.append(f"=== summary.md ===\n{content}\n")
    
    # Non-PDF papers (txt/md files in papers/)
    papers_dir = problem_dir / "papers"
    if papers_dir.exists():
        for paper in papers_dir.rglob("*"):
            if paper.is_file() and paper.suffix.lower() in {'.txt', '.md'}:
                try:
                    content = paper.read_text(encoding='utf-8')
                    context_parts.append(f"=== {paper.name} ===\n{content}\n")
                except:
                    pass
    
    # Non-PDF files in root directory (txt/md next to task files)
    for q in sorted(problem_dir.glob("*")):
        if q.is_file() and q.name not in {"task.tex", "task.txt", "task.md", "progress.md", "summary.md"}:
            if q.suffix.lower() in {".md", ".txt"}:
                try:
                    content = q.read_text(encoding="utf-8")
                    context_parts.append(f"=== {q.name} ===\n{content}\n")
                except:
                    pass
    
    # PDF content (cached, all pages, no size limit)
    if include_pdfs:
        # Ensure all PDFs are parsed and cached
        _ensure_pdfs_parsed(problem_dir)
        # Get all parsed PDF content
        pdf_content = _get_parsed_pdf_content(problem_dir)
        if pdf_content:
            context_parts.append(pdf_content)
    
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
    console.print(f"[bold cyan]Calling Prover (Round {round_idx})...[/bold cyan]")

    context = read_problem_context(problem_dir)
    round_tag = f"Round {round_idx:04d} — {datetime.now().isoformat()}Z"

    system_prompt = load_prompt("prover").replace("{ROUND_TAG}", round_tag)

    user_message = f"""Work on this problem context:

{context}

Current round tag: {round_tag}
Return ONLY valid JSON (no fences). Ensure progress_md starts with '## {round_tag}'."""

    # Create JSON schema for GPT-5
    schema = {
        "name": "ProverOutput",
        "schema": _normalize_schema_strict(ProverOutput.model_json_schema()),
        "strict": True
    }

    text, dump = _complete_text(
        MODEL_PROVER, system_prompt, user_message,
        max_tokens=100000, temperature=0.4,
        force_json=True,
        json_schema_obj=schema if MODEL_PROVER.startswith("gpt-5") else None
    )
    
    # Write raw IO for debugging
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    _dump_io(round_dir, "prover", system_prompt, user_message, dump, text)

    # Parse JSON
    try:
        data = json.loads(text) if not _is_o_model(MODEL_PROVER) or MODEL_PROVER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError:
        # Save raw non-JSON for debugging
        (round_dir / "prover.nonjson.txt").write_text(text, encoding="utf-8")
        data = None

    if not data:
        shown_text = text if text.strip() else "(the model did not return anything)"
        data = {
            "progress_md": f"## {round_tag}\n\n(JSON parsing fallback)\n\n{shown_text}",
            "new_files": [],
            "requests_for_more_materials": [],
            "next_actions_for_prover": []
        }

    # Guard against empty/short progress but preserve raw output for debugging
    pm = (data.get("progress_md") or "").strip()
    if not pm.startswith("##"):
        data["progress_md"] = f"## {round_tag}\n\n" + pm
        pm = (data.get("progress_md") or "").strip()
    if len(pm) < 80:
        shown_text = text if text.strip() else "(the model did not return anything)"
        data["progress_md"] = (
            f"## {round_tag}\n\n(Model returned too little; raw output below)\n\n{shown_text}"
        )
    
    # Ensure list fields exist
    data.setdefault("new_files", [])
    data.setdefault("requests_for_more_materials", [])
    data.setdefault("next_actions_for_prover", [])

    return ProverOutput(**data)

def call_verifier(problem_dir: Path, round_idx: int) -> VerifierOutput:
    console.print(f"[bold cyan]Calling Verifier (Round {round_idx})...[/bold cyan]")

    context = read_problem_context(problem_dir)
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    prover_json = round_dir / "prover.out.json"
    if prover_json.exists():
        prover_data = json.loads(prover_json.read_text(encoding="utf-8"))
        context += f"\n=== Latest Prover Output ===\n{prover_data.get('progress_md','')}\n"

    system_prompt = load_prompt("verifier")

    user_message = f"""Audit the prover's latest round and the context:

{context}

Return ONLY valid JSON."""

    # Create JSON schema for GPT-5
    schema = {
        "name": "VerifierOutput",
        "schema": _normalize_schema_strict(VerifierOutput.model_json_schema()),
        "strict": True
    }

    text, dump = _complete_text(
        MODEL_VERIFIER, system_prompt, user_message,
        max_tokens=100000, temperature=0.2,
        force_json=True,
        json_schema_obj=schema if MODEL_VERIFIER.startswith("gpt-5") else None
    )
    
    # Write raw IO for debugging
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    _dump_io(round_dir, "verifier", system_prompt, user_message, dump, text)

    # Parse JSON
    try:
        data = json.loads(text) if not _is_o_model(MODEL_VERIFIER) or MODEL_VERIFIER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError as e:
        console.print(f"[red]Verifier JSON decode error: {e}[/red]")
        console.print(f"[dim]Raw response: {text[:500]}[/dim]")
        # Save raw non-JSON for debugging
        (round_dir / "verifier.nonjson.txt").write_text(text, encoding="utf-8")
        # Fallback
        data = {
            "feedback_md": f"(JSON fallback)\n\n{text}",
            "summary_md": "Verifier JSON parsing failed",
            "verdict": "uncertain",
            "blocking_issues": ["JSON parsing error"]
        }

    # Fill defaults if the model omitted them
    data.setdefault("blocking_issues", [])
    if not data.get("summary_md"):
        data["summary_md"] = "No summary provided."
    
    # Make 'verdict' robust - ensure it's always one of the valid values
    if data.get("verdict") not in {"promising", "uncertain", "unlikely"}:
        data["verdict"] = "uncertain"
    
    # Fix type issues - convert lists to strings if needed
    if isinstance(data.get("summary_md"), list):
        data["summary_md"] = "\n".join(f"• {item}" for item in data["summary_md"])
    
    if isinstance(data.get("feedback_md"), list):
        data["feedback_md"] = "\n".join(data["feedback_md"])
    
    if isinstance(data.get("blocking_issues"), str):
        data["blocking_issues"] = [data["blocking_issues"]]

    # Soft guard for empty feedback
    if len((data.get("feedback_md") or "").strip()) < 50:
        data["feedback_md"] = "Feedback was too short; expand next round."

    return VerifierOutput(**data)

def call_summarizer(problem_dir: Path, round_idx: int) -> SummarizerOutput:
    console.print(f"[bold cyan]Calling Summarizer (Round {round_idx})...[/bold cyan]")

    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    # Load the two previous artifacts
    prover_json = json.loads((round_dir / "prover.out.json").read_text(encoding="utf-8"))
    verifier_json = json.loads((round_dir / "verifier.out.json").read_text(encoding="utf-8"))

    context = f"""=== Prover (progress_md) ===
{prover_json.get('progress_md','')}

=== Verifier (summary_md) ===
{verifier_json.get('summary_md','')}
=== Verifier (verdict) ===
{verifier_json.get('verdict','')}
"""

    system_prompt = load_prompt("summarizer")

    # Create JSON schema for GPT-5
    schema = {
        "name": "SummarizerOutput",
        "schema": _normalize_schema_strict(SummarizerOutput.model_json_schema()),
        "strict": True
    }

    text, dump = _complete_text(
        MODEL_SUMMARIZER, system_prompt, context,
        max_tokens=100000, temperature=0.2,
        force_json=True,
        json_schema_obj=schema if MODEL_SUMMARIZER.startswith("gpt-5") else None
    )
    
    # Write raw IO for debugging
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    _dump_io(round_dir, "summarizer", system_prompt, context, dump, text)

    # Parse JSON
    try:
        data = json.loads(text) if not _is_o_model(MODEL_SUMMARIZER) or MODEL_SUMMARIZER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError as e:
        console.print(f"[red]Summarizer JSON decode error: {e}")
        (round_dir / "summarizer.nonjson.txt").write_text(text, encoding="utf-8")
        # Fallback
        data = {
            "summary_md": f"Summarizer JSON fallback\n\n{text}",
            "highlights": [],
            "next_questions": []
        }

    data.setdefault("highlights", [])
    data.setdefault("next_questions", [])
    return SummarizerOutput(**data)

def run_round(problem_dir: Path, round_idx: int):
    """Execute one round of the prover-verifier-summarizer loop with timings."""
    console.print(f"\n[bold green]Starting Round {round_idx}[/bold green]")

    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)

    # Context files recorded for this round (for UI)
    ctx_files = _gather_context_files(problem_dir, round_idx)
    (round_dir / "context.files.json").write_text(json.dumps(ctx_files, indent=2), encoding="utf-8")

    timings = {}

    # ----- Step 1: Prover -----
    _write_status(problem_dir, phase="prover", round_idx=round_idx)
    t0 = time.perf_counter()
    prover_output = call_prover(problem_dir, round_idx)
    t1 = time.perf_counter()
    timings["prover"] = {"model": MODEL_PROVER, "duration_s": round(t1 - t0, 3)}

    (round_dir / "prover.out.json").write_text(json.dumps(prover_output.model_dump(), indent=2), encoding="utf-8")

    round_tag = f"## Round {round_idx:04d} — {datetime.now().isoformat()}Z"
    progress_content = prover_output.progress_md.strip()
    if not progress_content.startswith("##"):
        progress_content = round_tag + "\n\n" + progress_content
    appended_progress = progress_content + "\n\n"
    (round_dir / "progress.appended.md").write_text(appended_progress, encoding="utf-8")

    progress_file = problem_dir / "progress.md"
    existing = progress_file.read_text(encoding="utf-8") if progress_file.exists() else ""
    sep = "\n" if existing and not existing.endswith("\n") else ""
    progress_file.write_text(existing + sep + appended_progress, encoding="utf-8")

    for nf in prover_output.new_files:
        fp = problem_dir / nf.path
        fp.parent.mkdir(parents=True, exist_ok=True)
        fp.write_text(nf.content, encoding="utf-8")
        console.print(f"[green]Created file: {nf.path}[/green]")

    # ----- Step 2: Verifier -----
    _write_status(problem_dir, phase="verifier", round_idx=round_idx, extra=timings)
    t0 = time.perf_counter()
    verifier_output = call_verifier(problem_dir, round_idx)
    t1 = time.perf_counter()
    timings["verifier"] = {"model": MODEL_VERIFIER, "duration_s": round(t1 - t0, 3)}

    (round_dir / "verifier.out.json").write_text(json.dumps(verifier_output.model_dump(), indent=2), encoding="utf-8")
    (round_dir / "verifier.feedback.md").write_text(verifier_output.feedback_md, encoding="utf-8")
    (round_dir / "verifier.summary.md").write_text(verifier_output.summary_md, encoding="utf-8")

    # ----- Step 3: Summarizer -----
    _write_status(problem_dir, phase="summarizer", round_idx=round_idx, extra=timings)
    t0 = time.perf_counter()
    summarizer_output = call_summarizer(problem_dir, round_idx)
    t1 = time.perf_counter()
    timings["summarizer"] = {"model": MODEL_SUMMARIZER, "duration_s": round(t1 - t0, 3)}

    (round_dir / "summarizer.out.json").write_text(json.dumps(summarizer_output.model_dump(), indent=2), encoding="utf-8")
    (round_dir / "summarizer.summary.md").write_text(summarizer_output.summary_md, encoding="utf-8")

    # Append model's summary for this round to aggregated summary.md
    agg_summary = problem_dir / "summary.md"
    prev = agg_summary.read_text(encoding="utf-8") if agg_summary.exists() else ""
    hdr = f"## {round_dir.name} — model summary — {datetime.now().isoformat()}Z\n"
    agg_summary.write_text(prev + ("" if prev.endswith("\n") else "\n") + hdr +
                           summarizer_output.summary_md.strip() + "\n\n",
                           encoding="utf-8")

    # Persist timings for the UI and mark idle
    (round_dir / "timings.json").write_text(json.dumps(timings, indent=2), encoding="utf-8")
    _write_status(problem_dir, phase="idle", round_idx=round_idx, extra={"last_round": round_idx, **timings})

    # Auto-commit to git
    _auto_commit_round(problem_dir, round_idx, verifier_output.verdict)

    # Console summary
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
    console.print(f"OpenAI SDK: {_openai.__version__}")
    
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