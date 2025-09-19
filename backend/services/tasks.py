"""
Task management service - database-only implementation.

This service provides task management using Supabase database storage.
All filesystem references have been removed.
"""

from typing import Optional
from fastapi import HTTPException

from ..config import is_database_configured
from ..services.database import DatabaseService


class TaskService:
    """Service for managing research tasks using database storage"""

    @staticmethod
    async def create_problem(
        name: str,
        task_description: str,
        user_id: str,
        task_type: str = "txt"
    ) -> str:
        """
        Create a new problem/solving task using database storage.

        Args:
            name: Problem name
            task_description: Problem description
            user_id: User ID (required)
            task_type: File type (stored in config)

        Returns:
            Problem ID as string
        """
        if not is_database_configured():
            raise HTTPException(503, "Database not configured")

        if not user_id:
            raise HTTPException(400, "User ID required")

        try:
            problem = await DatabaseService.create_problem(
                user_id=user_id,
                name=name,
                task_description=task_description,
                config={"task_type": task_type}
            )
            return str(problem['id'])  # Return problem ID as string

        except Exception as e:
            print(f"Database error in create_problem: {e}")
            raise HTTPException(500, f"Failed to create problem: {str(e)}")

    @staticmethod
    async def create_draft(
        name: str,
        task_description: str,
        user_id: str
    ) -> str:
        """
        Create a new draft/writing task using database storage.

        Args:
            name: Draft name
            task_description: Task description
            user_id: User ID (required)

        Returns:
            Problem ID as string (drafts are stored as problems with type 'draft')
        """
        if not is_database_configured():
            raise HTTPException(503, "Database not configured")

        if not user_id:
            raise HTTPException(400, "User ID required")

        try:
            # Create LaTeX content
            tex_content = f"""% {task_description}

\\documentclass{{article}}
\\usepackage{{amsmath}}
\\usepackage{{amsfonts}}
\\usepackage{{amssymb}}
\\usepackage{{amsthm}}
\\usepackage{{geometry}}
\\geometry{{margin=1in}}

\\title{{{name}}}
\\author{{Automatic Researcher}}
\\date{{\\today}}

\\begin{{document}}

\\maketitle

% Task description: {task_description}

\\section{{Introduction}}

TODO: Write introduction

\\end{{document}}"""

            # Create problem with draft configuration
            problem = await DatabaseService.create_problem(
                user_id=user_id,
                name=name,
                task_description=task_description,
                config={"type": "draft", "task_type": "tex"}
            )

            # Add the LaTeX file
            await DatabaseService.update_problem_file(
                problem_id=problem['id'],
                file_type='draft_tex',
                content=tex_content,
                round=0
            )

            return str(problem['id'])

        except Exception as e:
            print(f"Database error in create_draft: {e}")
            raise HTTPException(500, f"Failed to create draft: {str(e)}")

    @staticmethod
    async def delete_problem(name: str, user_id: str) -> bool:
        """
        Delete a problem and all its associated data using database storage.

        Args:
            name: Problem name or ID
            user_id: User ID (required)

        Returns:
            True if successful
        """
        if not is_database_configured():
            raise HTTPException(503, "Database not configured")

        if not user_id:
            raise HTTPException(400, "User ID required")

        try:
            # Try to parse name as problem ID first
            try:
                problem_id = int(name)
                return await DatabaseService.delete_problem(problem_id, user_id)
            except ValueError:
                # If not a valid integer, treat as name and find by name
                problems = await DatabaseService.get_user_problems(user_id)
                for problem in problems:
                    if problem['name'] == name:
                        return await DatabaseService.delete_problem(problem['id'], user_id)

                raise HTTPException(404, f"Problem '{name}' not found")

        except HTTPException:
            raise
        except Exception as e:
            print(f"Database error in delete_problem: {e}")
            raise HTTPException(500, f"Failed to delete problem: {str(e)}")

    @staticmethod
    async def reset_problem(problem_id: int, user_id: str) -> bool:
        """
        Reset a problem - keep task description, delete all round data.

        Args:
            problem_id: Problem ID
            user_id: User ID for ownership verification

        Returns:
            True if successful
        """
        if not is_database_configured():
            raise HTTPException(503, "Database not configured")

        if not user_id:
            raise HTTPException(400, "User ID required")

        try:
            # Verify ownership
            problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
            if not problem:
                raise HTTPException(404, "Problem not found")

            # Get all files to identify what to delete/reset
            files = await DatabaseService.get_problem_files(problem_id)

            # Reset base files to initial state
            base_files_to_reset = ['notes', 'proofs', 'output']
            for file_type in base_files_to_reset:
                initial_content = {
                    'notes': '# Research Notes\n\n',
                    'proofs': '# Rigorous Proofs\n\n',
                    'output': '# Main Results\n\n'
                }.get(file_type, '')

                await DatabaseService.update_problem_file(
                    problem_id=problem_id,
                    file_type=file_type,
                    content=initial_content,
                    round=0
                )

            # TODO: Delete all round files (round > 0)
            # This would require extending DatabaseService with a method to delete files by round
            # For now, we just reset the problem status

            # Reset problem status
            # TODO: Add update_problem method to DatabaseService
            # For now, this is a placeholder

            return True

        except HTTPException:
            raise
        except Exception as e:
            print(f"Database error in reset_problem: {e}")
            raise HTTPException(500, f"Failed to reset problem: {str(e)}")


# Export the service class
__all__ = ['TaskService']