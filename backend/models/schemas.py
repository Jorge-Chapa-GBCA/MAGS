from __future__ import annotations

from pydantic import BaseModel


class ParsedDocument(BaseModel):
    filename: str
    file_type: str
    text: str
    page_count: int
    metadata: dict = {}


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    file_type: str
    page_count: int
    char_count: int


class CreditInfo(BaseModel):
    credit_id: str
    credit_name: str
    rating_tool: str
    confidence: float
    summary: str


class IdentifyRequest(BaseModel):
    session_id: str


class AnalyseRequest(BaseModel):
    session_id: str
    credit_info: CreditInfo


class Finding(BaseModel):
    id: str
    category: str  # structural | content | terminology
    severity: str  # critical | warning | info
    title: str
    description: str
    location: str = ""
    suggestion: str = ""
    reference: str = ""


class AnalysisResult(BaseModel):
    overall_score: int
    summary: str
    findings: list[Finding]
    strengths: list[str]
