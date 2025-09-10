"""
File management for OpenAI Files API integration.

This module handles uploading files to OpenAI's Files API and managing
file attachments for the Responses API with file_search tool.
"""

import os
import hashlib
import json
import time
from contextlib import contextmanager
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI()

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
    """Manages file uploads and attachments for OpenAI Files API."""
    
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
    
    def _is_file_uploaded(self, file_path: Path) -> Optional[str]:
        """Check if file is already uploaded and return file_id if cached."""
        try:
            file_hash = self._get_file_hash(file_path)
            cache_key = str(file_path.relative_to(self.problem_dir))
            
            if cache_key in self.file_cache:
                cached_entry = self.file_cache[cache_key]
                if cached_entry.get('hash') == file_hash:
                    # Verify the file still exists in OpenAI
                    try:
                        client.files.retrieve(cached_entry['file_id'])
                        return cached_entry['file_id']
                    except Exception:
                        # File no longer exists, remove from cache
                        del self.file_cache[cache_key]
                        self._save_cache()
            
            return None
        except Exception as e:
            print(f"Error checking if file is uploaded: {e}")
            return None
    
    def upload_file(self, file_path: Path, description: str = "") -> Optional[str]:
        """Upload a file to OpenAI Files API and return file_id."""
        try:
            # Check if already uploaded
            file_id = self._is_file_uploaded(file_path)
            if file_id:
                print(f"  File already uploaded: {file_path.name} -> {file_id}")
                return file_id
            
            # Upload the file
            with open(file_path, 'rb') as f:
                file_obj = client.files.create(
                    file=f,
                    purpose="assistants"
                )
            
            # Cache the result
            file_hash = self._get_file_hash(file_path)
            cache_key = str(file_path.relative_to(self.problem_dir))
            self.file_cache[cache_key] = {
                'file_id': file_obj.id,
                'hash': file_hash,
                'description': description,
                'uploaded_at': file_obj.created_at
            }
            self._save_cache()
            
            print(f"  Uploaded: {file_path.name} -> {file_obj.id}")
            return file_obj.id
            
        except Exception as e:
            print(f"Error uploading file {file_path}: {e}")
            return None
    
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
    
    def prepare_attachments(self, file_paths: List[Path]) -> List[Dict]:
        """Prepare file attachments for Responses API."""
        attachments = []
        
        for file_path in file_paths:
            file_id = self._is_file_uploaded(file_path)
            if not file_id:
                # Upload if not already uploaded
                file_id = self.upload_file(file_path)
            
            if file_id:
                attachments.append({
                    "file_id": file_id,
                    "tools": [{"type": "file_search"}]
                })
        
        return attachments
    
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
        
        # Check papers_parsed directory
        parsed_dir = self.problem_dir / "papers_parsed"  
        if parsed_dir.exists():
            try:
                for file_path in parsed_dir.iterdir():
                    if (file_path.is_file() and 
                        file_path.suffix.lower() in ALLOWED_SUFFIXES):
                        paper_files.append(file_path)
            except Exception as e:
                print(f"Error reading papers_parsed directory: {e}")
        
        return sorted(paper_files)
    
    def cleanup_unused_files(self):
        """Clean up uploaded files that no longer exist locally."""
        to_remove = []
        
        for cache_key, cached_entry in self.file_cache.items():
            file_path = self.problem_dir / cache_key
            if not file_path.exists():
                try:
                    # Delete from OpenAI
                    client.files.delete(cached_entry['file_id'])
                    to_remove.append(cache_key)
                    print(f"  Cleaned up: {cache_key}")
                except Exception as e:
                    print(f"Error cleaning up file {cache_key}: {e}")
        
        # Remove from cache
        for key in to_remove:
            del self.file_cache[key]
        
        if to_remove:
            self._save_cache()


def get_file_attachments_for_prover(problem_dir: Path, prover_config: Optional[Dict] = None) -> Tuple[List[Dict], str]:
    """
    Get file attachments and descriptions for a specific prover based on their configuration.
    
    Args:
        problem_dir: Problem directory path
        prover_config: Prover configuration with paperAccess settings
        
    Returns:
        Tuple of (attachments, description_text)
    """
    file_manager = FileManager(problem_dir)
    available_papers = file_manager.get_available_paper_files()
    
    # Filter papers based on prover configuration
    allowed_papers = []
    if prover_config and prover_config.get('paperAccess') and prover_config['paperAccess']:
        # paperAccess exists and is not empty - filter based on explicit permissions
        paper_access = prover_config['paperAccess']
        for paper_file in available_papers:
            # Normalize key by relative path to handle both papers/ and papers_parsed/
            paper_key = str(paper_file.relative_to(problem_dir)).replace("\\", "/")
            if paper_access.get(paper_key, False):
                allowed_papers.append(paper_file)
    else:
        # If no specific configuration or paperAccess is empty, allow all papers
        allowed_papers = available_papers
    
    # Prepare attachments and descriptions
    attachments = file_manager.prepare_attachments(allowed_papers)
    descriptions = file_manager.get_file_descriptions(allowed_papers)
    
    return attachments, descriptions