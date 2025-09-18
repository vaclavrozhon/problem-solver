#!/usr/bin/env python3
"""
Railway production startup script.

This script builds the frontend and serves both frontend and backend
in a single Railway service.
"""

import subprocess
import sys
import os
from pathlib import Path

def build_frontend():
    """Build the React frontend for production."""
    print("📦 Building React frontend...")
    frontend_dir = Path("frontend")

    if not frontend_dir.exists():
        print("⚠️  Frontend directory not found, skipping build")
        return False

    try:
        # Install frontend dependencies
        subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)

        # Build frontend
        env = os.environ.copy()
        env["VITE_API_BASE"] = "https://automatic-researcher-production.up.railway.app"
        subprocess.run(["npm", "run", "build"], cwd=frontend_dir, env=env, check=True)

        print("✅ Frontend built successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend build failed: {e}")
        return False

def main():
    print("🚀 Starting Automatic Researcher in Railway production mode...")
    print("🔄 Starting full-stack application")

    # Check if frontend was built by Docker
    frontend_dist = Path("frontend/dist")
    if frontend_dist.exists():
        print("✅ Frontend build found - Docker built successfully")
    else:
        print("❌ Frontend build not found - Docker build may have failed")

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