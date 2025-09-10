"""
Task management service for creating and managing problems and drafts.
"""

from pathlib import Path
from typing import List
import urllib.request
import urllib.parse
import os
from fastapi import HTTPException, UploadFile

from ..config import REPO_PROBLEMS_ROOT, REPO_DRAFTS_ROOT


class TaskService:
    """Service for managing research tasks (problems and drafts)"""
    
    @staticmethod
    def create_problem(name: str, task_description: str, task_type: str = "txt") -> str:
        """Create a new problem/solving task"""
        # Sanitize task name
        task_name = name.strip().replace(" ", "-").replace("/", "-")
        task_path = REPO_PROBLEMS_ROOT / task_name
        
        if task_path.exists():
            raise HTTPException(400, f"Problem '{task_name}' already exists")
        
        # Create problem directory structure
        task_path.mkdir(parents=True)
        (task_path / "papers").mkdir()
        (task_path / "papers_parsed").mkdir()
        (task_path / "runs").mkdir()
        
        # Create task file with appropriate extension
        task_file = task_path / f"task.{task_type}"
        task_file.write_text(task_description)
        
        # Initialize 3-tier file system
        (task_path / "notes.md").write_text("# Research Notes\n\n")
        (task_path / "proofs.md").write_text("# Rigorous Proofs\n\n")
        (task_path / "output.md").write_text("# Main Results\n\n")
        
        return task_name

    @staticmethod 
    def create_draft(name: str, task_description: str) -> str:
        """Create a new draft/writing task"""
        # Sanitize task name
        task_name = name.strip().replace(" ", "-").replace("/", "-")
        task_path = REPO_DRAFTS_ROOT / task_name
        
        if task_path.exists():
            raise HTTPException(400, f"Draft '{task_name}' already exists")
        
        # Create draft directory structure
        task_path.mkdir(parents=True)
        (task_path / "papers").mkdir()
        (task_path / "papers_parsed").mkdir()
        (task_path / "runs").mkdir()
        (task_path / "drafts").mkdir()
        
        # Create initial LaTeX file with task description as comment
        tex_content = f"""% {task_description}

\\documentclass{{article}}
\\usepackage{{amsmath}}
\\usepackage{{amsfonts}}
\\usepackage{{amssymb}}
\\usepackage{{amsthm}}
\\usepackage{{geometry}}
\\geometry{{margin=1in}}

\\title{{{name}}}
\\author{{Automatic Researcher}}
\\date{{\\today}}

\\begin{{document}}

\\maketitle

% Task description: {task_description}

\\section{{Introduction}}

TODO: Write introduction

\\end{{document}}"""
        
        (task_path / "final_output.tex").write_text(tex_content)
        
        return task_name

    @staticmethod
    def delete_problem(name: str) -> bool:
        """Delete a problem and all its associated data"""
        import shutil
        
        problem_path = REPO_PROBLEMS_ROOT / name
        if not problem_path.exists():
            raise HTTPException(404, "Problem not found")
        
        try:
            # Remove entire problem directory
            shutil.rmtree(problem_path)
            return True
        except Exception as e:
            raise HTTPException(500, f"Failed to delete problem: {str(e)}")

    @staticmethod
    def reset_problem(name: str) -> bool:
        """Reset a problem - keep task description and papers, delete runs and interactions"""
        import shutil
        
        problem_path = REPO_PROBLEMS_ROOT / name
        if not problem_path.exists():
            raise HTTPException(404, "Problem not found")
        
        try:
            # Remove runs directory (all prover/verifier interactions)
            runs_dir = problem_path / "runs"
            if runs_dir.exists():
                shutil.rmtree(runs_dir)
                runs_dir.mkdir()  # Recreate empty runs directory
            
            # Reset files to initial state
            (problem_path / "notes.md").write_text("# Research Notes\n\n")
            (problem_path / "proofs.md").write_text("# Rigorous Proofs\n\n")
            (problem_path / "output.md").write_text("# Main Results\n\n")
            
            # Remove progress.md if it exists (legacy file)
            progress_file = problem_path / "progress.md"
            if progress_file.exists():
                progress_file.unlink()
            
            # Preserve task description files and papers
            # task.txt, papers/, papers_parsed/ remain unchanged
            
            return True
        except Exception as e:
            raise HTTPException(500, f"Failed to reset problem: {str(e)}")

    @staticmethod 
    def delete_draft(name: str) -> bool:
        """Delete a draft and all its associated data"""
        import shutil
        
        draft_path = REPO_DRAFTS_ROOT / name
        if not draft_path.exists():
            raise HTTPException(404, "Draft not found")
        
        try:
            # Remove entire draft directory
            shutil.rmtree(draft_path)
            return True
        except Exception as e:
            raise HTTPException(500, f"Failed to delete draft: {str(e)}")


class PaperService:
    """Service for managing research papers associated with tasks"""
    
    @staticmethod
    async def upload_problem_paper(problem: str, file: UploadFile, description: str = "") -> str:
        """Upload a paper PDF to a problem"""
        problem_path = REPO_PROBLEMS_ROOT / problem
        if not problem_path.exists():
            raise HTTPException(404, "Problem not found")
        
        papers_dir = problem_path / "papers"
        
        # Generate sequential paper name
        paper_count = len(list(papers_dir.glob("paper*.pdf"))) + len(list(papers_dir.glob("paper*.txt"))) + len(list(papers_dir.glob("paper*.md"))) + 1
        file_extension = Path(file.filename).suffix or '.pdf'
        new_filename = f"paper{paper_count}{file_extension}"
        
        # Save uploaded file
        file_path = papers_dir / new_filename
        content = await file.read()
        file_path.write_bytes(content)
        
        # Save description if provided
        if description.strip():
            desc_file = papers_dir / f"{Path(new_filename).stem}.description.txt"
            desc_file.write_text(description, encoding="utf-8")
        
        return new_filename

    @staticmethod
    async def upload_draft_paper(draft: str, file: UploadFile, description: str = "") -> str:
        """Upload a paper PDF to a draft"""
        draft_path = REPO_DRAFTS_ROOT / draft
        if not draft_path.exists():
            raise HTTPException(404, "Draft not found")
        
        papers_dir = draft_path / "papers"
        
        # Generate sequential paper name
        paper_count = len(list(papers_dir.glob("paper*.pdf"))) + len(list(papers_dir.glob("paper*.txt"))) + len(list(papers_dir.glob("paper*.md"))) + 1
        file_extension = Path(file.filename).suffix or '.pdf'
        new_filename = f"paper{paper_count}{file_extension}"
        
        # Save uploaded file
        file_path = papers_dir / new_filename
        content = await file.read()
        file_path.write_bytes(content)
        
        # Save description if provided
        if description.strip():
            desc_file = papers_dir / f"{Path(new_filename).stem}.description.txt"
            desc_file.write_text(description, encoding="utf-8")
        
        return new_filename

    @staticmethod
    def add_problem_paper_from_url(problem: str, url: str) -> str:
        """Download and add a paper from URL to a problem"""
        problem_path = REPO_PROBLEMS_ROOT / problem
        if not problem_path.exists():
            raise HTTPException(404, "Problem not found")
        
        papers_dir = problem_path / "papers"
        
        # Generate sequential paper name
        paper_count = len(list(papers_dir.glob("paper*.pdf"))) + len(list(papers_dir.glob("paper*.txt"))) + len(list(papers_dir.glob("paper*.md"))) + 1
        file_extension = '.pdf' if not os.path.basename(urllib.parse.urlparse(url).path) or not Path(os.path.basename(urllib.parse.urlparse(url).path)).suffix else Path(os.path.basename(urllib.parse.urlparse(url).path)).suffix
        new_filename = f"paper{paper_count}{file_extension}"
        
        file_path = papers_dir / new_filename
        
        try:
            urllib.request.urlretrieve(url, str(file_path))
        except Exception as e:
            raise HTTPException(400, f"Failed to download paper: {str(e)}")
        
        return new_filename

    @staticmethod  
    def add_draft_paper_from_url(draft: str, url: str) -> str:
        """Download and add a paper from URL to a draft"""
        draft_path = REPO_DRAFTS_ROOT / draft
        if not draft_path.exists():
            raise HTTPException(404, "Draft not found")
        
        papers_dir = draft_path / "papers"
        
        # Generate sequential paper name
        paper_count = len(list(papers_dir.glob("paper*.pdf"))) + len(list(papers_dir.glob("paper*.txt"))) + len(list(papers_dir.glob("paper*.md"))) + 1
        file_extension = '.pdf' if not os.path.basename(urllib.parse.urlparse(url).path) or not Path(os.path.basename(urllib.parse.urlparse(url).path)).suffix else Path(os.path.basename(urllib.parse.urlparse(url).path)).suffix
        new_filename = f"paper{paper_count}{file_extension}"
        
        file_path = papers_dir / new_filename
        
        try:
            urllib.request.urlretrieve(url, str(file_path))
        except Exception as e:
            raise HTTPException(400, f"Failed to download paper: {str(e)}")
        
        return new_filename