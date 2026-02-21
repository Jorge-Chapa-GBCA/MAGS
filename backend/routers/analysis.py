from __future__ import annotations

import uuid
import time
import logging

from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.models.schemas import (
    UploadResponse,
    CreditInfo,
    IdentifyRequest,
    AnalyseRequest,
    AnalysisResult,
)
from backend.services.document_parser import parse_document
from backend.services.reference_loader import get_references
from backend.services.claude_service import identify_credit, analyse_submission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# In-memory session store: session_id -> {doc, timestamp}
_sessions: dict[str, dict] = {}
SESSION_TTL = 3600  # 1 hour


def _cleanup_sessions():
    now = time.time()
    expired = [k for k, v in _sessions.items() if now - v["timestamp"] > SESSION_TTL]
    for k in expired:
        del _sessions[k]


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

    filename = file.filename or "unknown"
    try:
        doc = parse_document(file_bytes, filename)
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
async def identify(req: IdentifyRequest):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    doc = session["doc"]
    try:
        credit = identify_credit(doc.text, doc.filename)
    except Exception as e:
        logger.error(f"Identify error: {e}")
        raise HTTPException(status_code=500, detail=f"Credit identification failed: {e}")

    session["credit_info"] = credit
    session["timestamp"] = time.time()

    return credit


@router.post("/analyse", response_model=AnalysisResult)
async def analyse(req: AnalyseRequest):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")

    doc = session["doc"]
    try:
        result = analyse_submission(doc.text, doc.filename, req.credit_info)
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    session["timestamp"] = time.time()

    return result
