#!/usr/bin/env python3
"""
Railway production startup script.

This script runs only the FastAPI backend without the frontend dev server,
suitable for Railway deployment where the frontend would be served separately
or built as static files.
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    print("🚀 Starting Automatic Researcher in Railway production mode...")

    # Set up data directory
    data_root = Path(os.environ.get("AR_DATA_ROOT", "./data")).resolve()
    data_root.mkdir(parents=True, exist_ok=True)
    print(f"📁 Data directory: {data_root}")

    # Get port from Railway environment
    port = os.environ.get("PORT", "8000")
    print(f"🌐 Starting server on port {port}")

    # Check for OpenAI API key
    openai_key = os.environ.get("OPENAI_API_KEY")
    if not openai_key:
        print("⚠️  Warning: OPENAI_API_KEY environment variable not set")
        print("   Set this in Railway dashboard for AI functionality to work")
    else:
        print(f"✅ OPENAI_API_KEY found (length: {len(openai_key)})")
        print("🤖 AI functionality enabled")

    # Start uvicorn directly (no virtual environment needed in Railway)
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "backend.main:app",
            "--host", "0.0.0.0",
            "--port", port,
            "--workers", "1"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

if __name__ == "__main__":
    main()