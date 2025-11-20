"""
Data models for the orchestrator system.

This module contains all Pydantic models used for structured outputs
from various AI agents (prover, verifier, summarizer, paper suggester, paper fixer).
"""

from typing import List, Optional
from pydantic import BaseModel, Field, AliasChoices


class ProverOutput(BaseModel):
    """Output from the prover agent."""
    content: str = Field(..., description="Prover's analysis and output for the verifier")


class VerifierOutput(BaseModel):
    """Output from the verifier agent (legacy single-prover version)."""
    feedback_md: str = Field(..., description="Detailed feedback")
    summary_md: str = Field(..., description="Concise summary")
    verdict: str = Field(..., description="promising|uncertain|unlikely")
    blocking_issues: List[str] = Field(default_factory=list)


class PerProverFeedback(BaseModel):
    """Feedback for a single prover in multi-prover mode."""
    prover_id: str = Field(..., description="Prover identifier, e.g., 01")
    brief_feedback: str = Field(..., description="Short targeted feedback")
    score: str = Field(..., description="promising|uncertain|unlikely")


class NotesUpdate(BaseModel):
    """Update to the notes.md file.
    
    Accepts both new (action/content) and legacy (mode/content_md) field names.
    """
    action: str = Field(
        ..., description="append|replace",
        validation_alias=AliasChoices("action", "mode")
    )
    content: str = Field(
        "", description="Markdown to write to notes.md",
        validation_alias=AliasChoices("content", "content_md")
    )


class ProofsUpdate(BaseModel):
    """Update to the proofs.md file."""
    action: str = Field(..., description="append|replace")
    content: str = Field("", description="Markdown to write to proofs.md")


class OutputUpdate(BaseModel):
    """Update to the output.md file."""
    action: str = Field(..., description="append|replace")
    content: str = Field("", description="Markdown to write to output.md")


class VerifierCombinedOutput(BaseModel):
    """Output from the verifier in multi-prover mode."""
    feedback_md: str
    summary_md: str
    verdict: str
    blocking_issues: List[str] = Field(default_factory=list)
    per_prover: List[PerProverFeedback] = Field(default_factory=list)
    notes_update: Optional[NotesUpdate] = None
    proofs_update: Optional[ProofsUpdate] = None
    output_update: Optional[OutputUpdate] = None


class VerifierNewSchema(BaseModel):
    """Alternative verifier output schema (not currently used)."""
    feedback_md: str
    new_notes_md: str
    new_notes_append: str
    new_outputs_md: str
    new_outputs_append: str
    verdict: str


class SummarizerOutput(BaseModel):
    """Output from the summarizer agent."""
    summary_md: str = Field(..., description="Readable summary of the round")
    one_line_summary: str = Field(..., description="Brief one-line summary for UI display")
    highlights: List[str] = Field(default_factory=list)
    next_questions: List[str] = Field(default_factory=list)


class PaperSuggesterOutput(BaseModel):
    """Output from the paper suggester agent."""
    advice_md: str
    priority_items: List[str]
    risk_notes: str


class PaperFixerOutput(BaseModel):
    """Output from the paper fixer/writer agent."""
    status: str
    new_tex: str
    changes_summary_md: str
    unfixable_issues_md: str
    compiler_expectations_md: str