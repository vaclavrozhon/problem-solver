"""
Paper processing functions for the orchestrator system.

This module handles PDF extraction, HTML parsing, and paper content management.
"""

import os
from pathlib import Path
from typing import Optional


def extract_pdf_text(pdf_path: Path) -> str:
    """Extract text content from a PDF file."""
    try:
        import pymupdf
        doc = pymupdf.open(str(pdf_path))
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except ImportError:
        print("Warning: PyMuPDF not installed. PDF extraction unavailable.")
        return ""
    except Exception as e:
        print(f"Error extracting PDF {pdf_path}: {e}")
        return ""


def extract_html_text(html_path: Path) -> str:
    """Extract text content from an HTML file."""
    try:
        from bs4 import BeautifulSoup
        html_content = html_path.read_text(encoding="utf-8")
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text and clean it up
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    except ImportError:
        print("Warning: BeautifulSoup not installed. HTML extraction unavailable.")
        return html_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Error extracting HTML {html_path}: {e}")
        return ""


def ensure_papers_parsed(problem_dir: Path) -> None:
    """Parse all papers in the papers/ directory if not already parsed."""
    papers_dir = problem_dir / "papers"
    parsed_dir = problem_dir / "papers_parsed"
    
    if not papers_dir.exists():
        return
    
    parsed_dir.mkdir(exist_ok=True)
    
    for paper_file in papers_dir.iterdir():
        if paper_file.is_file():
            parsed_file = parsed_dir / f"{paper_file.stem}.txt"
            
            # Skip if already parsed and up to date
            if parsed_file.exists() and parsed_file.stat().st_mtime >= paper_file.stat().st_mtime:
                continue
            
            # Parse based on file type
            if paper_file.suffix.lower() == '.pdf':
                text = extract_pdf_text(paper_file)
            elif paper_file.suffix.lower() in ['.html', '.htm']:
                text = extract_html_text(paper_file)
            elif paper_file.suffix.lower() in ['.txt', '.md']:
                text = paper_file.read_text(encoding="utf-8")
            else:
                continue
            
            # Save parsed text
            if text:
                parsed_file.write_text(text, encoding="utf-8")
                print(f"  Parsed: {paper_file.name} -> {parsed_file.name}")


def get_parsed_papers_content(problem_dir: Path) -> str:
    """Get concatenated content of all parsed papers."""
    parsed_dir = problem_dir / "papers_parsed"
    papers_dir = problem_dir / "papers"
    
    if not parsed_dir.exists():
        return ""
    
    content = []
    for parsed_file in sorted(parsed_dir.glob("*.txt")):
        content.append(f"\n\n=== Paper: {parsed_file.stem} ===\n")
        
        # Look for description file in papers directory
        desc_file = papers_dir / f"{parsed_file.stem}.description.txt"
        if desc_file.exists():
            description = desc_file.read_text(encoding="utf-8").strip()
            if description:
                content.append(f"DESCRIPTION: {description}\n\n")
        
        text = parsed_file.read_text(encoding="utf-8")
        # Truncate very long papers
        if len(text) > 50000:
            text = text[:50000] + "\n\n[... truncated ...]"
        content.append(text)
    
    return "".join(content)


def read_problem_context(problem_dir: Path, include_pdfs: bool = True) -> str:
    """Read the complete problem context including task and papers."""
    context_parts = []
    
    # Read task file
    for ext in ['md', 'txt', 'tex']:
        task_file = problem_dir / f"task.{ext}"
        if task_file.exists():
            context_parts.append(f"=== Task ({ext}) ===\n")
            context_parts.append(task_file.read_text(encoding="utf-8"))
            break
    
    # Include parsed papers if requested
    if include_pdfs:
        ensure_papers_parsed(problem_dir)
        papers_content = get_parsed_papers_content(problem_dir)
        if papers_content:
            context_parts.append("\n\n=== Reference Papers ===")
            context_parts.append(papers_content)
    
    # Include notes if exists
    notes_file = problem_dir / "notes.md"
    if notes_file.exists():
        context_parts.append("\n\n=== Notes ===\n")
        context_parts.append(notes_file.read_text(encoding="utf-8"))
    
    # Include output if exists
    output_file = problem_dir / "output.md"
    if output_file.exists():
        context_parts.append("\n\n=== Current Output ===\n")
        context_parts.append(output_file.read_text(encoding="utf-8"))
    
    return "\n".join(context_parts)