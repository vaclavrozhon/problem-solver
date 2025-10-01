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
from ...logging_config import get_logger
from ...authentication import get_current_user, get_db_client, AuthedUser

logger = get_logger("automatic_researcher.routers.problems.rounds")
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

        # Group files by round and shape into frontend structure
        rounds_index: dict[int, dict] = {}
        for f in files:
            try:
                rnum = int(f.get('round') or 0)
            except Exception:
                rnum = 0
            if rnum <= 0:
                continue
            if rnum not in rounds_index:
                rounds_index[rnum] = {
                    "name": f"round-{rnum:04d}",
                    "number": rnum,
                    "status": "completed",
                    "provers": [],
                    "verifier": "",
                    "summary": "",
                    "one_line_summary": None,
                }
            # Accumulate by file type
            ftype = f.get('file_type')
            content = f.get('content') or ""
            if ftype == 'prover_output':
                try:
                    import json as _json
                    data = _json.loads(content)
                    text = data.get('content') or content
                except Exception:
                    text = content
                rounds_index[rnum]['provers'].append({
                    "name": f.get('file_name') or "prover",
                    "content": text
                })
            elif ftype == 'verifier_output':
                try:
                    import json as _json
                    data = _json.loads(content)
                    rounds_index[rnum]['verifier'] = data.get('feedback_md') or data.get('feedback') or content
                    if data.get('verdict'):
                        rounds_index[rnum]['verdict'] = data.get('verdict')
                except Exception:
                    rounds_index[rnum]['verifier'] = content
            elif ftype == 'summarizer_output':
                try:
                    import json as _json
                    data = _json.loads(content)
                    rounds_index[rnum]['summary'] = data.get('summary_md') or data.get('summary') or content
                    rounds_index[rnum]['one_line_summary'] = data.get('one_line_summary')
                except Exception:
                    rounds_index[rnum]['summary'] = content

        # Return rounds sorted by number
        rounds_list = [rounds_index[k] for k in sorted(rounds_index.keys())]
        return rounds_list

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Get rounds failed", extra={"event_type": "rounds_list_error", "problem_name": problem_name, "error_type": type(e).__name__, "error_details": str(e)})
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

        # Enforce idle state per request
        if (problem.get('status') or 'idle') != 'idle':
            raise HTTPException(400, "Problem must be idle to delete rounds")

        # Get all files to find rounds to delete
        files = await DatabaseService.get_problem_files(db, problem_id)

        # Find unique rounds (excluding round 0 which is base files)
        rounds = sorted({int(file['round']) for file in files if int(file['round']) > 0}, reverse=True)

        if len(rounds) == 0:
            return {"message": "No rounds to delete", "deleted_count": 0}

        # Take the most recent ones to delete
        rounds_to_delete = rounds[:max(0, int(delete_count))]

        # Delete in DB
        deleted_count = await DatabaseService.delete_problem_rounds(db, problem_id, rounds_to_delete)

        # Update current_round to new max
        new_max = await DatabaseService.get_max_round(db, problem_id)
        await DatabaseService.update_problem_status(db, problem_id, "idle", new_max)

        return {
            "message": f"Deleted {len(rounds_to_delete)} round(s) from problem '{problem_name}'",
            "deleted_rounds": rounds_to_delete,
            "deleted_files": deleted_count,
            "current_round": new_max
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Delete rounds failed", extra={"event_type": "rounds_delete_error", "problem_name": problem_name, "delete_count": delete_count, "error_type": type(e).__name__, "error_details": str(e)})
        raise HTTPException(500, f"Failed to delete rounds: {str(e)}")


# Single-round delete endpoint removed; use latest-N delete endpoint instead.


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
        logger.error("Get round details failed", extra={"event_type": "round_details_error", "problem_id": problem_id, "round_num": round_num, "error_type": type(e).__name__, "error_details": str(e)})
        raise HTTPException(500, f"Failed to get round details: {str(e)}")