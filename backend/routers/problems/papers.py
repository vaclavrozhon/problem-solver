"""
Problem papers router (DB-only).

Provides endpoints to upload plain-text papers (md/tex/txt treated as text)
and to ingest papers from a URL. Files are stored in the database under
problem_files with file_type='paper' and round=0, with original filename and
description recorded in the metadata column.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional

from ...services.database import DatabaseService
from ...authentication import get_current_user, get_db_client, AuthedUser

router = APIRouter()


@router.post("/{problem_name}/papers/upload")
async def upload_problem_paper(
    problem_name: str,
    file: UploadFile = File(...),
    description: Optional[str] = Form(None),
    user: AuthedUser = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """
    Upload a plain-text paper (md/tex/txt or any text) and store in DB.

    - Stored under problem_files with file_type='paper' and round=0.
    - Metadata includes original filename and optional description.
    """
    # Verify problem
    problem = await DatabaseService.get_problem_by_name(db, problem_name)
    if not problem:
        raise HTTPException(404, "Problem not found")

    problem_id = int(problem["id"])  # type: ignore

    # Read and decode as UTF-8 text
    try:
        raw = await file.read()
        text = raw.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        raise HTTPException(400, "Uploaded file is not valid UTF-8 text")
    except Exception as e:
        raise HTTPException(400, f"Failed to read uploaded file: {str(e)}")

    metadata = {
        "filename": file.filename or "unknown.txt",
        "description": description or "",
        "source": "upload",
    }

    ok = await DatabaseService.create_problem_file(
        db=db,
        problem_id=problem_id,
        round_num=0,
        file_type="paper",
        filename=file.filename or "paper.txt",
        content=text,
        metadata=metadata,
    )
    if not ok:
        raise HTTPException(500, "Failed to store paper in database")

    return {
        "message": "Paper uploaded",
        "problem_id": problem_id,
        "file_name": file.filename,
        "metadata": metadata,
    }


@router.post("/{problem_name}/papers/from-url")
async def add_problem_paper_from_url(
    problem_name: str,
    request: dict,
    user: AuthedUser = Depends(get_current_user),
    db = Depends(get_db_client)
):
    """
    Fetch a text resource from a URL and store it as a paper in DB.

    Request JSON: { "url": string, "description"?: string }
    """
    url = (request or {}).get("url")
    description = (request or {}).get("description") or None
    if not url or not isinstance(url, str):
        raise HTTPException(400, "Field 'url' is required and must be a string")

    # Verify problem
    problem = await DatabaseService.get_problem_by_name(db, problem_name)
    if not problem:
        raise HTTPException(404, "Problem not found")
    problem_id = int(problem["id"])  # type: ignore

    # Fetch URL content as text
    try:
        import httpx
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            text = resp.text  # httpx will decode using charset if provided
    except Exception as e:
        raise HTTPException(400, f"Failed to fetch URL: {str(e)}")

    # Derive filename from URL path
    try:
        from urllib.parse import urlparse
        import os as _os
        parsed = urlparse(url)
        base = _os.path.basename(parsed.path) or "paper_from_url.txt"
    except Exception:
        base = "paper_from_url.txt"

    metadata = {
        "filename": base,
        "description": description or "",
        "source": "url",
        "url": url,
    }

    ok = await DatabaseService.create_problem_file(
        db=db,
        problem_id=problem_id,
        round_num=0,
        file_type="paper",
        filename=base,
        content=text,
        metadata=metadata,
    )
    if not ok:
        raise HTTPException(500, "Failed to store paper in database")

    return {
        "message": "Paper added from URL",
        "problem_id": problem_id,
        "file_name": base,
        "metadata": metadata,
    }


