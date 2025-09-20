"""
Database service layer for managing problems, files, and runs.

This module provides high-level database operations that abstract
the underlying Supabase queries and handle data transformations.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import json
from supabase import Client
from ..logging_config import get_logger
from fastapi import HTTPException

logger = get_logger("database")


class DatabaseService:
    """Service for database operations on problems, files, and runs"""

    @staticmethod
    async def update_user_last_login(db: Client, user_id: str) -> bool:
        """
        Update the last_login timestamp for a user profile.

        Args:
            db: Authenticated Supabase client
            user_id: UUID of the user

        Returns:
            True if successful, False otherwise
        """
        try:
            # First check if profile exists
            existing_profile = db.table('profiles')\
                .select('id')\
                .eq('id', user_id)\
                .execute()

            if not existing_profile.data:
                # Profile doesn't exist, create a minimal record
                db.table('profiles').insert({
                    'id': user_id,
                    'credits_used': 0.0,
                    'credits_limit': 100.0,
                    'settings': {}
                }).execute()
            else:
                # Update existing profile's updated_at timestamp
                db.table('profiles')\
                    .update({'updated_at': datetime.utcnow().isoformat()})\
                    .eq('id', user_id)\
                    .execute()

            return True
        except Exception as e:
            logger.error(
                f"Error updating profile: {str(e)}",
                extra={
                    "event_type": "update_profile_error",
                    "user_id": user_id,
                    "error_type": type(e).__name__,
                    "error_details": str(e)
                },
                exc_info=True
            )
            return False

    @staticmethod
    async def get_user_profile(db: Client, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile information.

        Args:
            db: Authenticated Supabase client
            user_id: UUID of the user

        Returns:
            Profile dictionary or None if not found
        """
        try:
            response = db.table('profiles')\
                .select('*')\
                .eq('id', user_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Database error getting user profile: {e}")
            return None

    @staticmethod
    async def update_user_profile(
        db: Client, 
        user_id: str, 
        credits_used: Optional[float] = None,
        credits_limit: Optional[float] = None,
        settings: Optional[Dict] = None
    ) -> bool:
        """
        Update user profile information.

        Args:
            db: Authenticated Supabase client
            user_id: UUID of the user
            credits_used: New credits used amount
            credits_limit: New credits limit
            settings: New settings dictionary

        Returns:
            True if successful, False otherwise
        """
        try:
            update_data = {'updated_at': datetime.utcnow().isoformat()}
            
            if credits_used is not None:
                update_data['credits_used'] = credits_used
            if credits_limit is not None:
                update_data['credits_limit'] = credits_limit
            if settings is not None:
                update_data['settings'] = settings

            response = db.table('profiles')\
                .update(update_data)\
                .eq('id', user_id)\
                .execute()

            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Database error updating user profile: {e}")
            return False

    @staticmethod
    async def get_problem_by_name(db: Client, problem_name: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific problem by name for a user.

        Args:
            db: Authenticated Supabase client
            problem_name: Name of the problem

        Returns:
            Problem dictionary or None if not found
        """
        try:
            # Let RLS handle the filtering automatically via auth.uid()
            response = db.table('problems')\
                .select('*')\
                .eq('name', problem_name)\
                .execute()

            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(
                f"Database error getting problem by name: {str(e)}",
                extra={
                    "event_type": "get_problem_by_name_error",
                    "problem_name": problem_name,
                    "error_type": type(e).__name__,
                    "error_details": str(e)
                },
                exc_info=True
            )
            return None

    @staticmethod
    async def update_problem_status(db: Client, problem_id: int, status: str, current_round: Optional[int] = None) -> bool:
        """
        Update the status of a problem and optionally the current round.

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID
            status: New status (idle, running, completed, failed)
            current_round: Current round number (optional)

        Returns:
            True if successful, False otherwise
        """
        try:
            update_data = {'status': status}
            if current_round is not None:
                update_data['current_round'] = current_round

            response = db.table('problems')\
                .update(update_data)\
                .eq('id', problem_id)\
                .execute()

            return len(response.data) > 0
        except Exception as e:
            logger.error(
                f"Database error updating problem status: {str(e)}",
                extra={
                    "event_type": "update_problem_status_error",
                    "problem_id": problem_id,
                    "status": status,
                    "current_round": current_round,
                    "error_type": type(e).__name__,
                    "error_details": str(e)
                },
                exc_info=True
            )
            return False

    @staticmethod
    async def get_user_problems(db: Client) -> List[Dict[str, Any]]:
        """
        Get all problems for a specific user.

        Args:
            db: Authenticated Supabase client

        Returns:
            List of problem dictionaries
        """
        try:
            # Let RLS handle the filtering automatically via auth.uid()
            response = db.table('problems')\
                .select('*')\
                .order('created_at', desc=True)\
                .execute()

            return response.data
        except Exception as e:
            logger.error(f"Database error getting user problems: {e}")
            return []

    @staticmethod
    async def create_problem(
        db: Client,
        user_id: str,
        name: str,
        task_description: str,
        config: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Create a new problem with initial task file.

        Args:
            db: Authenticated Supabase client
            user_id: UUID of the problem owner
            name: Problem name/identifier
            task_description: Problem description text
            config: Optional configuration settings

        Returns:
            Created problem record
        """
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
            logger.info(f"Created problem: {problem['id']} - {problem['name']}")

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
            logger.error(f"Database error creating problem: {e}")
            raise HTTPException(500, f"Database error: {str(e)}")

    @staticmethod
    async def get_problem_by_id(db: Client, problem_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a specific problem by ID, ensuring user owns it.

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID

        Returns:
            Problem record or None
        """
        try:
            response = db.table('problems')\
                .select('*')\
                .eq('id', problem_id)\
                .single()\
                .execute()
            return response.data
        except Exception as e:
            logger.error(f"Database error getting problem by ID: {e}")
            return None

    @staticmethod
    async def get_problem_files(
        db: Client,
        problem_id: int,
        round: Optional[int] = None,
        file_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get files for a problem, optionally filtered by round and type.

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID
            round: Optional round number filter
            file_type: Optional file type filter

        Returns:
            List of file records
        """
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
            logger.error(f"Database error getting problem files: {e}")
            return []

    @staticmethod
    async def save_round_output(
        db: Client,
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
            db: Authenticated Supabase client
            problem_id: Problem ID
            round: Round number
            prover_outputs: List of prover outputs
            verifier_output: Verifier feedback
            summarizer_output: Round summary
            metadata: Optional metadata (timings, costs, etc.)

        Returns:
            True if successful
        """
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
            logger.error(f"Database error saving round output: {e}")
            return False

    @staticmethod
    async def create_run(
        db: Client,
        problem_id: int,
        parameters: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new run record for tracking execution.

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID
            parameters: Run configuration parameters

        Returns:
            Created run record or None
        """
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
            logger.error(f"Database error creating run: {e}")
            return None

    @staticmethod
    async def update_run(
        db: Client,
        run_id: int,
        status: Optional[str] = None,
        total_cost: Optional[float] = None,
        error_message: Optional[str] = None
    ) -> bool:
        """
        Update a run record.

        Args:
            db: Authenticated Supabase client
            run_id: Run ID
            status: New status
            total_cost: Total cost if completed
            error_message: Error message if failed

        Returns:
            True if successful
        """
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
            logger.error(f"Database error updating run: {e}")
            return False

    @staticmethod
    async def log_usage(
        db: Client,
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
            db: Authenticated Supabase client
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

            # Update user's credits_used in profiles table
            db.table('profiles')\
                .update({'credits_used': db.raw(f'credits_used + {cost}')})\
                .eq('id', user_id)\
                .execute()

            return True

        except Exception as e:
            logger.error(f"Database error logging usage: {e}")
            return False

    @staticmethod
    async def delete_problem(db: Client, problem_id: int) -> bool:
        """
        Delete a problem and all associated data.

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID

        Returns:
            True if successful
        """
        try:
            # Verify ownership before deletion (RLS will handle this)
            problem = await DatabaseService.get_problem_by_id(db, problem_id)
            if not problem:
                return False

            # Delete problem (cascades to files and runs)
            db.table('problems')\
                .delete()\
                .eq('id', problem_id)\
                .execute()

            return True

        except Exception as e:
            logger.error(f"Database error deleting problem: {e}")
            return False

    @staticmethod
    async def update_problem_file(
        db: Client,
        problem_id: int,
        file_type: str,
        content: str,
        round: int = 0
    ) -> bool:
        """
        Update or create a problem file.

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID
            file_type: Type of file
            content: New content
            round: Round number (default 0 for base files)

        Returns:
            True if successful
        """
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
            logger.error(f"Database error updating file: {e}")
            return False

    @staticmethod
    async def create_problem_file(
        db: Client,
        problem_id: int,
        round_num: int,
        file_type: str,
        filename: str,
        content: str,
        metadata: Dict[str, Any] = None
    ) -> bool:
        """
        Create a new problem file (used by orchestrator).

        Args:
            db: Authenticated Supabase client
            problem_id: Problem ID
            round_num: Round number
            file_type: Type of file (prover_output, verifier_output, etc.)
            filename: Original filename
            content: File content
            metadata: Additional metadata (model, tokens, etc.)

        Returns:
            True if successful
        """
        try:
            file_data = {
                'problem_id': problem_id,
                'round': round_num,
                'file_type': file_type,
                'file_name': filename,
                'content': content,
                'metadata': metadata or {}
            }

            response = db.table('problem_files')\
                .insert(file_data)\
                .execute()

            return len(response.data) > 0

        except Exception as e:
            logger.error(
                f"Database error creating problem file: {str(e)}",
                extra={
                    "event_type": "create_problem_file_error",
                    "problem_id": problem_id,
                    "file_type": file_type,
                    "round": round_num,
                    "filename": filename,
                    "error_type": type(e).__name__,
                    "error_details": str(e)
                },
                exc_info=True
            )
            return False


# Export the service class
__all__ = ['DatabaseService']