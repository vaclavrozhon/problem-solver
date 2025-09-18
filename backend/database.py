"""
Database configuration and connection management.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Railway sometimes provides postgres:// URLs, but SQLAlchemy needs postgresql://
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to SQLite for local development
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./data/app.db"
    print("⚠️  No DATABASE_URL found, using SQLite for local development")

# Create engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration for local development
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # PostgreSQL configuration for production
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    try:
        # Import models to register them with Base
        from . import db_models

        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False