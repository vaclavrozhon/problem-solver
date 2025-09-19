#!/usr/bin/env python3
"""
Migration script to move local problem data to Supabase database
for user vaclavrozhon@gmail.com
"""

import os
import asyncio
import sys
from pathlib import Path
from datetime import datetime
import json

# Add the backend directory to sys.path so we can import modules
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.db import get_admin_db, is_database_configured
from backend.services.database import DatabaseService

# User email to migrate data for
USER_EMAIL = "vaclavrozhon@gmail.com"
PROBLEMS_DIR = Path(__file__).parent / "problems"
DRAFTS_DIR = Path(__file__).parent / "drafts"

async def get_user_id_by_email(email: str) -> str:
    """Get user ID from our users table (after user has logged in)"""
    from backend.db import get_db

    db = get_db()
    if not db:
        raise Exception("Database not configured")

    try:
        # Since we can't access auth.users without service key,
        # we'll assume the user has already logged in and is in our users table
        # For this migration, we'll use a hardcoded UUID that you can get from Supabase dashboard

        # You need to:
        # 1. Go to Supabase Dashboard > Authentication > Users
        # 2. Find the user with email vaclavrozhon@gmail.com
        # 3. Copy their UUID and put it here

        # User UUID for vaclavrozhon@gmail.com
        user_uuid = "facb18e8-b837-4dc6-9c1c-8e4bb18662da"

        return user_uuid

    except Exception as e:
        raise Exception(f"Could not get user ID: {e}")

def read_file_content(file_path: Path) -> str:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return ""

async def migrate_problem(user_id: str, problem_dir: Path) -> bool:
    """Migrate a single problem directory to database"""
    problem_name = problem_dir.name

    # Read task.md file
    task_file = problem_dir / "task.md"
    if not task_file.exists():
        print(f"Warning: {problem_name} has no task.md file, skipping")
        return False

    task_description = read_file_content(task_file)

    print(f"Migrating problem: {problem_name}")

    try:
        # Create problem in database
        problem = await DatabaseService.create_problem(
            user_id=user_id,
            name=problem_name,
            task_description=task_description,
            config={}
        )

        problem_id = problem['id']
        print(f"  Created problem with ID: {problem_id}")

        # Migrate all files in the problem directory
        for file_path in problem_dir.rglob("*"):
            if file_path.is_file() and file_path.name != "task.md":  # task.md already handled
                relative_path = file_path.relative_to(problem_dir)
                content = read_file_content(file_path)

                # Determine file type based on name/path
                file_type = "unknown"
                if "output" in file_path.name.lower():
                    file_type = "output"
                elif "progress" in file_path.name.lower():
                    file_type = "progress"
                elif "notes" in file_path.name.lower():
                    file_type = "notes"
                elif "proof" in file_path.name.lower():
                    file_type = "proofs"
                elif file_path.suffix == ".json":
                    file_type = "json_data"
                elif file_path.suffix == ".md":
                    file_type = "markdown"
                elif file_path.suffix == ".txt":
                    file_type = "text"

                # Determine round number from path (basic heuristic)
                round_num = 0
                path_parts = str(relative_path).split(os.sep)
                for part in path_parts:
                    if part.startswith("round-") or part.startswith("r"):
                        try:
                            round_num = int(part.replace("round-", "").replace("r", ""))
                            break
                        except ValueError:
                            pass

                # Save file to database
                success = await DatabaseService.update_problem_file(
                    problem_id=problem_id,
                    file_type=file_type,
                    content=content,
                    round=round_num
                )

                if success:
                    print(f"  Migrated file: {relative_path}")
                else:
                    print(f"  Failed to migrate file: {relative_path}")

        return True

    except Exception as e:
        print(f"Error migrating problem {problem_name}: {e}")
        return False

async def main():
    """Main migration function"""
    print("🚀 Starting migration of local data to Supabase database...")

    # Check database configuration
    if not is_database_configured():
        print("❌ Database not configured. Please check your environment variables.")
        return False

    print("✅ Database configuration found")

    # Get user ID
    try:
        user_id = await get_user_id_by_email(USER_EMAIL)
        print(f"✅ Found user ID: {user_id}")
    except Exception as e:
        print(f"❌ {e}")
        print("\n📋 Next steps:")
        print("1. Go to your frontend application")
        print("2. Sign up/login with vaclavrozhon@gmail.com")
        print("3. Then run this migration script again")
        return False

    # Check if problems directory exists
    if not PROBLEMS_DIR.exists():
        print(f"❌ Problems directory not found: {PROBLEMS_DIR}")
        return False

    print(f"📁 Found problems directory with {len(list(PROBLEMS_DIR.iterdir()))} items")

    # Migrate each problem
    success_count = 0
    failed_count = 0

    for problem_dir in PROBLEMS_DIR.iterdir():
        if problem_dir.is_dir():
            success = await migrate_problem(user_id, problem_dir)
            if success:
                success_count += 1
            else:
                failed_count += 1

    print(f"\n📊 Migration completed:")
    print(f"✅ Successfully migrated: {success_count} problems")
    print(f"❌ Failed to migrate: {failed_count} problems")

    if success_count > 0:
        print(f"\n🎉 Migration successful! Go to your frontend application to see the migrated problems.")

    return success_count > 0

if __name__ == "__main__":
    asyncio.run(main())