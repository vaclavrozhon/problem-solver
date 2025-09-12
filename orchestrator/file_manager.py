"""
Local paper management.

This module manages local text papers and optional description sidecars.
No uploads to OpenAI; no attachments; no vector stores.
"""

import os
import hashlib
import json
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from openai import OpenAI  # kept for future use; not used here

@contextmanager
def _cache_lock(cache_file: Path, timeout: float = 10.0):
    """Simple file-based lock for cache operations."""
    lock_file = cache_file.with_suffix(cache_file.suffix + ".lock")
    waited = 0.0
    while lock_file.exists():
        time.sleep(0.05)
        waited += 0.05
        if waited > timeout:
            break
    try:
        lock_file.write_text("1")
        yield
    finally:
        try:
            lock_file.unlink()
        except Exception:
            pass

class FileManager:
    """Manages local paper files and descriptions."""
    
    def __init__(self, problem_dir: Path):
        self.problem_dir = problem_dir
        self.cache_file = problem_dir / ".file_cache.json"
        self.file_cache = self._load_cache()
    
    def _load_cache(self) -> Dict[str, Dict]:
        """Load the file cache from disk with locking."""
        with _cache_lock(self.cache_file):
            if self.cache_file.exists():
                try:
                    return json.loads(self.cache_file.read_text())
                except Exception as e:
                    print(f"Error loading file cache: {e}")
            return {}
    
    def _save_cache(self):
        """Save the file cache to disk with locking."""
        with _cache_lock(self.cache_file):
            try:
                self.cache_file.write_text(json.dumps(self.file_cache, indent=2))
            except Exception as e:
                print(f"Error saving file cache: {e}")
    
    def _get_file_hash(self, file_path: Path) -> str:
        """Get MD5 hash of a file for caching using streaming to handle large files."""
        hash_obj = hashlib.md5()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):  # 1MB chunks
                hash_obj.update(chunk)
        return hash_obj.hexdigest()
    
    # Upload-related methods removed; we only work with local files
    
    # Removed upload_file; not needed
    
    def get_file_descriptions(self, file_paths: List[Path]) -> str:
        """Generate description text for files that will be attached."""
        descriptions = []
        
        for file_path in file_paths:
            cache_key = str(file_path.relative_to(self.problem_dir)).replace("\\", "/")
            description = ""
            
            # Get description from cache if available
            if cache_key in self.file_cache:
                description = self.file_cache[cache_key].get('description', '')
            
            # Look for sidecar description file next to the actual file
            desc_file = file_path.with_suffix(".description.txt")
            if desc_file.exists():
                try:
                    file_desc = desc_file.read_text(encoding="utf-8").strip()
                    if file_desc:
                        description = file_desc
                except Exception:
                    pass
            
            # Build description entry using normalized key
            if description:
                descriptions.append(f"- {cache_key}: {description}")
            else:
                descriptions.append(f"- {cache_key}: Available for search")
        
        if descriptions:
            return "Available files for reference:\n" + "\n".join(descriptions)
        return ""
    
    # Removed prepare_attachments; not needed
    
    def get_available_paper_files(self) -> List[Path]:
        """Get all available paper files in the problem directory with allowed suffixes."""
        # Only allow known academic/document file types
        ALLOWED_SUFFIXES = {'.pdf', '.txt', '.md', '.tex'}
        paper_files = []
        
        # Check papers directory
        papers_dir = self.problem_dir / "papers"
        if papers_dir.exists():
            try:
                for file_path in papers_dir.iterdir():
                    if (file_path.is_file() and 
                        file_path.suffix.lower() in ALLOWED_SUFFIXES and
                        not file_path.name.endswith('.description.txt')):
                        paper_files.append(file_path)
            except Exception as e:
                print(f"Error reading papers directory: {e}")
        
        
        return sorted(paper_files)
    
    # Removed cleanup for remote files


def get_paper_text_with_descriptions(problem_dir: Path) -> str:
    """Return a concatenation of all papers: description first, then text."""
    fm = FileManager(problem_dir)
    papers = fm.get_available_paper_files()
    parts: List[str] = []
    for p in papers:
        rel = str(p.relative_to(problem_dir)).replace("\\", "/")
        desc = ""
        desc_file = p.with_suffix(".description.txt") if p.suffix != ".description.txt" else None
        if desc_file and desc_file.exists():
            try:
                desc = desc_file.read_text(encoding="utf-8").strip()
            except Exception:
                desc = ""
        if desc:
            parts.append(f"=== Paper Description ({rel}) ===\n{desc}\n")
        try:
            parts.append(f"=== Paper ({rel}) ===\n{p.read_text(encoding='utf-8')}\n")
        except Exception:
            continue
    return "\n".join(parts)