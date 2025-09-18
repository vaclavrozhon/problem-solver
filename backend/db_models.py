"""
SQLAlchemy database models for the automatic researcher application.
Uses Google OAuth for authentication with per-user credits system.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean, Float, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)  # From Google OAuth
    email = Column(String(255), unique=True, index=True, nullable=False)     # From Google
    name = Column(String(255), nullable=True)                                # From Google
    picture_url = Column(String(500), nullable=True)                         # From Google

    # Credits system
    credits_balance = Column(Numeric(10, 2), default=10.00)  # Starting with $10 credit
    credits_spent = Column(Numeric(10, 2), default=0.00)

    # User status
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    problems = relationship("Problem", back_populates="user", cascade="all, delete-orphan")
    drafts = relationship("Draft", back_populates="user", cascade="all, delete-orphan")
    credit_transactions = relationship("CreditTransaction", back_populates="user", cascade="all, delete-orphan")
    run_sessions = relationship("RunSession", back_populates="user", cascade="all, delete-orphan")

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Transaction details
    amount = Column(Numeric(10, 4), nullable=False)  # Can be positive (added) or negative (spent)
    transaction_type = Column(String(50), nullable=False)  # research_round, paper_writing, admin_add, signup_bonus
    description = Column(String(500), nullable=True)

    # Reference to what consumed the credits
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=True)
    round_id = Column(Integer, ForeignKey("research_rounds.id"), nullable=True)
    draft_id = Column(Integer, ForeignKey("drafts.id"), nullable=True)

    # API usage details
    tokens_used = Column(Integer, nullable=True)
    model_used = Column(String(100), nullable=True)
    api_call_cost = Column(Numeric(10, 6), nullable=True)  # Actual OpenAI API cost

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="credit_transactions")
    problem = relationship("Problem")
    round = relationship("ResearchRound")
    draft = relationship("Draft")

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    task_description = Column(Text, nullable=True)
    task_type = Column(String(50), default="txt")  # txt, md, tex
    status = Column(String(50), default="idle")  # idle, running, completed, error, stopped
    current_round = Column(Integer, default=0)
    total_rounds = Column(Integer, default=0)

    # Cost tracking
    total_cost = Column(Numeric(10, 4), default=0.0000)
    estimated_cost = Column(Numeric(10, 4), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="problems")
    rounds = relationship("ResearchRound", back_populates="problem", cascade="all, delete-orphan")
    files = relationship("ProblemFile", back_populates="problem", cascade="all, delete-orphan")

class ResearchRound(Base):
    __tablename__ = "research_rounds"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed

    # AI outputs stored as JSON
    prover_outputs = Column(JSON, nullable=True)  # List of prover responses
    verifier_feedback = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    one_line_summary = Column(String(500), nullable=True)
    verdict = Column(String(100), nullable=True)  # correct, incorrect, partial, etc.

    # Cost and usage tracking
    cost = Column(Numeric(10, 4), default=0.0000)  # Cost of this round
    total_tokens = Column(Integer, default=0)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)

    # Metadata
    models_used = Column(JSON, nullable=True)  # Which models were used
    timings = Column(JSON, nullable=True)  # Execution timings
    run_params = Column(JSON, nullable=True)  # Parameters used for this round

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    problem = relationship("Problem", back_populates="rounds")

class ProblemFile(Base):
    __tablename__ = "problem_files"

    id = Column(Integer, primary_key=True, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    file_type = Column(String(50), nullable=False)  # text, markdown, latex, pdf, paper
    file_size = Column(Integer, default=0)
    description = Column(Text, nullable=True)  # For papers
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    problem = relationship("Problem", back_populates="files")

class Draft(Base):
    __tablename__ = "drafts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    task_description = Column(Text, nullable=True)
    status = Column(String(50), default="draft")  # draft, writing, completed
    current_round = Column(Integer, default=0)
    total_rounds = Column(Integer, default=0)

    # Cost tracking
    total_cost = Column(Numeric(10, 4), default=0.0000)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="drafts")
    writing_rounds = relationship("WritingRound", back_populates="draft", cascade="all, delete-orphan")

class WritingRound(Base):
    __tablename__ = "writing_rounds"

    id = Column(Integer, primary_key=True, index=True)
    draft_id = Column(Integer, ForeignKey("drafts.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    status = Column(String(50), default="pending")

    # Writing outputs
    suggester_advice = Column(Text, nullable=True)
    fixer_output = Column(Text, nullable=True)
    final_content = Column(Text, nullable=True)

    # Cost tracking
    cost = Column(Numeric(10, 4), default=0.0000)
    total_tokens = Column(Integer, default=0)

    # Metadata
    models_used = Column(JSON, nullable=True)
    timings = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    draft = relationship("Draft", back_populates="writing_rounds")

class RunSession(Base):
    __tablename__ = "run_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    problem_id = Column(Integer, ForeignKey("problems.id"), nullable=True)
    draft_id = Column(Integer, ForeignKey("drafts.id"), nullable=True)
    session_type = Column(String(50), nullable=False)  # research, writing

    # Run parameters
    requested_rounds = Column(Integer, nullable=False)
    preset = Column(String(50), nullable=False)
    provers = Column(Integer, default=2)
    temperature = Column(Float, default=0.4)
    prover_configs = Column(JSON, nullable=True)
    focus_description = Column(Text, nullable=True)

    # Session status
    status = Column(String(50), default="running")  # running, completed, failed, stopped
    current_round = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)

    # Cost tracking
    estimated_cost = Column(Numeric(10, 4), nullable=True)  # Pre-run estimate
    actual_cost = Column(Numeric(10, 4), default=0.0000)

    # Process info
    process_id = Column(Integer, nullable=True)

    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="run_sessions")
    problem = relationship("Problem")
    draft = relationship("Draft")

class SystemConfig(Base):
    __tablename__ = "system_config"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    description = Column(String(500), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # For storing configurable values like:
    # - default_user_credits: "10.00"
    # - cost_per_1k_tokens_gpt4: "0.03"
    # - cost_per_1k_tokens_gpt5: "0.15"
    # - max_rounds_per_problem: "50"
    # - signup_bonus_credits: "10.00"