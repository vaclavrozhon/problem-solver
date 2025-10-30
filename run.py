#!/usr/bin/env python3
"""
Start the FastAPI backend and the new React UI (Vite dev server),
then open the browser to the new UI.

Usage:
  python3 run.py
"""

import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path

REPO = Path(__file__).parent.resolve()
VENV = REPO / "venv"

# Port configuration - change these values to use different ports
# Note: Avoid ports like 6000 (X11), 6665-6669 (IRC) as browsers block them
FRONTEND_PORT = 5173
BACKEND_PORT = 8000

# Detect Railway environment
RAILWAY_ENV = os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RAILWAY_ENVIRONMENT_NAME")

# Optional install control flags
AR_FORCE_BACKEND_INSTALL = os.environ.get("AR_FORCE_BACKEND_INSTALL") in ("1", "true", "yes")
AR_SKIP_BACKEND_INSTALL = os.environ.get("AR_SKIP_BACKEND_INSTALL") in ("1", "true", "yes")
AR_FORCE_NPM_INSTALL = os.environ.get("AR_FORCE_NPM_INSTALL") in ("1", "true", "yes")
AR_SKIP_NPM_INSTALL = os.environ.get("AR_SKIP_NPM_INSTALL") in ("1", "true", "yes")

def ensure_env():
    """Load API key from ~/.openai.env into environment if present."""
    home_env = Path.home() / ".openai.env"
    if not home_env.exists():
        print("⚠️  ~/.openai.env not found. Backend will start, but OPENAI_API_KEY may be missing.")
        return
    try:
        with open(home_env) as f:
            for line in f:
                if line.strip().startswith("OPENAI_API_KEY="):
                    key = line.split("=", 1)[1].strip()
                    if key:
                        os.environ["OPENAI_API_KEY"] = key
                        print(f"✅ API key loaded: {key[:20]}...")
                        return
        print("⚠️  OPENAI_API_KEY not found in ~/.openai.env")
    except Exception as e:
        print(f"⚠️  Could not read ~/.openai.env: {e}")

def start_backend() -> subprocess.Popen:
    """Start FastAPI backend via uvicorn inside repo venv."""
    print(f"🚀 Starting backend (FastAPI + Uvicorn) on http://localhost:{BACKEND_PORT} ...")
    py = str((VENV / ("Scripts" if os.name == "nt" else "bin") / "python"))
    log_path = REPO / "backend.log"
    log_fp = open(log_path, "a", buffering=1)
    proc = subprocess.Popen(
        [py, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", str(BACKEND_PORT)],
        cwd=str(REPO),
        env=os.environ.copy(),
        stdout=log_fp,
        stderr=log_fp,
        text=True,
    )
    return proc

def start_frontend() -> subprocess.Popen:
    """Install dependencies if needed and start Vite dev server."""
    fe_dir = REPO / "frontend"
    if not fe_dir.exists():
        raise RuntimeError("frontend/ directory not found")
    # Run npm install only when necessary or explicitly requested
    need_npm_install = False
    node_modules = fe_dir / "node_modules"
    if AR_FORCE_NPM_INSTALL:
        need_npm_install = True
    elif AR_SKIP_NPM_INSTALL:
        need_npm_install = False
    else:
        need_npm_install = not node_modules.exists()

    if need_npm_install:
        print("📦 Installing frontend dependencies (npm install)...")
        try:
            subprocess.run(["npm", "install"], cwd=str(fe_dir), check=True)
            print("✅ Frontend dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"❌ Failed to install frontend dependencies: {e}\n   Please run 'cd frontend && npm install' manually and try again.")

    print(f"🧩 Starting Vite dev server (new UI) on http://localhost:{FRONTEND_PORT} ...")
    env = os.environ.copy()
    env.setdefault("VITE_API_BASE", f"http://localhost:{BACKEND_PORT}")
    log_path = REPO / "frontend" / "vite.log"
    log_fp = open(log_path, "a", buffering=1)
    proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(fe_dir),
        env=env,
        stdout=log_fp,
        stderr=log_fp,
        text=True,
    )
    return proc

def main():
    # Check if running in Railway production environment
    if RAILWAY_ENV:
        print("🚀 Detected Railway environment - redirecting to production startup")
        print("   Use railway-start.py for Railway deployment")
        print("   This script (run.py) is for local development only")
        sys.exit(1)

    print("🔬 Starting Automatic Researcher — New UI (Development Mode)")
    ensure_env()

    # Ensure a project-local virtual environment and install backend deps (only if needed)
    try:
        if not VENV.exists():
            print("🐍 Creating virtual environment (venv)...")
            subprocess.run([sys.executable, "-m", "venv", str(VENV)], check=True)

        py_exe = str((VENV / ("Scripts" if os.name == "nt" else "bin") / "python"))
        pip_exe = str((VENV / ("Scripts" if os.name == "nt" else "bin") / "pip"))

        need_backend_install = False
        if AR_FORCE_BACKEND_INSTALL:
            need_backend_install = True
        elif AR_SKIP_BACKEND_INSTALL:
            need_backend_install = False
        else:
            # Probe for required modules
            try:
                probe = subprocess.run(
                    [py_exe, "-c", "import uvicorn, fastapi; print('OK')"],
                    check=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                need_backend_install = (probe.returncode != 0)
            except subprocess.CalledProcessError:
                need_backend_install = True

        if need_backend_install:
            print("📦 Installing backend dependencies (requirements.txt)...")
            subprocess.run([pip_exe, "install", "--upgrade", "pip", "setuptools", "wheel"], check=True)
            subprocess.run([pip_exe, "install", "-r", str(REPO / "requirements.txt")], check=True)
        else:
            print("✅ Backend dependencies already satisfied (uvicorn/fastapi import OK)")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to prepare venv or install dependencies: {e}")
        print("   Check requirements.txt or your network, then rerun: python3 run.py")
        return

    backend = None
    frontend = None
    try:
        backend = start_backend()
        # Give backend a moment to bind the port
        time.sleep(1.5)
        frontend = start_frontend()
        # Give vite a moment to start
        time.sleep(2.5)
        try:
            webbrowser.open(f"http://localhost:{FRONTEND_PORT}")
            print(f"🌐 Opened http://localhost:{FRONTEND_PORT} in your browser")
        except Exception:
            print(f"📖 Please open http://localhost:{FRONTEND_PORT} in your browser")

        print("🎉 New UI running. Press Ctrl+C to stop.")
        # Wait on frontend; it runs until interrupted
        if frontend:
            frontend.wait()
        else:
            # Fallback wait loop
            while True:
                time.sleep(1)

    except KeyboardInterrupt:
        print("\n🛑 Stopping...")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        # Terminate frontend first, then backend
        for proc in (frontend, backend):
            if proc and proc.poll() is None:
                try:
                    proc.terminate()
                    time.sleep(0.5)
                    if proc.poll() is None:
                        proc.kill()
                except Exception:
                    pass
        print("👋 Goodbye!")

if __name__ == "__main__":
    main()