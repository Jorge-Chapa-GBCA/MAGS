from __future__ import annotations

import asyncio
import os
import uuid
import time
import logging

from typing import Optional

from anthropic import Anthropic
from fastapi import APIRouter, UploadFile, File, Header, HTTPException

from backend.models.schemas import (
    UploadResponse,
    CreditInfo,
    IdentifyRequest,
    AnalyseRequest,
    AnalysisResult,
    SetupStatusResponse,
    ReferenceUploadResponse,
)
from backend.services.document_parser import parse_document, parse_pdf
from backend.services.reference_loader import (
    get_references,
    store_reference,
    _key_for_filename,
)
from backend.services.claude_service import identify_credit, analyse_submission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB

# In-memory session store: session_id -> {doc, timestamp}
_sessions: dict[str, dict] = {}
SESSION_TTL = 3600  # 1 hour


def _cleanup_sessions():
    now = time.time()
    expired = [k for k, v in _sessions.items() if now - v["timestamp"] > SESSION_TTL]
    for k in expired:
        del _sessions[k]


# ---------------------------------------------------------------------------
# Setup endpoints
# ---------------------------------------------------------------------------

@router.get("/setup/status", response_model=SetupStatusResponse)
async def setup_status(x_api_key: Optional[str] = Header(None)):
    refs = get_references()
    env_key = os.environ.get("ANTHROPIC_API_KEY")
    has_key = bool(x_api_key or env_key)
    ref_info = {k: len(v) for k, v in refs.items()}
    return SetupStatusResponse(
        api_key_set=has_key,
        reference_docs_loaded=ref_info,
        ready=has_key and len(refs) > 0,
    )


@router.post("/setup/upload-reference", response_model=ReferenceUploadResponse)
async def upload_reference(file: UploadFile = File(...)):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")

    filename = file.filename or "unknown.pdf"
    try:
        doc = await asyncio.to_thread(parse_pdf, file_bytes, filename)
    except Exception as e:
        logger.error(f"Reference parse error for {filename}: {e}")
        raise HTTPException(status_code=400, detail=f"Could not parse PDF: {e}")

    key = _key_for_filename(filename)
    store_reference(key, doc.text)

    return ReferenceUploadResponse(
        key=key,
        filename=filename,
        char_count=len(doc.text),
    )


@router.post("/setup/validate-key")
async def validate_key(x_api_key: Optional[str] = Header(None)):
    key = x_api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise HTTPException(status_code=400, detail="No API key provided")

    try:
        client = Anthropic(api_key=key)
        await asyncio.to_thread(
            client.messages.create,
            model="claude-sonnet-4-20250514",
            max_tokens=10,
            messages=[{"role": "user", "content": "Say OK"}],
        )
        return {"valid": True}
    except Exception as e:
        logger.warning(f"API key validation failed: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid API key: {e}")


# ---------------------------------------------------------------------------
# Existing endpoints
# ---------------------------------------------------------------------------

@router.get("/health")
async def health():
    refs = get_references()
    return {
        "status": "ok",
        "reference_docs_loaded": len(refs),
        "reference_docs": list(refs.keys()),
    }


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    _cleanup_sessions()

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")

    filename = file.filename or "unknown"
    try:
        doc = await asyncio.to_thread(parse_document, file_bytes, filename)
    except Exception as e:
        logger.error(f"Parse error for {filename}: {e}")
        raise HTTPException(status_code=400, detail=f"Could not parse file: {e}")

    session_id = str(uuid.uuid4())
    _sessions[session_id] = {
        "doc": doc,
        "timestamp": time.time(),
        "credit_info": None,
    }

    return UploadResponse(
        session_id=session_id,
        filename=doc.filename,
        file_type=doc.file_type,
        page_count=doc.page_count,
        char_count=len(doc.text),
    )


@router.post("/identify", response_model=CreditInfo)
async def identify(req: IdentifyRequest, x_api_key: Optional[str] = Header(None)):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    doc = session["doc"]
    try:
        credit = await asyncio.to_thread(
            identify_credit, doc.text, doc.filename, api_key=x_api_key
        )
    except Exception as e:
        logger.error(f"Identify error: {e}")
        raise HTTPException(status_code=500, detail=f"Credit identification failed: {e}")

    session["credit_info"] = credit
    session["timestamp"] = time.time()

    return credit


@router.post("/analyse", response_model=AnalysisResult)
async def analyse(req: AnalyseRequest, x_api_key: Optional[str] = Header(None)):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    doc = session["doc"]
    try:
        result = await asyncio.to_thread(
            analyse_submission, doc.text, doc.filename, req.credit_info, api_key=x_api_key
        )
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    session["timestamp"] = time.time()

    return result
