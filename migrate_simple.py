#!/usr/bin/env python3
"""
Simple migration script that uses Supabase client directly to bypass RLS
"""

import os
from pathlib import Path
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# User ID for vaclavrozhon@gmail.com
USER_ID = "facb18e8-b837-4dc6-9c1c-8e4bb18662da"
PROBLEMS_DIR = Path(__file__).parent / "problems"

def get_supabase_admin_client():
    """Get Supabase client with admin privileges"""
    supabase_url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not service_key:
        raise Exception("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

    return create_client(supabase_url, service_key)

def read_file_content(file_path: Path) -> str:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return ""

def migrate_problem(supabase, problem_dir: Path) -> bool:
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
        # Create problem in database (bypassing RLS)
        problem_data = {
            'owner_id': USER_ID,
            'name': problem_name,
            'status': 'idle',
            'current_round': 0,
            'config': {}
        }

        # Use RPC or direct insert with service key
        response = supabase.table('problems').insert(problem_data).execute()

        if not response.data:
            print(f"  Failed to create problem {problem_name}")
            return False

        problem_id = response.data[0]['id']
        print(f"  Created problem with ID: {problem_id}")

        # Create initial files
        initial_files = [
            {
                'problem_id': problem_id,
                'round': 0,
                'file_type': 'task',
                'file_name': 'task.md',
                'content': task_description
            }
        ]

        # Add other files if they exist
        for file_name, file_type in [
            ('notes.md', 'notes'),
            ('output.md', 'output'),
            ('progress.md', 'progress'),
            ('summary.md', 'summary')
        ]:
            file_path = problem_dir / file_name
            if file_path.exists():
                content = read_file_content(file_path)
                initial_files.append({
                    'problem_id': problem_id,
                    'round': 0,
                    'file_type': file_type,
                    'file_name': file_name,
                    'content': content
                })

        # Insert files
        if initial_files:
            supabase.table('problem_files').insert(initial_files).execute()
            print(f"  Migrated {len(initial_files)} files")

        return True

    except Exception as e:
        print(f"Error migrating problem {problem_name}: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 Starting simple migration...")

    try:
        supabase = get_supabase_admin_client()
        print("✅ Supabase admin client created")
    except Exception as e:
        print(f"❌ Could not create Supabase client: {e}")
        return False

    if not PROBLEMS_DIR.exists():
        print(f"❌ Problems directory not found: {PROBLEMS_DIR}")
        return False

    # Count problems with task.md
    valid_problems = []
    for problem_dir in PROBLEMS_DIR.iterdir():
        if problem_dir.is_dir() and (problem_dir / "task.md").exists():
            valid_problems.append(problem_dir)

    print(f"📁 Found {len(valid_problems)} problems with task.md files")

    if not valid_problems:
        print("❌ No valid problems found")
        return False

    # Migrate each problem
    success_count = 0
    for problem_dir in valid_problems:
        if migrate_problem(supabase, problem_dir):
            success_count += 1

    print(f"\n📊 Migration completed:")
    print(f"✅ Successfully migrated: {success_count} problems")
    print(f"❌ Failed to migrate: {len(valid_problems) - success_count} problems")

    if success_count > 0:
        print(f"\n🎉 Migration successful! Check your frontend application.")

    return success_count > 0

if __name__ == "__main__":
    main()