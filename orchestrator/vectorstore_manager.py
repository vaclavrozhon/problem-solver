"""
Vector store management for problem papers.

Creates and caches an OpenAI Vector Store per problem directory, uploads
papers once, and returns the vector_store_id for retrieval.
"""

from __future__ import annotations

import json
import hashlib
from pathlib import Path
from typing import List
import time

from openai import OpenAI

client = OpenAI()

META_FN = ".vector_store.json"


def _fingerprint(paths: List[Path]) -> str:
    """Compute a simple fingerprint for a set of files using name, mtime, size."""
    hasher = hashlib.sha256()
    for p in sorted(paths):
        hasher.update(p.name.encode())
        try:
            st = p.stat()
            hasher.update(str(st.st_mtime_ns).encode())
            hasher.update(str(st.st_size).encode())
        except FileNotFoundError:
            # Ignore missing files in fingerprint
            pass
    return hasher.hexdigest()


def _get_vs_client(c: OpenAI):
    """Return the vector stores client regardless of SDK surface.
    Prefer c.beta.vector_stores; fall back to c.vector_stores if available.
    """
    beta = getattr(c, "beta", None)
    if beta and hasattr(beta, "vector_stores"):
        return beta.vector_stores
    if hasattr(c, "vector_stores"):
        return getattr(c, "vector_stores")
    raise RuntimeError(
        "Vector Stores API not available in this SDK/runtime. Upgrade `openai`."
    )


def ensure_vector_store(problem_dir: Path, files: List[Path]) -> str:
    """Create or reuse a vector store for the given problem and files.

    If the file set (by fingerprint) hasn't changed, reuse the existing store id
    from the cached metadata file. Otherwise create a new store and upload files.
    """
    meta_path = problem_dir / META_FN
    corpus_fp = _fingerprint(files)

    if meta_path.exists():
        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            if meta.get("corpus_fp") == corpus_fp and meta.get("vector_store_id"):
                return meta["vector_store_id"]
        except Exception:
            pass

    # Create a new vector store
    vs_client = _get_vs_client(client)
    vs = vs_client.create(name=f"{problem_dir.name}-papers")
    vs_id = vs.id

    # Upload files and wait for indexing
    file_objs = [open(str(p), "rb") for p in files if p.exists()]
    try:
        if file_objs:
            file_batches = getattr(vs_client, "file_batches", None)
            if not file_batches:
                raise RuntimeError("Vector Stores file_batches not available in this SDK.")

            # Prefer upload_and_poll if available
            if hasattr(file_batches, "upload_and_poll"):
                file_batches.upload_and_poll(
                    vector_store_id=vs_id,
                    files=file_objs,
                    # Optional static chunking (tune as needed)
                    # chunking_strategy={
                    #     "type": "static",
                    #     "max_chunk_size_tokens": 800,
                    #     "chunk_overlap_tokens": 200,
                    # },
                )
            else:
                # Fallback: upload then poll until completion if retrieve API exists
                upload_resp = file_batches.upload(vector_store_id=vs_id, files=file_objs)
                batch_id = getattr(upload_resp, "id", None)
                if hasattr(file_batches, "retrieve") and batch_id:
                    while True:
                        cur = file_batches.retrieve(vector_store_id=vs_id, batch_id=batch_id)
                        status = getattr(cur, "status", None) or getattr(cur, "state", None)
                        if status in ("completed", "failed", "cancelled"):
                            break
                        time.sleep(1.0)
    finally:
        for f in file_objs:
            try:
                f.close()
            except Exception:
                pass

    meta = {
        "vector_store_id": vs_id,
        "corpus_fp": corpus_fp,
        "files": [str(p) for p in files],
    }
    try:
        meta_path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    except Exception:
        pass

    return vs_id


