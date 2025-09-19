#!/usr/bin/env python3
"""
Complete migration script that migrates problems and all their files
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

def get_file_type_mapping(filename: str) -> str:
    """Map filename to file type for API"""
    filename_lower = filename.lower()

    if 'notes' in filename_lower:
        return 'notes'
    elif 'output' in filename_lower:
        return 'output'
    elif 'proof' in filename_lower:
        return 'proofs'
    elif 'summary' in filename_lower:
        return 'summary'
    elif 'progress' in filename_lower:
        return 'progress'
    elif filename_lower.endswith('.md'):
        return 'markdown'
    elif filename_lower.endswith('.txt'):
        return 'text'
    elif filename_lower.endswith('.tex'):
        return 'latex'
    else:
        return 'other'

async def create_problem_via_api(session, problem_name: str, task_description: str, auth_token: str) -> int:
    """Create a problem using the backend API"""

    # Create the problem using the /tasks/problems/create endpoint
    problem_data = {
        "name": problem_name,
        "task_description": task_description,
        "task_type": "txt"
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
                problem_id = result.get('problem_id')
                print(f"✅ Created problem: {problem_name} (ID: {problem_id})")
                return problem_id
            else:
                error_text = await response.text()
                print(f"❌ Failed to create problem {problem_name}: {response.status} - {error_text}")
                return None

    except Exception as e:
        print(f"❌ Error creating problem {problem_name}: {e}")
        return None

async def upload_file_to_problem(session, problem_id: int, file_type: str, content: str, auth_token: str) -> bool:
    """Upload a file to a problem using the files API"""

    file_data = {
        "content": content,
        "description": f"Migrated {file_type} file"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    }

    try:
        # Upload file using the problems files endpoint
        async with session.put(f"{BACKEND_URL}/problems/{problem_id}/files/{file_type}?round=0", json=file_data, headers=headers) as response:
            if response.status == 200:
                return True
            else:
                error_text = await response.text()
                print(f"    ❌ Failed to upload {file_type}: {response.status} - {error_text}")
                return False

    except Exception as e:
        print(f"    ❌ Error uploading {file_type}: {e}")
        return False

async def get_auth_token() -> str:
    """Get authentication token"""
    # JWT token from browser
    token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjlURy94SVo3bFp3UjhwQUEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3F0c3RldWdjbWxtZGFibmdqcnh6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJmYWNiMThlOC1iODM3LTRkYzYtOWMxYy04ZTRiYjE4NjYyZGEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4MjgwMTgwLCJpYXQiOjE3NTgyNzY1ODAsImVtYWlsIjoidmFjbGF2cm96aG9uQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiLCJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xHVFZ2MDdaY05rSnI3Y3pjLXE0UW91U2xKdGtSVUhiRGpQWlBTYXFoZ2pmZ1RyaTE3WHc9czk2LWMiLCJlbWFpbCI6InZhY2xhdnJvemhvbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiVsOhY2xhdiBSb3pob8WIIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IlbDoWNsYXYgUm96aG/FiCIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xHVFZ2MDdaY05rSnI3Y3pjLXE0UW91U2xKdGtSVUhiRGpQWlBTYXFoZ2pmZ1RyaTE3WHc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMDE3MDkyOTE1ODI5ODQ4OTg0NiIsInN1YiI6IjExMDE3MDkyOTE1ODI5ODQ4OTg0NiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzU4Mjc2NTgwfV0sInNlc3Npb25faWQiOiIyZDM0NzlhZi1lOTllLTQxMjQtYjhmMC01NGZkN2FiNDAwYmMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.uubOlNKytLPtRRyD5AT1YFuJO4dQQwjClaMZZy8-Zeo"

    if not token:
        raise Exception("No token provided")
    return token

async def migrate_problem_complete(session, problem_dir: Path, auth_token: str) -> bool:
    """Migrate a single problem with all its files"""
    problem_name = problem_dir.name

    # Check for task files in order: task.md, task.txt, task.tex
    if (problem_dir / "task.md").exists():
        task_file = problem_dir / "task.md"
    elif (problem_dir / "task.txt").exists():
        task_file = problem_dir / "task.txt"
    elif (problem_dir / "task.tex").exists():
        task_file = problem_dir / "task.tex"
    else:
        print(f"❌ No task file found for {problem_name}")
        return False

    task_description = read_file_content(task_file)

    print(f"🔄 Migrating: {problem_name}")

    # Step 1: Create the problem
    problem_id = await create_problem_via_api(session, problem_name, task_description, auth_token)
    if not problem_id:
        return False

    # Step 2: Upload all additional files
    files_uploaded = 0
    target_files = ['notes.md', 'output.md', 'proofs.md', 'summary.md', 'progress.md']

    for target_file in target_files:
        file_path = problem_dir / target_file
        if file_path.exists():
            content = read_file_content(file_path)
            if content:  # Only upload non-empty files
                file_type = get_file_type_mapping(target_file)
                if await upload_file_to_problem(session, problem_id, file_type, content, auth_token):
                    print(f"    ✅ Uploaded {target_file}")
                    files_uploaded += 1
                else:
                    print(f"    ❌ Failed to upload {target_file}")

    print(f"    📊 Uploaded {files_uploaded} additional files")
    return True

async def migrate_problems():
    """Main migration function"""
    print("🚀 Starting complete migration (problems + files)...")

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

    # Create HTTP session and proceed with complete migration
    print(f"\n🚀 Starting complete migration of {len(valid_problems)} problems...")
    async with aiohttp.ClientSession() as session:
        success_count = 0

        for i, problem_dir in enumerate(valid_problems, 1):
            print(f"\n[{i}/{len(valid_problems)}] ==================")
            if await migrate_problem_complete(session, problem_dir, auth_token):
                success_count += 1

    print(f"\n📊 Complete migration results:")
    print(f"✅ Successfully migrated: {success_count} problems")
    print(f"❌ Failed to migrate: {len(valid_problems) - success_count} problems")

    if success_count > 0:
        print(f"\n🎉 Migration successful! Check your frontend application.")

    return success_count > 0

if __name__ == "__main__":
    asyncio.run(migrate_problems())