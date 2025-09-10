"""
Orchestrator package for the Automatic Researcher system.

This package contains modular components for running research and paper writing rounds.
"""

from .models import *
from .utils import *
from .agents import *
from .papers import *
from .runner import *

__all__ = [
    # Models
    'ProverOutput', 'VerifierOutput', 'PerProverFeedback', 'NotesUpdate',
    'OutputUpdate', 'VerifierCombinedOutput', 'VerifierNewSchema',
    'SummarizerOutput', 'PaperSuggesterOutput', 'PaperFixerOutput',
    
    # Utils
    'load_prompt', 'write_status', 'gather_context_files', 'auto_commit_round',
    'extract_json_from_response', 'dump_io', 'compile_latex', 'compile_tex_string',
    
    # Agents
    'call_prover', 'call_prover_one', 'call_verifier', 'call_verifier_combined',
    'call_summarizer', 'call_paper_suggester', 'call_paper_fixer',
    
    # Papers
    'extract_pdf_text', 'extract_html_text', 'ensure_papers_parsed',
    'get_parsed_papers_content', 'read_problem_context',
    
    # Runner
    'run_round', 'run_paper_round',
]