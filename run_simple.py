#!/usr/bin/env python3
"""
Simple root-only startup script that actually works.
Uses Streamlit UI only and fixes all the path issues.
"""

import subprocess
import sys
import time
import os
import webbrowser
from pathlib import Path

REPO = Path(__file__).parent.resolve()

def ensure_env():
    """Load API key from ~/.openai.env"""
    home_env = Path.home() / ".openai.env"
    if not home_env.exists():
        print("❌ Please create ~/.openai.env with: OPENAI_API_KEY=sk-...")
        sys.exit(1)
    
    # Load the API key into environment
    with open(home_env) as f:
        for line in f:
            if line.strip().startswith("OPENAI_API_KEY="):
                key = line.split("=", 1)[1].strip()
                os.environ["OPENAI_API_KEY"] = key
                print(f"✅ API key loaded: {key[:20]}...")
                return
    
    print("❌ No OPENAI_API_KEY found in ~/.openai.env")
    sys.exit(1)

def main():
    print("🔬 Starting Automatic Researcher (Simple)")
    
    ensure_env()
    
    # Create venv for dependencies (in root)
    venv = REPO / ".venv"
    if not venv.exists():
        print("🐍 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", str(venv)], check=True)
        
        print("📦 Installing dependencies...")
        subprocess.run([
            str(venv / "bin" / "pip"), 
            "install", 
            "-r", str(REPO / "requirements.txt")
        ], check=True)
    
    # Start Streamlit dashboard
    print("🚀 Starting Streamlit UI...")
    ui_proc = subprocess.Popen([
        str(venv / "bin" / "streamlit"), 
        "run", "web_app.py",
        "--server.headless", "true"
    ], cwd=str(REPO))
    
    # Give it time to start
    time.sleep(3)
    
    try:
        webbrowser.open("http://localhost:8501")
        print("🌐 Streamlit UI: http://localhost:8501")
    except:
        print("📖 Please open http://localhost:8501")
    
    print("🎉 System started!")
    print("Press Ctrl+C to stop")
    
    try:
        ui_proc.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping...")
        ui_proc.terminate()
        print("👋 Goodbye!")

if __name__ == "__main__":
    main()