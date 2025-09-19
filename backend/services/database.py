"""
Database service layer for managing problems, files, and runs.

This module provides high-level database operations that abstract
the underlying Supabase queries and handle data transformations.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from ..db import get_db, get_admin_db, is_database_configured
from fastapi import HTTPException


class DatabaseService:
    """Service for database operations on problems, files, and runs"""

    @staticmethod
    async def update_user_last_login(user_id: str) -> bool:
        """
        Update the last_login timestamp for a user.

        Args:
            user_id: UUID of the user

        Returns:
            True if successful, False otherwise
        """
        db = get_db()
        if not db:
            return False

        try:
            # First check if user exists in our users table
            existing_user = db.table('users')\
                .select('id')\
                .eq('id', user_id)\
                .execute()

            if not existing_user.data:
                # User doesn't exist in our table, create a minimal record
                db.table('users').insert({
                    'id': user_id,
                    'last_login': datetime.utcnow().isoformat(),
                    'credits_used': 0.0,
                    'credits_limit': 100.0,
                    'is_active': True
                }).execute()
            else:
                # Update existing user's last_login
                db.table('users')\
                    .update({'last_login': datetime.utcnow().isoformat()})\
                    .eq('id', user_id)\
                    .execute()

            return True
        except Exception as e:
            print(f"Error updating last_login: {e}")
            return False

    @staticmethod
    async def get_problem_by_name(user_id: str, problem_name: str, auth_token: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get a specific problem by name for a user.

        Args:
            user_id: UUID of the user
            problem_name: Name of the problem
            auth_token: JWT token for authenticated requests

        Returns:
            Problem dictionary or None if not found
        """
        from supabase import create_client
        import os

        # Create an authenticated client for this request
        if auth_token:
            db = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_ANON_KEY")
            )
            db.auth.set_session(access_token=auth_token, refresh_token="")
        else:
            db = get_db()
            if not db:
                return None

        try:
            response = db.table('problems')\
                .select('*')\
                .eq('owner_id', user_id)\
                .eq('name', problem_name)\
                .execute()

            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Database error getting problem by name: {e}")
            return None

    @staticmethod
    async def update_problem_status(problem_id: int, status: str, auth_token: Optional[str] = None) -> bool:
        """
        Update the status of a problem.

        Args:
            problem_id: Problem ID
            status: New status (idle, running, completed, failed)
            auth_token: JWT token for authenticated requests

        Returns:
            True if successful, False otherwise
        """
        from supabase import create_client
        import os

        # Create an authenticated client for this request
        if auth_token:
            db = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_ANON_KEY")
            )
            db.auth.set_session(access_token=auth_token, refresh_token="")
        else:
            db = get_db()
            if not db:
                return False

        try:
            response = db.table('problems')\
                .update({'status': status})\
                .eq('id', problem_id)\
                .execute()

            return len(response.data) > 0
        except Exception as e:
            print(f"Database error updating problem status: {e}")
            return False

    @staticmethod
    async def get_user_problems(user_id: str, auth_token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get all problems for a specific user.

        Args:
            user_id: UUID of the user
            auth_token: JWT token for authenticated requests

        Returns:
            List of problem dictionaries
        """
        from supabase import create_client
        import os

        # Create an authenticated client for this request
        if auth_token:
            # Use authenticated client with user's token
            db = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_ANON_KEY")
            )
            db.auth.set_session(access_token=auth_token, refresh_token="")
        else:
            db = get_db()
            if not db:
                return []

        try:
            print(f"🔍 DB DEBUG: querying for authenticated user (not filtering by user_id manually)")
            print(f"🔍 DB DEBUG: using auth_token = {bool(auth_token)}")
            print(f"🔍 DB DEBUG: user_id for reference = {user_id}")

            # Let RLS handle the filtering automatically via auth.uid()
            response = db.table('problems')\
                .select('*')\
                .order('created_at', desc=True)\
                .execute()

            print(f"🔍 DB DEBUG: raw response = {response.data}")
            print(f"🔍 DB DEBUG: response count = {len(response.data) if response.data else 0}")
            return response.data
        except Exception as e:
            print(f"Database error getting user problems: {e}")
            return []

    @staticmethod
    async def create_problem(
        user_id: str,
        name: str,
        task_description: str,
        config: Optional[Dict] = None,
        auth_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new problem with initial task file.

        Args:
            user_id: UUID of the problem owner
            name: Problem name/identifier
            task_description: Problem description text
            config: Optional configuration settings
            auth_token: JWT token for authenticated requests

        Returns:
            Created problem record
        """
        from supabase import create_client
        import os

        # Create an authenticated client for this request
        if auth_token:
            # Use authenticated client with user's token
            db = create_client(
                os.getenv("SUPABASE_URL"),
                os.getenv("SUPABASE_ANON_KEY")
            )
            db.auth.set_session(access_token=auth_token, refresh_token="")
        else:
            db = get_db()
            if not db:
                raise HTTPException(500, "Database not configured")

        try:
            # Create the problem record
            problem_data = {
                'owner_id': user_id,
                'name': name,
                'status': 'idle',
                'current_round': 0,
                'config': config or {}
            }

            problem_response = db.table('problems')\
                .insert(problem_data)\
                .execute()

            if not problem_response.data:
                raise HTTPException(500, "Failed to create problem")

            problem = problem_response.data[0]
            print(f"✅ Created problem: {problem['id']} - {problem['name']}")

            # Create initial files
            initial_files = [
                {
                    'problem_id': problem['id'],
                    'round': 0,
                    'file_type': 'task',
                    'file_name': 'task.txt',
                    'content': task_description
                },
                {
                    'problem_id': problem['id'],
                    'round': 0,
                    'file_type': 'notes',
                    'file_name': 'notes.md',
                    'content': '# Research Notes\n\n'
                },
                {
                    'problem_id': problem['id'],
                    'round': 0,
                    'file_type': 'proofs',
                    'file_name': 'proofs.md',
                    'content': '# Rigorous Proofs\n\n'
                },
                {
                    'problem_id': problem['id'],
                    'round': 0,
                    'file_type': 'output',
                    'file_name': 'output.md',
                    'content': '# Main Results\n\n'
                }
            ]

            # Insert initial files
            db.table('problem_files')\
                .insert(initial_files)\
                .execute()

            return problem

        except HTTPException:
            raise
        except Exception as e:
            print(f"Database error: {e}")
            raise HTTPException(500, f"Database error: {str(e)}")

    @staticmethod
    async def get_problem_by_id(problem_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific problem by ID, ensuring user owns it.

        Args:
            problem_id: Problem ID
            user_id: User ID for ownership check

        Returns:
            Problem record or None
        """
        db = get_db()
        if not db:
            return None

        try:
            response = db.table('problems')\
                .select('*')\
                .eq('id', problem_id)\
                .eq('owner_id', user_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            print(f"Database error: {e}")
            return None

    @staticmethod
    async def get_problem_files(
        problem_id: int,
        round: Optional[int] = None,
        file_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get files for a problem, optionally filtered by round and type.

        Args:
            problem_id: Problem ID
            round: Optional round number filter
            file_type: Optional file type filter

        Returns:
            List of file records
        """
        db = get_db()
        if not db:
            return []

        try:
            query = db.table('problem_files')\
                .select('*')\
                .eq('problem_id', problem_id)

            if round is not None:
                query = query.eq('round', round)

            if file_type:
                query = query.eq('file_type', file_type)

            response = query.order('created_at').execute()
            return response.data
        except Exception as e:
            print(f"Database error: {e}")
            return []

    @staticmethod
    async def save_round_output(
        problem_id: int,
        round: int,
        prover_outputs: List[Dict],
        verifier_output: Dict,
        summarizer_output: Dict,
        metadata: Optional[Dict] = None
    ) -> bool:
        """
        Save all outputs from a research round.

        Args:
            problem_id: Problem ID
            round: Round number
            prover_outputs: List of prover outputs
            verifier_output: Verifier feedback
            summarizer_output: Round summary
            metadata: Optional metadata (timings, costs, etc.)

        Returns:
            True if successful
        """
        db = get_db()
        if not db:
            return False

        try:
            files_to_insert = []

            # Save prover outputs
            for i, prover_output in enumerate(prover_outputs, 1):
                files_to_insert.append({
                    'problem_id': problem_id,
                    'round': round,
                    'file_type': 'prover_output',
                    'file_name': f'prover-{i:02d}.json',
                    'content': json.dumps(prover_output, indent=2),
                    'metadata': metadata
                })

            # Save verifier output
            files_to_insert.append({
                'problem_id': problem_id,
                'round': round,
                'file_type': 'verifier_output',
                'file_name': 'verifier.json',
                'content': json.dumps(verifier_output, indent=2),
                'metadata': metadata
            })

            # Save summarizer output
            files_to_insert.append({
                'problem_id': problem_id,
                'round': round,
                'file_type': 'summarizer_output',
                'file_name': 'summarizer.json',
                'content': json.dumps(summarizer_output, indent=2),
                'metadata': metadata
            })

            # Batch insert all files
            db.table('problem_files')\
                .insert(files_to_insert)\
                .execute()

            # Update problem status
            db.table('problems')\
                .update({
                    'current_round': round,
                    'status': 'running',
                    'updated_at': datetime.utcnow().isoformat()
                })\
                .eq('id', problem_id)\
                .execute()

            return True

        except Exception as e:
            print(f"Database error saving round output: {e}")
            return False

    @staticmethod
    async def create_run(
        problem_id: int,
        parameters: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new run record for tracking execution.

        Args:
            problem_id: Problem ID
            parameters: Run configuration parameters

        Returns:
            Created run record or None
        """
        db = get_db()
        if not db:
            return None

        try:
            run_data = {
                'problem_id': problem_id,
                'status': 'running',
                'parameters': parameters
            }

            response = db.table('runs')\
                .insert(run_data)\
                .execute()

            return response.data[0] if response.data else None

        except Exception as e:
            print(f"Database error creating run: {e}")
            return None

    @staticmethod
    async def update_run(
        run_id: int,
        status: Optional[str] = None,
        total_cost: Optional[float] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Update a run record.

        Args:
            run_id: Run ID
            status: New status
            total_cost: Total cost if completed
            error_message: Error message if failed

        Returns:
            True if successful
        """
        db = get_db()
        if not db:
            return False

        try:
            update_data = {}

            if status:
                update_data['status'] = status

            if total_cost is not None:
                update_data['total_cost'] = total_cost

            if error_message:
                update_data['error_message'] = error_message

            if status in ['completed', 'failed', 'stopped']:
                update_data['completed_at'] = datetime.utcnow().isoformat()

            db.table('runs')\
                .update(update_data)\
                .eq('id', run_id)\
                .execute()

            return True

        except Exception as e:
            print(f"Database error updating run: {e}")
            return False

    @staticmethod
    async def log_usage(
        user_id: str,
        problem_id: Optional[int],
        run_id: Optional[int],
        operation: str,
        model: str,
        tokens_in: int,
        tokens_out: int,
        cost: float
    ) -> bool:
        """
        Log API usage for billing.

        Args:
            user_id: User ID
            problem_id: Optional problem ID
            run_id: Optional run ID
            operation: Operation type
            model: Model used
            tokens_in: Input tokens
            tokens_out: Output tokens
            cost: Cost in credits

        Returns:
            True if successful
        """
        db = get_db()
        if not db:
            return False

        try:
            usage_data = {
                'user_id': user_id,
                'problem_id': problem_id,
                'run_id': run_id,
                'operation': operation,
                'model': model,
                'tokens_in': tokens_in,
                'tokens_out': tokens_out,
                'cost': cost
            }

            db.table('usage_log')\
                .insert(usage_data)\
                .execute()

            # Update user's credits_used
            db.table('users')\
                .update({'credits_used': db.raw(f'credits_used + {cost}')})\
                .eq('id', user_id)\
                .execute()

            return True

        except Exception as e:
            print(f"Database error logging usage: {e}")
            return False

    @staticmethod
    async def delete_problem(problem_id: int, user_id: str) -> bool:
        """
        Delete a problem and all associated data.

        Args:
            problem_id: Problem ID
            user_id: User ID for ownership verification

        Returns:
            True if successful
        """
        db = get_db()
        if not db:
            return False

        try:
            # Verify ownership before deletion
            problem = await DatabaseService.get_problem_by_id(problem_id, user_id)
            if not problem:
                return False

            # Delete problem (cascades to files and runs)
            db.table('problems')\
                .delete()\
                .eq('id', problem_id)\
                .eq('owner_id', user_id)\
                .execute()

            return True

        except Exception as e:
            print(f"Database error deleting problem: {e}")
            return False

    @staticmethod
    async def update_problem_file(
        problem_id: int,
        file_type: str,
        content: str,
        round: int = 0
    ) -> bool:
        """
        Update or create a problem file.

        Args:
            problem_id: Problem ID
            file_type: Type of file
            content: New content
            round: Round number (default 0 for base files)

        Returns:
            True if successful
        """
        db = get_db()
        if not db:
            return False

        try:
            # Check if file exists
            existing = db.table('problem_files')\
                .select('id')\
                .eq('problem_id', problem_id)\
                .eq('file_type', file_type)\
                .eq('round', round)\
                .execute()

            if existing.data:
                # Update existing file
                db.table('problem_files')\
                    .update({'content': content})\
                    .eq('id', existing.data[0]['id'])\
                    .execute()
            else:
                # Create new file
                db.table('problem_files')\
                    .insert({
                        'problem_id': problem_id,
                        'round': round,
                        'file_type': file_type,
                        'file_name': f'{file_type}.md',
                        'content': content
                    })\
                    .execute()

            return True

        except Exception as e:
            print(f"Database error updating file: {e}")
            return False


# Export the service class
__all__ = ['DatabaseService']