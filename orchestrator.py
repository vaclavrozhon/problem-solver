#!/usr/bin/env python3
"""
Simple working orchestrator using basic Chat Completions API.
No complex file search or assistants - just works.
"""

import os
import difflib
import random
import json
import re
from pathlib import Path
from datetime import datetime, UTC
from typing import List, Dict, Any, Optional, cast
from concurrent.futures import ThreadPoolExecutor, as_completed
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

# Paper-writing agents
MODEL_PAPER_SUGGESTER = os.environ.get("OPENAI_MODEL_PAPER_SUGGESTER", MODEL_VERIFIER)
MODEL_PAPER_FIXER = os.environ.get("OPENAI_MODEL_PAPER_FIXER", MODEL_VERIFIER)

# Prover temperature (overridable via AR_PROVER_TEMPERATURE)
try:
    PROVER_TEMPERATURE = float(os.environ.get("AR_PROVER_TEMPERATURE", "0.4"))
except ValueError:
    PROVER_TEMPERATURE = 0.4

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

    # Retry/backoff settings
    try:
        max_retries = int(os.environ.get("AR_RETRY_MAX_RETRIES", "5"))
    except ValueError:
        max_retries = 5
    try:
        base_sleep = float(os.environ.get("AR_RETRY_BASE_S", "5"))
    except ValueError:
        base_sleep = 5.0
    try:
        max_sleep = float(os.environ.get("AR_RETRY_MAX_SLEEP_S", "180"))
    except ValueError:
        max_sleep = 180.0

    def _maybe_rate_limit(e: Exception) -> bool:
        msg = str(e).lower()
        return ("rate limit" in msg) or ("429" in msg) or ("rate_limit_exceeded" in msg)

    def _sleep_backoff(attempt: int, err_msg: str):
        # Try to extract a suggested delay like "try again in 4.368s"
        delay = base_sleep * (2 ** attempt)
        if "try again in" in err_msg.lower():
            try:
                part = err_msg.lower().split("try again in", 1)[1].split("s", 1)[0]
                seconds = float(part.strip().split()[-1])
                delay = max(delay, seconds)
            except Exception:
                pass
        delay = min(delay, max_sleep)
        delay += random.uniform(0, 1.0)
        try:
            console.print(f"[yellow]Rate limited. Backing off {delay:.1f}s (attempt {attempt+1}/{max_retries})[/yellow]")
        except Exception:
            pass
        time.sleep(delay)

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
        last_err: Exception | None = None
        for attempt in range(max_retries + 1):
            try:
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
            except Exception as e:
                last_err = e
                if attempt >= max_retries or not _maybe_rate_limit(e):
                    raise
                _sleep_backoff(attempt, str(e))
        assert last_err is not None
        raise last_err
    else:
        # Chat Completions branch (gpt-4o family)
        kwargs = {}
        if force_json:
            kwargs["response_format"] = {"type": "json_object"}
        last_err: Exception | None = None
        for attempt in range(max_retries + 1):
            try:
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
            except Exception as e:
                last_err = e
                if attempt >= max_retries or not _maybe_rate_limit(e):
                    raise
                _sleep_backoff(attempt, str(e))
        assert last_err is not None
        raise last_err

class ProverOutput(BaseModel):
    progress_md: str = Field(..., description="Append-only progress notes")

class VerifierOutput(BaseModel):
    feedback_md: str = Field(..., description="Detailed feedback")
    summary_md: str = Field(..., description="Concise summary")
    verdict: str = Field(..., description="promising|uncertain|unlikely")
    blocking_issues: List[str] = Field(default_factory=list)

class PerProverFeedback(BaseModel):
    prover_id: str = Field(..., description="Prover identifier, e.g., 01")
    brief_feedback: str = Field(..., description="Short targeted feedback")
    score: str = Field(..., description="promising|uncertain|unlikely")

class NotesUpdate(BaseModel):
    mode: str = Field(..., description="append|replace")
    content_md: str = Field("", description="Markdown to write to notes.md")

class OutputUpdate(BaseModel):
    mode: str = Field(..., description="append|replace")
    content_md: str = Field("", description="Markdown to write to output.md")

class VerifierCombinedOutput(BaseModel):
    feedback_md: str
    summary_md: str
    verdict: str
    blocking_issues: List[str] = Field(default_factory=list)
    per_prover: List[PerProverFeedback] = Field(default_factory=list)
    notes_update: Optional[NotesUpdate] = None
    output_update: Optional[OutputUpdate] = None

class VerifierNewSchema(BaseModel):
    feedback_md: str
    new_notes_md: str
    new_notes_append: str
    new_outputs_md: str
    new_outputs_append: str
    verdict: str

# Writer removed for now; we keep rigorous outputs in output.md via verifier

class SummarizerOutput(BaseModel):
    summary_md: str = Field(..., description="Readable summary of the round")
    highlights: List[str] = Field(default_factory=list)
    next_questions: List[str] = Field(default_factory=list)

class PaperSuggesterOutput(BaseModel):
    advice_md: str
    priority_items: List[str]
    risk_notes: str

class PaperFixerOutput(BaseModel):
    status: str
    new_tex: str
    changes_summary_md: str
    unfixable_issues_md: str
    compiler_expectations_md: str

def _write_status(problem_dir: Path, phase: str, round_idx: int, extra: dict | None = None):
    """Write live status so the UI can show current phase + since when."""
    status = {
        "phase": phase,                 # "prover" | "verifier" | "summarizer" | "paper_suggester" | "paper_fixer" | "paper_compile" | "idle"
        "round": round_idx,
        "ts": int(time.time()),         # Unix timestamp for timezone-proof elapsed time
        "models": {
            "prover": MODEL_PROVER,
            "verifier": MODEL_VERIFIER,
            "summarizer": MODEL_SUMMARIZER,
            "paper_suggester": MODEL_PAPER_SUGGESTER,
            "paper_fixer": MODEL_PAPER_FIXER,
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
    
    # Task file (or paper.* in papers/ as fallback)
    task_found = False
    for task_file in ["task.tex", "task.txt", "task.md"]:
        p = problem_dir / task_file
        if p.exists():
            files.append(task_file)
            task_found = True
            break
    
    # If no task file, check for paper.* in papers/ directory as the main task
    if not task_found:
        papers_dir = problem_dir / "papers"
        if papers_dir.exists():
            for ext in ['.pdf', '.html', '.htm', '.txt', '.md']:
                paper_path = papers_dir / f"paper{ext}"
                if paper_path.exists():
                    files.append(f"task.md (generated from papers/paper{ext})")
                    task_found = True
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
    
    # Ensure papers (PDFs and HTMLs) are parsed and show them as parsed files
    _ensure_papers_parsed(problem_dir)
    papers_parsed_dir = problem_dir / "papers_parsed"
    if papers_parsed_dir.exists():
        for parsed_file in sorted(papers_parsed_dir.glob("*.txt")):
            # Determine original file extension
            stem = parsed_file.stem
            original_name = None
            
            # Check for corresponding PDF or HTML file
            for ext in ['.pdf', '.html', '.htm']:
                # Check in papers/ directory
                papers_dir = problem_dir / "papers"
                if papers_dir.exists():
                    if (papers_dir / (stem + ext)).exists():
                        original_name = stem + ext
                        break
                # Check in root directory
                if (problem_dir / (stem + ext)).exists():
                    original_name = stem + ext
                    break
            
            # If we couldn't find the original, default to .pdf for backward compatibility
            if not original_name:
                original_name = stem + ".pdf"
            
            files.append(f"{original_name} (parsed)")
    
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
        import fitz  # type: ignore  # PyMuPDF
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

def _extract_html_text(html_path: Path) -> str:
    """Extract text from HTML file."""
    try:
        from bs4 import BeautifulSoup
        html_content = html_path.read_text(encoding="utf-8")
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text and preserve some structure
        text = soup.get_text(separator='\n', strip=True)
        return text
    except ImportError:
        # Fall back to raw HTML if BeautifulSoup not available
        import re
        html_content = html_path.read_text(encoding="utf-8")
        # Simple HTML tag removal
        text = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    except Exception as e:
        return f"[HTML extraction failed: {e}]"

def _ensure_papers_parsed(problem_dir: Path) -> None:
    """Ensure all PDFs and HTMLs in problem directory are parsed and cached in papers_parsed/."""
    papers_parsed_dir = problem_dir / "papers_parsed"
    papers_parsed_dir.mkdir(exist_ok=True)
    
    # Find all PDFs and HTMLs in both papers/ and root directory
    document_paths = []
    
    # Documents in papers/ directory
    papers_dir = problem_dir / "papers"
    if papers_dir.exists():
        document_paths.extend(papers_dir.rglob("*.pdf"))
        document_paths.extend(papers_dir.rglob("*.html"))
        document_paths.extend(papers_dir.rglob("*.htm"))
    
    # Documents in root directory (next to task files)
    for pattern in ["*.pdf", "*.html", "*.htm"]:
        for doc_file in problem_dir.glob(pattern):
            document_paths.append(doc_file)
    
    for doc_path in document_paths:
        # Create parsed filename: paper.pdf/paper.html -> paper.txt
        parsed_filename = doc_path.stem + ".txt"
        parsed_path = papers_parsed_dir / parsed_filename
        
        # Check if we need to parse (file doesn't exist or source is newer)
        should_parse = False
        if not parsed_path.exists():
            should_parse = True
        else:
            doc_mtime = doc_path.stat().st_mtime
            parsed_mtime = parsed_path.stat().st_mtime
            if doc_mtime > parsed_mtime:
                should_parse = True
        
        if should_parse:
            if doc_path.suffix.lower() == '.pdf':
                console.print(f"[cyan]Parsing PDF: {doc_path.name}[/cyan]")
                extracted_text = _extract_pdf_text(doc_path)
            elif doc_path.suffix.lower() in ['.html', '.htm']:
                console.print(f"[cyan]Parsing HTML: {doc_path.name}[/cyan]")
                extracted_text = _extract_html_text(doc_path)
            else:
                continue
            
            parsed_path.write_text(extracted_text, encoding="utf-8")
        # else: already parsed and up to date

def _get_parsed_papers_content(problem_dir: Path) -> str:
    """Get all parsed paper content (PDFs and HTMLs) from papers_parsed/ directory."""
    papers_parsed_dir = problem_dir / "papers_parsed"
    if not papers_parsed_dir.exists():
        return ""
    
    content_parts = []
    for parsed_file in sorted(papers_parsed_dir.glob("*.txt")):
        try:
            content = parsed_file.read_text(encoding="utf-8")
            # Determine original file extension by checking what exists
            stem = parsed_file.stem
            original_name = None
            
            # Check for corresponding PDF or HTML file
            for ext in ['.pdf', '.html', '.htm']:
                # Check in papers/ directory
                papers_dir = problem_dir / "papers"
                if papers_dir.exists():
                    if (papers_dir / (stem + ext)).exists():
                        original_name = stem + ext
                        break
                # Check in root directory
                if (problem_dir / (stem + ext)).exists():
                    original_name = stem + ext
                    break
            
            # If we couldn't find the original, default to .pdf for backward compatibility
            if not original_name:
                original_name = stem + ".pdf"
            
            content_parts.append(f"=== {original_name} ===\n{content}\n")
        except Exception as e:
            content_parts.append(f"=== {parsed_file.name} ===\n[Error reading parsed content: {e}]\n")
    
    return "\n".join(content_parts)

def read_problem_context(problem_dir: Path, include_pdfs: bool = True) -> str:
    """Read problem files into a context string."""
    context_parts = []
    
    # Task file (or paper.* in papers/ as fallback)
    task_found = False
    for task_file in ["task.tex", "task.txt", "task.md"]:
        task_path = problem_dir / task_file
        if task_path.exists():
            context_parts.append(f"=== {task_file} ===\n{task_path.read_text(encoding='utf-8')}\n")
            task_found = True
            break
    
    # If no task file, check for paper.* in papers/ directory as the main task
    if not task_found:
        papers_dir = problem_dir / "papers"
        if papers_dir.exists():
            # Look for paper.pdf, paper.html, paper.htm, paper.txt, paper.md
            for ext in ['.pdf', '.html', '.htm', '.txt', '.md']:
                paper_path = papers_dir / f"paper{ext}"
                if paper_path.exists():
                    task_instructions = """=== task.md ===
# Task

Improve upon the following paper in any way you see fit. Look for conjectures to prove, results to strengthen, or new connections to discover.

## Paper Content

"""
                    if ext in ['.pdf', '.html', '.htm']:
                        # For PDF/HTML, use parsed content
                        _ensure_papers_parsed(problem_dir)
                        parsed_path = problem_dir / "papers_parsed" / "paper.txt"
                        if parsed_path.exists():
                            content = parsed_path.read_text(encoding='utf-8')
                            context_parts.append(task_instructions + content + "\n")
                    else:
                        # For text/markdown, read directly
                        content = paper_path.read_text(encoding='utf-8')
                        context_parts.append(task_instructions + content + "\n")
                    task_found = True
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
    
    # Paper content (PDFs and HTMLs, cached, all pages, no size limit)
    if include_pdfs:
        # Ensure all papers are parsed and cached
        _ensure_papers_parsed(problem_dir)
        # Get all parsed paper content
        papers_content = _get_parsed_papers_content(problem_dir)
        if papers_content:
            context_parts.append(papers_content)
    
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

def _apply_notes_update(problem_dir: Path, update: Optional[NotesUpdate]) -> None:
    if not update or not update.content_md:
        return
    notes_path = problem_dir / "notes.md"
    existing = notes_path.read_text(encoding="utf-8") if notes_path.exists() else ""
    if update.mode == "replace":
        notes_path.write_text(update.content_md, encoding="utf-8")
    else:
        sep = "\n" if existing and not existing.endswith("\n") else ""
        notes_path.write_text(existing + sep + update.content_md, encoding="utf-8")

def _compile_latex(problem_dir: Path, round_idx: int) -> tuple[bool, str]:
    """Compile outputs.tex; retained for legacy writer."""
    tex_path = problem_dir / "outputs.tex"
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    log_path = round_dir / "outputs.compile.log"
    if not tex_path.exists():
        log_path.write_text("[outputs.tex not found]", encoding="utf-8")
        return False, "outputs.tex not found"
    try:
        # Run pdflatex twice in nonstop mode
        last = None
        for _ in range(2):
            proc = subprocess.run(
                [
                    "pdflatex",
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "-output-directory",
                    str(problem_dir),
                    str(tex_path),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                check=False,
                text=True,
            )
            last = proc
        out = last.stdout if last else ""
        log_path.write_text(out, encoding="utf-8")
        pdf_ok = (problem_dir / "outputs.pdf").exists()
        return pdf_ok, out
    except Exception as e:
        log_path.write_text(f"[compile error] {e}", encoding="utf-8")
        return False, str(e)

def _compile_tex_string(problem_dir: Path, round_idx: int, tex_source: str, basename: str = "final_output") -> tuple[bool, str, Path | None]:
    """Compile a LaTeX source string to PDF in the problem directory.
    Returns (ok, log, pdf_path_or_none). Writes .tex and .log under problem_dir.
    """
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    tex_path = problem_dir / f"{basename}.tex"
    log_path = round_dir / f"{basename}.compile.log"
    try:
        tex_path.write_text(tex_source, encoding="utf-8")
    except Exception as e:
        log_path.write_text(f"[write error] {e}", encoding="utf-8")
        return False, str(e), None
    try:
        last = None
        # twice for references
        for _ in range(2):
            proc = subprocess.run(
                [
                    "pdflatex",
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "-output-directory",
                    str(problem_dir),
                    str(tex_path),
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                check=False,
            )
            last = proc
        out = last.stdout if last else ""
        log_path.write_text(out, encoding="utf-8")
        # Output directory is problem_dir, so PDF will be placed there with the base name only
        pdf_output_name = Path(basename).name + ".pdf"
        pdf_path = problem_dir / pdf_output_name
        return pdf_path.exists(), out, (pdf_path if pdf_path.exists() else None)
    except Exception as e:
        log_path.write_text(f"[compile error] {e}", encoding="utf-8")
        return False, str(e), None

def _read_notes_and_outputs(problem_dir: Path) -> tuple[str, str]:
    notes = (problem_dir / "notes.md").read_text(encoding="utf-8") if (problem_dir / "notes.md").exists() else ""
    outputs = (problem_dir / "output.md").read_text(encoding="utf-8") if (problem_dir / "output.md").exists() else ""
    return notes, outputs

def call_prover_one(problem_dir: Path, round_idx: int, prover_idx: int, total: int) -> ProverOutput:
    console.print(f"[bold cyan]Calling Prover {prover_idx:02d}/{total} (Round {round_idx})...[/bold cyan]")

    context = read_problem_context(problem_dir)
    notes_md, outputs_tex = _read_notes_and_outputs(problem_dir)
    if notes_md:
        context += f"\n=== notes.md ===\n{notes_md}\n"
    if outputs_tex:
        context += f"\n=== output.md ===\n{outputs_tex}\n"
    round_tag = f"Round {round_idx:04d} — {datetime.now().isoformat()}Z"

    system_prompt = load_prompt("prover").replace("{ROUND_TAG}", round_tag)

    user_message = f"""Work on this problem context:

{context}

Current round tag: {round_tag}
Return ONLY valid JSON with a single field:
{{ "progress_md": "<your progress notes for this round>" }}

Read output.md. If you spot gaps, errors, or missing justifications in output.md, point them out clearly inside progress_md."""

    schema = {
        "name": "ProverOutput",
        "schema": _normalize_schema_strict(ProverOutput.model_json_schema()),
        "strict": True
    }

    text, dump = _complete_text(
        MODEL_PROVER, system_prompt, user_message,
        max_tokens=100000, temperature=PROVER_TEMPERATURE,
        force_json=True,
        json_schema_obj=schema if MODEL_PROVER.startswith("gpt-5") else None
    )

    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    _dump_io(round_dir, f"prover-{prover_idx:02d}", system_prompt, user_message, dump, text)

    try:
        data = json.loads(text) if not _is_o_model(MODEL_PROVER) or MODEL_PROVER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError:
        (round_dir / f"prover-{prover_idx:02d}.nonjson.txt").write_text(text, encoding="utf-8")
        data = None

    if not data:
        shown_text = text if text.strip() else "(the model did not return anything)"
        data = {
            "progress_md": shown_text
        }

    # No further shaping; pass through

    out = ProverOutput(**data)
    (round_dir / f"prover-{prover_idx:02d}.out.json").write_text(json.dumps(out.model_dump(), indent=2), encoding="utf-8")
    return out

def call_verifier_combined(problem_dir: Path, round_idx: int, num_provers: int) -> 'VerifierCombinedOutput':
    console.print(f"[bold cyan]Calling Verifier (Combined, Round {round_idx})...[/bold cyan]")
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    reports = []
    for i in range(1, num_provers + 1):
        p = round_dir / f"prover-{i:02d}.out.json"
        if p.exists():
            try:
                data = json.loads(p.read_text(encoding="utf-8"))
                reports.append({"prover_id": f"{i:02d}", **data})
            except Exception:
                pass
    notes_md, outputs_tex = _read_notes_and_outputs(problem_dir)

    system_prompt = load_prompt("verifier")
    user_message = """You receive multiple prover reports. Evaluate correctness, value, and pick promising directions. Update notes.md (append/replace) with useful ideas and update output.md (append/replace) ONLY with rigorously verified results.

Prover reports (JSON):
""" + json.dumps(reports) + "\n\nCurrent notes.md:\n" + notes_md + "\n\nCurrent output.md (if any):\n" + (outputs_tex or "")

    schema = {
        "name": "VerifierNewSchema",
        "schema": _normalize_schema_strict(VerifierNewSchema.model_json_schema()),
        "strict": True
    }

    text, dump = _complete_text(
        MODEL_VERIFIER, system_prompt, user_message,
        max_tokens=100000, temperature=0.2,
        force_json=True,
        json_schema_obj=schema if MODEL_VERIFIER.startswith("gpt-5") else None
    )
    _dump_io(round_dir, "verifier", system_prompt, user_message, dump, text)

    try:
        data = json.loads(text) if not _is_o_model(MODEL_VERIFIER) or MODEL_VERIFIER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError as e:
        console.print(f"[red]Verifier JSON decode error: {e}[/red]")
        (round_dir / "verifier.nonjson.txt").write_text(text, encoding="utf-8")
        data = {
            "feedback_md": f"(JSON fallback)\n\n{text}",
            "summary_md": "Verifier JSON parsing failed",
            "verdict": "uncertain",
            "blocking_issues": ["JSON parsing error"],
            "per_prover": []
        }

    data = cast(Dict[str, Any], data)
    vnew = VerifierNewSchema(**data)
    # Apply notes
    notes_update = NotesUpdate(
        mode="append" if (vnew.new_notes_append.strip().lower() == "true") else "replace",
        content_md=vnew.new_notes_md or ""
    )
    _apply_notes_update(problem_dir, notes_update)
    # Apply outputs
    outputs_mode = "append" if (vnew.new_outputs_append.strip().lower() == "true") else "replace"
    if vnew.new_outputs_md:
        out_path = problem_dir / "output.md"
        existing = out_path.read_text(encoding="utf-8") if out_path.exists() else ""
        if outputs_mode == "replace":
            out_path.write_text(vnew.new_outputs_md, encoding="utf-8")
        else:
            sep = "\n" if existing and not existing.endswith("\n") else ""
            out_path.write_text(existing + sep + vnew.new_outputs_md, encoding="utf-8")
    # Persist feedback/summary in files for UI
    (round_dir / "verifier.feedback.md").write_text(vnew.feedback_md, encoding="utf-8")
    (round_dir / "verifier.summary.md").write_text(vnew.feedback_md.split("\n\n")[0][:1000], encoding="utf-8")
    (round_dir / "verifier.out.json").write_text(json.dumps(vnew.model_dump(), indent=2), encoding="utf-8")
    # Build object for downstream
    return VerifierCombinedOutput(
        feedback_md=vnew.feedback_md,
        summary_md=vnew.feedback_md.split("\n\n")[0][:1000],
        verdict=vnew.verdict,
        blocking_issues=[],
        per_prover=[],
        notes_update=None,
        output_update=None
    )

def call_writer(*args, **kwargs):
    raise RuntimeError("Writer is disabled. Verifier updates output.md directly.")

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
        max_tokens=100000, temperature=PROVER_TEMPERATURE,
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
        data = { "progress_md": shown_text }

    # No shaping; pass through markdown

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
        data_any = json.loads(text) if not _is_o_model(MODEL_VERIFIER) or MODEL_VERIFIER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError as e:
        console.print(f"[red]Verifier JSON decode error: {e}[/red]")
        console.print(f"[dim]Raw response: {text[:500]}[/dim]")
        # Save raw non-JSON for debugging
        (round_dir / "verifier.nonjson.txt").write_text(text, encoding="utf-8")
        # Fallback
        data_any = {
            "feedback_md": f"(JSON fallback)\n\n{text}",
            "summary_md": "Verifier JSON parsing failed",
            "verdict": "uncertain",
            "blocking_issues": ["JSON parsing error"]
        }
    data = cast(Dict[str, Any], data_any)

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
    # Load artifacts: all prover-* reports, combined verifier, and writer (if present)
    prover_blocks: list[str] = []
    for pfile in sorted(round_dir.glob("prover-*.out.json")):
        try:
            pdata = json.loads(pfile.read_text(encoding="utf-8"))
            prover_blocks.append(f"=== {pfile.name} (progress_md) ===\n{pdata.get('progress_md','')}\n")
        except Exception:
            continue

    verifier_json = json.loads((round_dir / "verifier.out.json").read_text(encoding="utf-8"))

    context = (
        ("\n".join(prover_blocks) if prover_blocks else "")
        + f"\n=== Verifier (summary_md) ===\n{verifier_json.get('summary_md','')}\n"
        + f"=== Verifier (verdict) ===\n{verifier_json.get('verdict','')}\n"
        
    )

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
        data_any = json.loads(text) if not _is_o_model(MODEL_SUMMARIZER) or MODEL_SUMMARIZER.startswith("gpt-5") \
               else extract_json_from_response(text)
    except json.JSONDecodeError as e:
        console.print(f"[red]Summarizer JSON decode error: {e}")
        (round_dir / "summarizer.nonjson.txt").write_text(text, encoding="utf-8")
        # Fallback
        data_any = {
            "summary_md": f"Summarizer JSON fallback\n\n{text}",
            "highlights": [],
            "next_questions": []
        }

    data = cast(Dict[str, Any], data_any)
    data.setdefault("highlights", [])
    data.setdefault("next_questions", [])
    return SummarizerOutput(**data)

def call_paper_suggester(problem_dir: Path, round_idx: int) -> PaperSuggesterOutput:
    console.print(f"[bold cyan]Calling Paper Suggester (Round {round_idx})...[/bold cyan]")
    _write_status(problem_dir, phase="paper_suggester", round_idx=round_idx)

    # Build context: task, notes, output, current paper sources, parsed papers/, and last compile log (if any)
    context = read_problem_context(problem_dir, include_pdfs=True)
    # Prepare current round dir up-front for diff artifacts
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    notes_md, outputs_md = _read_notes_and_outputs(problem_dir)
    if notes_md:
        context += f"\n=== notes.md ===\n{notes_md}\n"
    if outputs_md:
        context += f"\n=== output.md ===\n{outputs_md}\n"
    # Include persistent user feedback for paper-writing (if any)
    paper_feedback_path = problem_dir / "paper_feedback.md"
    if paper_feedback_path.exists():
        try:
            fb = paper_feedback_path.read_text(encoding="utf-8")
            context += f"\n=== paper_feedback.md (user guidance) ===\n{fb}\n"
        except Exception:
            pass
    # Include current LaTeX/Markdown drafts
    # Primary writing target is final_output.tex in problem root
    final_tex = problem_dir / "final_output.tex"
    if final_tex.exists():
        try:
            context += f"\n=== final_output.tex ===\n" + final_tex.read_text(encoding="utf-8") + "\n"
        except Exception:
            pass
    # Also include any drafts in papers/
    papers_dir = problem_dir / "papers"
    if papers_dir.exists():
        for src in sorted(papers_dir.glob("*")):
            if src.suffix.lower() in {".tex", ".md"}:
                try:
                    context += f"\n=== papers/{src.name} ===\n" + src.read_text(encoding="utf-8") + "\n"
                except Exception:
                    pass
    # Include last compile log if exists
    runs_dir = problem_dir / "runs"
    if runs_dir.exists():
        round_dirs = sorted([d for d in runs_dir.iterdir() if d.is_dir()])
        if round_dirs:
            last = round_dirs[-1]
            for log in ["final_output.compile.log", "final_output.compile2.log", "final_output.compile3.log"]:
                lp = last / log
                if lp.exists():
                    try:
                        context += f"\n=== {last.name}/{log} ===\n" + lp.read_text(encoding="utf-8") + "\n"
                    except Exception:
                        pass

    # Include diff between the latest two round tex files (if available)
    if round_idx > 1 and runs_dir.exists():
        try:
            prev_dir = runs_dir / f"round-{round_idx-1:04d}"
            prev2_dir = runs_dir / f"round-{round_idx-2:04d}"
            prev_tex = (prev_dir / "final_output.tex").read_text(encoding="utf-8") if (prev_dir / "final_output.tex").exists() else None
            prev2_tex = (prev2_dir / "final_output.tex").read_text(encoding="utf-8") if (prev2_dir / "final_output.tex").exists() else None
            if prev_tex is not None and prev2_tex is not None:
                diff_lines = difflib.unified_diff(
                    prev2_tex.splitlines(), prev_tex.splitlines(),
                    fromfile=f"final_output.tex (round-{round_idx-2:04d})",
                    tofile=f"final_output.tex (round-{round_idx-1:04d})",
                    lineterm=""
                )
                diff_text = "\n".join(diff_lines)
                context += f"\n=== diff final_output.tex (round-{round_idx-2:04d} → round-{round_idx-1:04d}) ===\n{diff_text}\n"
                # Persist diff artifact for this round for UI/debugging
                (round_dir / "final_output.prev_diff.txt").write_text(diff_text or "(no changes)", encoding="utf-8")
        except Exception as e:
            try:
                (round_dir / "final_output.prev_diff.txt").write_text(f"[diff error] {e}", encoding="utf-8")
            except Exception:
                pass

    system_prompt = load_prompt("paper_suggester")
    user_message = context

    schema = {
        "name": "PaperSuggesterOutput",
        "schema": _normalize_schema_strict(PaperSuggesterOutput.model_json_schema()),
        "strict": True,
    }

    text, dump = _complete_text(
        MODEL_PAPER_SUGGESTER, system_prompt, user_message,
        max_tokens=100000, temperature=0.2,
        force_json=True,
        json_schema_obj=schema if MODEL_PAPER_SUGGESTER.startswith("gpt-5") else None,
    )

    _dump_io(round_dir, "paper_suggester", system_prompt, user_message, dump, text)

    try:
        data_any = json.loads(text) if not _is_o_model(MODEL_PAPER_SUGGESTER) or MODEL_PAPER_SUGGESTER.startswith("gpt-5") else extract_json_from_response(text)
    except json.JSONDecodeError:
        (round_dir / "paper_suggester.nonjson.txt").write_text(text or "", encoding="utf-8")
        data_any = {"advice_md": (text or "(the model did not return anything)"), "priority_items": [], "risk_notes": ""}

    data = cast(Dict[str, Any], data_any)
    # Soft defaults
    data.setdefault("priority_items", [])
    data.setdefault("risk_notes", "")
    out = PaperSuggesterOutput(**data)
    (round_dir / "paper_suggester.out.json").write_text(json.dumps(out.model_dump(), indent=2), encoding="utf-8")
    # Also persist advice for human viewing
    (round_dir / "paper_suggester.advice.md").write_text(out.advice_md, encoding="utf-8")
    return out

def call_paper_fixer(problem_dir: Path, round_idx: int, suggester: PaperSuggesterOutput | None) -> tuple[PaperFixerOutput, bool, str]:
    console.print(f"[bold cyan]Calling Paper Fixer (Round {round_idx})...[/bold cyan]")
    _write_status(problem_dir, phase="paper_fixer", round_idx=round_idx)

    # Context similar to suggester, plus suggester's output and last compile result; include parsed papers/
    context = read_problem_context(problem_dir, include_pdfs=True)
    notes_md, outputs_md = _read_notes_and_outputs(problem_dir)
    if notes_md:
        context += f"\n=== notes.md ===\n{notes_md}\n"
    if outputs_md:
        context += f"\n=== output.md ===\n{outputs_md}\n"
    # Include persistent user feedback for paper-writing (if any)
    paper_feedback_path = problem_dir / "paper_feedback.md"
    if paper_feedback_path.exists():
        try:
            fb = paper_feedback_path.read_text(encoding="utf-8")
            context += f"\n=== paper_feedback.md (user guidance) ===\n{fb}\n"
        except Exception:
            pass
    # Include current LaTeX/Markdown draft (final_output first)
    final_tex = problem_dir / "final_output.tex"
    if final_tex.exists():
        try:
            context += f"\n=== final_output.tex ===\n" + final_tex.read_text(encoding="utf-8") + "\n"
        except Exception:
            pass
    papers_dir = problem_dir / "papers"
    if papers_dir.exists():
        for src in sorted(papers_dir.glob("*")):
            if src.suffix.lower() in {".tex", ".md"}:
                try:
                    context += f"\n=== papers/{src.name} ===\n" + src.read_text(encoding="utf-8") + "\n"
                except Exception:
                    pass
    # Include suggester advice
    if suggester:
        context += "\n=== suggester.advice ===\n" + suggester.advice_md + "\n"
        if suggester.priority_items:
            context += "\n=== suggester.priority_items ===\n- " + "\n- ".join(suggester.priority_items) + "\n"
        if suggester.risk_notes:
            context += "\n=== suggester.risk_notes ===\n" + suggester.risk_notes + "\n"

    system_prompt = load_prompt("paper_fixer")
    user_message = context

    schema = {
        "name": "PaperFixerOutput",
        "schema": _normalize_schema_strict(PaperFixerOutput.model_json_schema()),
        "strict": True,
    }

    text, dump = _complete_text(
        MODEL_PAPER_FIXER, system_prompt, user_message,
        max_tokens=100000, temperature=0.2,
        force_json=True,
        json_schema_obj=schema if MODEL_PAPER_FIXER.startswith("gpt-5") else None,
    )

    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)
    _dump_io(round_dir, "paper_fixer", system_prompt, user_message, dump, text)

    try:
        data_any = json.loads(text) if not _is_o_model(MODEL_PAPER_FIXER) or MODEL_PAPER_FIXER.startswith("gpt-5") else extract_json_from_response(text)
    except json.JSONDecodeError:
        (round_dir / "paper_fixer.nonjson.txt").write_text(text or "", encoding="utf-8")
        data_any = {
            "status": "failed",
            "new_tex": text or "",
            "changes_summary_md": "Non-JSON response from fixer.",
            "unfixable_issues_md": "",
            "compiler_expectations_md": "",
        }

    data = cast(Dict[str, Any], data_any)
    # Fill missing fields conservatively
    data.setdefault("status", "failed")
    data.setdefault("new_tex", "")
    data.setdefault("changes_summary_md", "")
    data.setdefault("unfixable_issues_md", "")
    data.setdefault("compiler_expectations_md", "")
    out = PaperFixerOutput(**data)
    (round_dir / "paper_fixer.out.json").write_text(json.dumps(out.model_dump(), indent=2), encoding="utf-8")
    (round_dir / "paper_fixer.summary.md").write_text(out.changes_summary_md or "", encoding="utf-8")
    (round_dir / "paper_fixer.unfixable.md").write_text(out.unfixable_issues_md or "", encoding="utf-8")

    # Persist the LaTeX for this round for diffing in next round
    try:
        (round_dir / "final_output.tex").write_text(out.new_tex or "", encoding="utf-8")
    except Exception:
        pass

    # Compile the returned LaTeX
    _write_status(problem_dir, phase="paper_compile", round_idx=round_idx)
    ok, log, pdf_path = _compile_tex_string(problem_dir, round_idx, out.new_tex, basename="final_output")
    # Record compile outcome
    (round_dir / "paper.compile.result.json").write_text(json.dumps({"ok": ok}, indent=2), encoding="utf-8")
    return out, ok, log

def run_round(problem_dir: Path, round_idx: int, num_provers: int = 1):
    """Execute one round of the multi-prover → verifier → optional-writer → summarizer loop."""
    console.print(f"\n[bold green]Starting Round {round_idx}[/bold green]")

    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)

    # Context files recorded for this round (for UI)
    ctx_files = _gather_context_files(problem_dir, round_idx)
    (round_dir / "context.files.json").write_text(json.dumps(ctx_files, indent=2), encoding="utf-8")

    timings = {}

    # ----- Step 1: Provers (parallel-ish; sequential for now) -----
    _write_status(problem_dir, phase="prover", round_idx=round_idx)
    t0 = time.perf_counter()
    prover_outputs: list[ProverOutput] = []
    # Run provers in parallel threads (IO-bound HTTP calls)
    with ThreadPoolExecutor(max_workers=num_provers) as ex:
        futures = {ex.submit(call_prover_one, problem_dir, round_idx, i, num_provers): i for i in range(1, num_provers + 1)}
        for fut in as_completed(futures):
            out = fut.result()
            prover_outputs.append(out)
            # Append each prover's markdown to progress.md (for human trace)
            round_tag = f"## Round {round_idx:04d} — {datetime.now().isoformat()}Z"
            progress_content = out.progress_md.strip()
            if not progress_content.startswith("##"):
                progress_content = round_tag + "\n\n" + progress_content
            appended_progress = progress_content + "\n\n"
            (round_dir / "progress.appended.md").write_text(appended_progress, encoding="utf-8")
            progress_file = problem_dir / "progress.md"
            existing = progress_file.read_text(encoding="utf-8") if progress_file.exists() else ""
            sep = "\n" if existing and not existing.endswith("\n") else ""
            progress_file.write_text(existing + sep + appended_progress, encoding="utf-8")
            # Prover no longer creates files; only Verifier/Writer may write
    t1 = time.perf_counter()
    timings["provers"] = {"model": MODEL_PROVER, "count": num_provers, "duration_s": round(t1 - t0, 3)}

    # ----- Step 2: Verifier (combined) -----
    _write_status(problem_dir, phase="verifier", round_idx=round_idx, extra=timings)
    t0 = time.perf_counter()
    v_out = call_verifier_combined(problem_dir, round_idx, num_provers)
    t1 = time.perf_counter()
    timings["verifier"] = {"model": MODEL_VERIFIER, "duration_s": round(t1 - t0, 3)}

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
    _auto_commit_round(problem_dir, round_idx, v_out.verdict)

    # Console summary
    console.print(f"\n[bold]Round {round_idx} Complete[/bold]")
    console.print(f"[yellow]Verdict: {v_out.verdict}[/yellow]")
    if v_out.blocking_issues:
        console.print("[red]Blocking Issues:[/red]")
        for issue in v_out.blocking_issues:
            console.print(f"  • {issue}")
    console.print("\n[bold]Summary for Human:[/bold]")
    console.print(v_out.summary_md)

def run_paper_round(problem_dir: Path, round_idx: int):
    """Execute one paper-writing round: suggester -> fixer -> compile -> artifacts."""
    console.print(f"\n[bold green]Starting Paper Round {round_idx}[/bold green]")
    round_dir = problem_dir / "runs" / f"round-{round_idx:04d}"
    round_dir.mkdir(parents=True, exist_ok=True)

    # Record context files for UI
    ctx_files = _gather_context_files(problem_dir, round_idx)
    (round_dir / "context.files.json").write_text(json.dumps(ctx_files, indent=2), encoding="utf-8")

    timings: dict[str, Any] = {}

    # Suggester
    t0 = time.perf_counter()
    sugg = call_paper_suggester(problem_dir, round_idx)
    t1 = time.perf_counter()
    timings["paper_suggester"] = {"model": MODEL_PAPER_SUGGESTER, "duration_s": round(t1 - t0, 3)}

    # Fixer
    t0 = time.perf_counter()
    fixer_out, compiled, compile_log = call_paper_fixer(problem_dir, round_idx, sugg)
    t1 = time.perf_counter()
    timings["paper_fixer"] = {"model": MODEL_PAPER_FIXER, "duration_s": round(t1 - t0, 3), "compiled": compiled}

    # Persist timings and mark idle
    (round_dir / "timings.json").write_text(json.dumps(timings, indent=2), encoding="utf-8")
    _write_status(problem_dir, phase="idle", round_idx=round_idx, extra={"last_round": round_idx, **timings})

    # Console summary
    console.print(f"\n[bold]Paper Round {round_idx} Complete[/bold]")
    console.print(f"Status: {fixer_out.status} • Compiled: {'yes' if compiled else 'no'}")
    if fixer_out.unfixable_issues_md.strip():
        console.print("[yellow]Unfixable issues reported by fixer:[/yellow]")
        console.print(fixer_out.unfixable_issues_md)

def main():
    parser = argparse.ArgumentParser(description="Automatic Researcher Orchestrator")
    parser.add_argument("problem_dir", type=str, help="Problem directory")
    parser.add_argument("--rounds", type=int, default=1, help="Number of rounds")
    parser.add_argument("--start-round", type=int, default=1, help="Starting round")
    parser.add_argument("--mode", type=str, default="research", choices=["research", "paper"], help="Run research loop or paper-writing loop")
    # Allow override via AR_NUM_PROVERS env (used by web_app)
    default_provers = int(os.environ.get("AR_NUM_PROVERS", "2")) if os.environ.get("AR_NUM_PROVERS") else 2
    parser.add_argument("--provers", type=int, default=default_provers, help="Number of parallel provers (1-10)")
    
    args = parser.parse_args()
    
    problem_dir = Path(args.problem_dir).resolve()
    if not problem_dir.exists():
        console.print(f"[red]Error: Directory not found: {problem_dir}[/red]")
        sys.exit(1)
    
    # Check for task file or paper.* in papers/ directory (required for research mode)
    task_files = ["task.tex", "task.txt", "task.md"]
    has_task = any((problem_dir / f).exists() for f in task_files)
    
    # If no task file, check for paper.* in papers/
    if not has_task:
        papers_dir = problem_dir / "papers"
        if papers_dir.exists():
            for ext in ['.pdf', '.html', '.htm', '.txt', '.md']:
                if (papers_dir / f"paper{ext}").exists():
                    has_task = True
                    console.print(f"[yellow]No task file found, using papers/paper{ext} as the task[/yellow]")
                    break
    
    if args.mode != "paper" and not has_task:
        console.print(f"[red]Error: No task file or papers/paper.* file found[/red]")
        sys.exit(1)
    
    # Check API key
    if not os.environ.get("OPENAI_API_KEY"):
        console.print("[red]Error: OPENAI_API_KEY not set[/red]")
        sys.exit(1)
    
    console.print(f"[bold]Automatic Researcher Orchestrator[/bold]")
    console.print(f"Problem: {problem_dir}")
    if args.mode == "paper":
        console.print(f"Paper models: suggester={MODEL_PAPER_SUGGESTER} fixer={MODEL_PAPER_FIXER}")
    else:
        console.print(f"Models: {MODEL_PROVER} / {MODEL_VERIFIER}")
    console.print(f"OpenAI SDK: {_openai.__version__}")
    
    # Run rounds
    provers = max(1, min(10, args.provers))
    current_round = args.start_round
    end_round = args.start_round + args.rounds
    
    while current_round < end_round:
        try:
            if args.mode == "paper":
                run_paper_round(problem_dir, current_round)
            else:
                run_round(problem_dir, current_round, num_provers=provers)
            current_round += 1
        except KeyboardInterrupt:
            console.print("\n[yellow]Interrupted[/yellow]")
            break
        except Exception as e:
            console.print(f"\n[red]Error in round {current_round}: {e}[/red]")
            break
    
    # Check for queued rounds after completing main rounds
    while True:
        try:
            queue_file = problem_dir / "runs" / "queued_rounds.json"
            if queue_file.exists() and args.mode != "paper":
                queue_data = json.loads(queue_file.read_text(encoding="utf-8"))
                queued_rounds = queue_data.get("queued_rounds", 0)
                
                if queued_rounds > 0:
                    console.print(f"[green]Found {queued_rounds} queued rounds, continuing...[/green]")
                    
                    # Run the queued rounds
                    for _ in range(queued_rounds):
                        try:
                            run_round(problem_dir, current_round, num_provers=provers)
                            current_round += 1
                        except KeyboardInterrupt:
                            console.print("\n[yellow]Interrupted[/yellow]")
                            return
                        except Exception as e:
                            console.print(f"\n[red]Error in round {current_round}: {e}[/red]")
                            return
                    
                    # Clear the queue file after processing
                    try:
                        queue_file.unlink()
                    except:
                        pass
                    
                    # Continue checking for more queued rounds
                    continue
            
            # No more queued rounds, exit
            break
            
        except Exception as e:
            console.print(f"[yellow]Warning: Error checking queue: {e}[/yellow]")
            break

if __name__ == "__main__":
    main()