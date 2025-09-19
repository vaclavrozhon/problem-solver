#!/usr/bin/env python3
"""
Preview script to show what would be migrated
"""

from pathlib import Path

PROBLEMS_DIR = Path(__file__).parent / "problems"

def read_file_content(file_path: Path) -> str:
    """Read file content safely"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return ""

def preview_migration():
    """Show preview of what would be migrated"""
    print("🚀 Migration Preview...")

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

    # Show preview of what will be created
    print(f"\n📋 Preview of problems to be migrated:")
    print("=" * 60)

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

        print(f"\n{i}. Problem: {problem_name}")
        print(f"   Task file: {task_file.name}")
        print(f"   Task description length: {len(task_description)} characters")
        print(f"   Task preview: {task_description[:100]}{'...' if len(task_description) > 100 else ''}")

        # Show additional files that would be included
        additional_files = []
        for file_path in problem_dir.iterdir():
            if file_path.is_file() and file_path.name not in ["task.md", "task.txt", "task.tex"]:
                additional_files.append(file_path.name)

        if additional_files:
            print(f"   Additional files: {', '.join(additional_files)}")
        else:
            print(f"   Additional files: None")

    print("=" * 60)
    print(f"\nTotal: {len(valid_problems)} problems ready for migration")

    return True

if __name__ == "__main__":
    preview_migration()