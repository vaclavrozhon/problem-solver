#!/usr/bin/env python3
"""
Non-interactive migration script that uses the backend API to create problems with proper authentication
"""

import os
import asyncio
import aiohttp
import json
from pathlib import Path
from datetime import datetime

# User email and problems directory
USER_EMAIL = "vaclavrozhon@gmail.com"
PROBLEMS_DIR = Path(__file__).parent / "problems"
BACKEND_URL = "http://localhost:8000"

def read_file_content(file_path: Path) -> str:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return ""

async def create_problem_via_api(session, problem_name: str, task_description: str, auth_token: str) -> bool:
    """Create a problem using the backend API"""

    # First, create the problem using the /problems endpoint
    problem_data = {
        "name": problem_name,
        "task_description": task_description,
        "config": {}
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }

    try:
        # Create problem using the correct endpoint
        async with session.post(f"{BACKEND_URL}/tasks/problems/create", json=problem_data, headers=headers) as response:
            if response.status == 200:
                result = await response.json()
                print(f"✅ Created problem: {problem_name}")
                return True
            else:
                error_text = await response.text()
                print(f"❌ Failed to create problem {problem_name}: {response.status} - {error_text}")
                return False

    except Exception as e:
        print(f"❌ Error creating problem {problem_name}: {e}")
        return False

async def get_auth_token() -> str:
    """Get authentication token"""
    # JWT token from browser
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjlURy94SVo3bFp3UjhwQUEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3F0c3RldWdjbWxtZGFibmdqcnh6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmYWNiMThlOC1iODM3LTRkYzYtOWMxYy04ZTRiYjE4NjYyZGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4Mjc5MzA0LCJpYXQiOjE3NTgyNzU3MDQsImVtYWlsIjoidmFjbGF2cm96aG9uQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiLCJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xHVFZ2MDdaY05rSnI3Y3pjLXE0UW91U2xLdGtSVUhiRGpQWlBTYXFoZ2pmZ1RyaTE3WHc9czk2LWMiLCJlbWFpbCI6InZhY2xhdnJvemhvbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiVsOhY2xhdiBSb3pob8WIIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IlbDoWNsYXYgUm96aG_FiCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xHVFZ2MDdaY05rSnI3Y3pjLXE0UW91U2xLdGtSVUhiRGpQWlBTYXFoZ2pmZ1RyaTE3WHc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMDE3MDkyOTE1ODI5ODQ4OTg0NiIsInN1YiI6IjExMDE3MDkyOTE1ODI5ODQ4OTg0NiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzU4Mjc1NzA0fV0sInNlc3Npb25faWQiOiI2NzRmYjk2NC1mNDlmLTQzZGQtODYwMS1iYjUwNjhkYmUyOTYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.a1WIf8zScY1VcnxDe3cvjKYHlmOl_6HS74Pz2IASxDI"

    if not token:
        raise Exception("No token provided")
    return token

async def migrate_problems():
    """Main migration function"""
    print("🚀 Starting API-based migration...")

    # Check problems directory
    if not PROBLEMS_DIR.exists():
        print(f"❌ Problems directory not found: {PROBLEMS_DIR}")
        return False

    # Find valid problems (with task.md, task.txt, or task.tex)
    valid_problems = []
    for problem_dir in PROBLEMS_DIR.iterdir():
        if problem_dir.is_dir() and ((problem_dir / "task.md").exists() or (problem_dir / "task.txt").exists() or (problem_dir / "task.tex").exists()):
            valid_problems.append(problem_dir)

    print(f"📁 Found {len(valid_problems)} problems with task files")

    if not valid_problems:
        print("❌ No valid problems found")
        return False

    # Get auth token
    try:
        auth_token = await get_auth_token()
    except Exception as e:
        print(f"❌ {e}")
        return False

    # Create HTTP session and proceed with migration
    print(f"\n🚀 Starting migration of {len(valid_problems)} problems...")
    async with aiohttp.ClientSession() as session:
        success_count = 0

        for i, problem_dir in enumerate(valid_problems, 1):
            problem_name = problem_dir.name

            # Check for task files in order: task.md, task.txt, task.tex
            if (problem_dir / "task.md").exists():
                task_file = problem_dir / "task.md"
            elif (problem_dir / "task.txt").exists():
                task_file = problem_dir / "task.txt"
            else:
                task_file = problem_dir / "task.tex"

            task_description = read_file_content(task_file)

            print(f"[{i}/{len(valid_problems)}] Migrating: {problem_name}")
            if await create_problem_via_api(session, problem_name, task_description, auth_token):
                success_count += 1

    print(f"\n📊 Migration completed:")
    print(f"✅ Successfully migrated: {success_count} problems")
    print(f"❌ Failed to migrate: {len(valid_problems) - success_count} problems")

    return success_count > 0

if __name__ == "__main__":
    asyncio.run(migrate_problems())