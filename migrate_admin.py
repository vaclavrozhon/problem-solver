#!/usr/bin/env python3
"""
Admin migration script - uses admin database client directly to bypass RLS
"""

import os
import asyncio
import sys
from pathlib import Path
from datetime import datetime, timezone
import uuid

# Add the backend directory to sys.path so we can import modules
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.db import get_admin_db

# User ID for your existing user
USER_ID = "facb18e8-b837-4dc6-9c1c-8e4bb18662da"
PROBLEMS_DIR = Path(__file__).parent / "problems"

def read_file_content(file_path: Path) -> str:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return ""

def get_file_type_mapping(filename: str) -> str:
    """Map filename to file type for database"""
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

async def migrate_problem_admin(admin_db, problem_dir: Path) -> bool:
    """Migrate a single problem using admin database access"""
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

    try:
        # Step 1: Create the problem directly using admin client
        problem_data = {
            'owner_id': USER_ID,
            'name': problem_name,
            'status': 'idle',
            'current_round': 0,
            'config': {}
        }

        # Insert problem
        response = admin_db.table('problems').insert(problem_data).execute()

        if not response.data:
            print(f"❌ Failed to create problem {problem_name}")
            return False

        problem_id = response.data[0]['id']
        print(f"✅ Created problem: {problem_name} (ID: {problem_id})")

        # Step 2: Create task file
        task_file_data = {
            'problem_id': problem_id,
            'round': 0,
            'file_type': 'task',
            'file_name': task_file.name,
            'content': task_description
        }

        admin_db.table('problem_files').insert(task_file_data).execute()
        print(f"    ✅ Uploaded task file: {task_file.name}")

        # Step 3: Upload all additional files
        files_uploaded = 1  # task file already uploaded
        target_files = ['notes.md', 'output.md', 'proofs.md', 'summary.md', 'progress.md']

        for target_file in target_files:
            file_path = problem_dir / target_file
            if file_path.exists():
                content = read_file_content(file_path)
                if content:  # Only upload non-empty files
                    file_type = get_file_type_mapping(target_file)

                    file_data = {
                        'problem_id': problem_id,
                        'round': 0,
                        'file_type': file_type,
                        'file_name': target_file,
                        'content': content
                    }

                    admin_db.table('problem_files').insert(file_data).execute()
                    print(f"    ✅ Uploaded {target_file}")
                    files_uploaded += 1

        print(f"    📊 Total files uploaded: {files_uploaded}")
        return True

    except Exception as e:
        print(f"❌ Error migrating problem {problem_name}: {e}")
        return False

async def ensure_user_exists_admin(admin_db):
    """Ensure the user exists in the database using admin client"""
    try:
        # Check if user exists
        response = admin_db.table('users').select('*').eq('id', USER_ID).execute()

        if not response.data:
            # Create user
            user_data = {
                'id': USER_ID,
                'email': 'vaclavrozhon@gmail.com',
                'last_login': datetime.now(timezone.utc).isoformat()
            }
            admin_db.table('users').insert(user_data).execute()
            print(f"✅ Created user: {USER_ID}")
        else:
            print(f"✅ User already exists: {USER_ID}")
    except Exception as e:
        print(f"ℹ️ User creation skipped: {e}")

async def migrate_problems():
    """Main migration function"""
    print("🚀 Starting admin database migration...")

    # Check if admin database is available
    admin_db = get_admin_db()
    if not admin_db:
        print("❌ Admin database not configured. Please check your SUPABASE_SERVICE_KEY.")
        return False

    print("✅ Admin database connection established")

    # Ensure user exists
    await ensure_user_exists_admin(admin_db)

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

    # Migrate each problem
    print(f"\n🚀 Starting migration of {len(valid_problems)} problems...")
    success_count = 0

    for i, problem_dir in enumerate(valid_problems, 1):
        print(f"\n[{i}/{len(valid_problems)}] ==================")
        if await migrate_problem_admin(admin_db, problem_dir):
            success_count += 1

    print(f"\n📊 Admin migration results:")
    print(f"✅ Successfully migrated: {success_count} problems")
    print(f"❌ Failed to migrate: {len(valid_problems) - success_count} problems")

    if success_count > 0:
        print(f"\n🎉 Migration successful! Problems migrated for user: {USER_ID}")
        print(f"You can now view them in your frontend application.")

    return success_count > 0

if __name__ == "__main__":
    asyncio.run(migrate_problems())