"""
Pydantic models for API request/response schemas.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class SignupPayload(BaseModel):
    """User registration payload"""
    email: str
    password: str

class KeyPayload(BaseModel):
    """OpenAI API key configuration payload"""
    openai_api_key: str

class RunParams(BaseModel):
    """Parameters for running problem-solving tasks"""
    rounds: int = 1
    provers: int = 2
    temperature: float = 0.4
    preset: str = "gpt5"
    prover_configs: Optional[List[Dict[str, Any]]] = None
    focus_description: Optional[str] = None

class WritingParams(BaseModel):
    """Parameters for running paper writing tasks"""
    rounds: int = 3
    preset: str = "gpt5"

class NewTaskPayload(BaseModel):
    """Payload for creating new tasks (problems or drafts)"""
    name: str
    task_description: str
    task_type: str = "txt"  # txt, tex, md

class PaperUrlPayload(BaseModel):
    """Payload for adding papers from URLs"""
    url: str