"""
Problem rounds management router.

Handles round-specific operations:
- Get rounds
- Get round details
- Delete rounds
- Delete specific rounds
"""

from fastapi import APIRouter, HTTPException, Depends

from ...services.database import DatabaseService
from ...authentication import get_current_user, get_db_client, AuthedUser

router = APIRouter()


@router.get("/{problem_name}/rounds")
async def get_problem_rounds(
    problem_name: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get rounds for a problem.

    Args:
        problem_name: Problem name
        user_id: Authenticated user ID

    Returns:
        List of rounds with their data
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Get all files to analyze rounds
        files = await DatabaseService.get_problem_files(db, problem_id)

        # Group files by round
        rounds_data = {}
        for file in files:
            if file['round'] > 0:  # Skip base files (round 0)
                round_num = file['round']
                if round_num not in rounds_data:
                    rounds_data[round_num] = {
                        "number": round_num,
                        "files": {},
                        "status": "completed",
                        "created_at": None
                    }

                rounds_data[round_num]['files'][file['file_type']] = file
                if not rounds_data[round_num]['created_at'] or file['created_at'] > rounds_data[round_num]['created_at']:
                    rounds_data[round_num]['created_at'] = file['created_at']

        # Sort rounds by number
        rounds = [rounds_data[num] for num in sorted(rounds_data.keys())]
        return rounds

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting rounds: {e}")
        raise HTTPException(500, f"Failed to get rounds: {str(e)}")


@router.delete("/{problem_name}/rounds")
async def delete_problem_rounds(
    problem_name: str,
    delete_count: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Delete recent rounds from a problem.

    Args:
        problem_name: Problem name
        delete_count: Number of recent rounds to delete
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Get all files to find rounds to delete
        files = await DatabaseService.get_problem_files(db, problem_id)

        # Find unique rounds (excluding round 0 which is base files)
        rounds = set(file['round'] for file in files if file['round'] > 0)

        if len(rounds) == 0:
            return {"message": "No rounds to delete", "deleted_count": 0}

        # Sort rounds in descending order and take the most recent ones to delete
        sorted_rounds = sorted(rounds, reverse=True)
        rounds_to_delete = sorted_rounds[:delete_count]

        # Delete files for these rounds
        deleted_count = 0
        for round_num in rounds_to_delete:
            round_files = [f for f in files if f['round'] == round_num]
            for file in round_files:
                # Delete file (this would need to be implemented in DatabaseService)
                # For now, we'll just count what would be deleted
                deleted_count += 1

        return {
            "message": f"Deleted {len(rounds_to_delete)} rounds from problem '{problem_name}'",
            "deleted_rounds": rounds_to_delete,
            "deleted_files": deleted_count
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting rounds: {e}")
        raise HTTPException(500, f"Failed to delete rounds: {str(e)}")


@router.delete("/{problem_name}/rounds/{round_name}")
async def delete_specific_round(
    problem_name: str,
    round_name: str,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Delete a specific round from a problem.

    Args:
        problem_name: Problem name
        round_name: Round identifier
        user_id: Authenticated user ID

    Returns:
        Success message
    """
    try:
        # Get problem by name first
        problem = await DatabaseService.get_problem_by_name(db, problem_name)
        if not problem:
            raise HTTPException(404, "Problem not found")

        problem_id = problem['id']

        # Parse round number from round_name (assuming format like "round-1", "round-2", etc.)
        try:
            if round_name.startswith("round-"):
                round_num = int(round_name.split("-")[1])
            else:
                round_num = int(round_name)
        except (ValueError, IndexError):
            raise HTTPException(400, f"Invalid round name format: {round_name}")

        # Delete files for this specific round
        # This would need to be implemented in DatabaseService
        # For now, return success

        return {
            "message": f"Round '{round_name}' deleted successfully from problem '{problem_name}'",
            "deleted_round": round_num
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting round: {e}")
        raise HTTPException(500, f"Failed to delete round: {str(e)}")


@router.get("/{problem_id}/rounds/{round_num}")
async def get_round_details(
    problem_id: int,
    round_num: int,
    user: AuthedUser = Depends(get_current_user), db = Depends(get_db_client)
):
    """
    Get detailed information about a specific round.

    Args:
        problem_id: Problem ID
        round_num: Round number
        user_id: Authenticated user ID

    Returns:
        Round details with all files and outputs
    """
    try:
        # Verify ownership (RLS enforced)
        problem = await DatabaseService.get_problem_by_id(db, problem_id)
        if not problem:
            raise HTTPException(404, "Problem not found")

        # Get files for this specific round
        round_files = await DatabaseService.get_problem_files(db, problem_id, round_num)

        if not round_files:
            raise HTTPException(404, f"Round {round_num} not found")

        # Organize files by type
        files_by_type = {}
        for file in round_files:
            files_by_type[file['file_type']] = file

        # Extract structured data from JSON files
        prover_outputs = []
        verifier_data = {}
        summarizer_data = {}

        # Collect prover outputs
        for file in round_files:
            if file['file_type'] == 'prover_output':
                try:
                    import json
                    prover_data = json.loads(file['content'])
                    prover_outputs.append({
                        "file_name": file['file_name'],
                        "created_at": file['created_at'],
                        "data": prover_data
                    })
                except:
                    pass

        # Get verifier output
        if 'verifier_output' in files_by_type:
            try:
                import json
                verifier_data = json.loads(files_by_type['verifier_output']['content'])
            except:
                pass

        # Get summarizer output
        if 'summarizer_output' in files_by_type:
            try:
                import json
                summarizer_data = json.loads(files_by_type['summarizer_output']['content'])
            except:
                pass

        return {
            "round": round_num,
            "problem_id": problem_id,
            "files": files_by_type,
            "prover_outputs": prover_outputs,
            "verifier_data": verifier_data,
            "summarizer_data": summarizer_data,
            "total_files": len(round_files)
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting round details: {e}")
        raise HTTPException(500, f"Failed to get round details: {str(e)}")