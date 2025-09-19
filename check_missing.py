#!/usr/bin/env python3

from pathlib import Path

PROBLEMS_DIR = Path("problems")

print(f"Total directories: {len(list(PROBLEMS_DIR.iterdir()))}")
print()

missing_task = []
for problem_dir in PROBLEMS_DIR.iterdir():
    if problem_dir.is_dir():
        has_task_md = (problem_dir / "task.md").exists()
        has_task_txt = (problem_dir / "task.txt").exists()

        if not has_task_md and not has_task_txt:
            missing_task.append(problem_dir.name)
            print(f"Missing task file: {problem_dir.name}")
            files = [f.name for f in problem_dir.iterdir() if f.is_file()]
            print(f"  Files: {', '.join(files[:5])}")
            print()

print(f"Total with task files: {40 - len(missing_task)}")
print(f"Missing task files: {len(missing_task)}")