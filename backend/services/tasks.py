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
        
        # Initialize other files
        (task_path / "progress.md").write_text("# Progress\n\nTask created.\n")
        (task_path / "notes.md").write_text("# Notes\n\n")
        (task_path / "summary.md").write_text("# Summary\n\nNo runs yet.\n")
        
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
    async def upload_problem_paper(problem: str, file: UploadFile) -> str:
        """Upload a paper PDF to a problem"""
        problem_path = REPO_PROBLEMS_ROOT / problem
        if not problem_path.exists():
            raise HTTPException(404, "Problem not found")
        
        papers_dir = problem_path / "papers"
        
        # Save uploaded file
        file_path = papers_dir / file.filename
        content = await file.read()
        file_path.write_bytes(content)
        
        return file.filename

    @staticmethod
    async def upload_draft_paper(draft: str, file: UploadFile) -> str:
        """Upload a paper PDF to a draft"""
        draft_path = REPO_DRAFTS_ROOT / draft
        if not draft_path.exists():
            raise HTTPException(404, "Draft not found")
        
        papers_dir = draft_path / "papers"
        
        # Save uploaded file
        file_path = papers_dir / file.filename
        content = await file.read()
        file_path.write_bytes(content)
        
        return file.filename

    @staticmethod
    def add_problem_paper_from_url(problem: str, url: str) -> str:
        """Download and add a paper from URL to a problem"""
        problem_path = REPO_PROBLEMS_ROOT / problem
        if not problem_path.exists():
            raise HTTPException(404, "Problem not found")
        
        papers_dir = problem_path / "papers"
        
        # Generate filename from URL
        parsed_url = urllib.parse.urlparse(url)
        filename = os.path.basename(parsed_url.path) or "paper.pdf"
        if not filename.endswith('.pdf'):
            filename += '.pdf'
        
        file_path = papers_dir / filename
        
        try:
            urllib.request.urlretrieve(url, str(file_path))
        except Exception as e:
            raise HTTPException(400, f"Failed to download paper: {str(e)}")
        
        return filename

    @staticmethod  
    def add_draft_paper_from_url(draft: str, url: str) -> str:
        """Download and add a paper from URL to a draft"""
        draft_path = REPO_DRAFTS_ROOT / draft
        if not draft_path.exists():
            raise HTTPException(404, "Draft not found")
        
        papers_dir = draft_path / "papers"
        
        # Generate filename from URL
        parsed_url = urllib.parse.urlparse(url)
        filename = os.path.basename(parsed_url.path) or "paper.pdf"
        if not filename.endswith('.pdf'):
            filename += '.pdf'
        
        file_path = papers_dir / filename
        
        try:
            urllib.request.urlretrieve(url, str(file_path))
        except Exception as e:
            raise HTTPException(400, f"Failed to download paper: {str(e)}")
        
        return filename