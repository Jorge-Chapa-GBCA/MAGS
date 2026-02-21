from __future__ import annotations

import json
import re
import logging
import os
from typing import Optional

from anthropic import Anthropic
from dotenv import load_dotenv

from backend.models.schemas import CreditInfo, AnalysisResult, Finding
from backend.services.reference_loader import get_reference, get_references_by_prefix

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Deterministic scoring: derive overall_score from findings + strengths
# ---------------------------------------------------------------------------
SEVERITY_PENALTIES = {
    "major_nc": 25,
    "minor_nc": 7,
    "general": 2,
}
STRENGTH_BONUS = 2
STRENGTH_BONUS_CAP = 10


def compute_score(findings: list[Finding], strengths: list[str]) -> int:
    """Compute a 0-100 compliance score from findings and strengths."""
    score = 100
    for f in findings:
        score -= SEVERITY_PENALTIES.get(f.severity, 0)
    score += min(len(strengths) * STRENGTH_BONUS, STRENGTH_BONUS_CAP)
    return max(0, min(score, 100))

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

MODEL = "claude-sonnet-4-20250514"

# Env-level key loaded once at import time
_env_api_key: Optional[str] = os.environ.get("ANTHROPIC_API_KEY")


def _get_client(api_key: Optional[str] = None) -> Anthropic:
    """Return an Anthropic client using the supplied key, falling back to .env key."""
    key = api_key or _env_api_key
    if not key:
        raise ValueError("No API key provided and none found in environment")
    return Anthropic(api_key=key)


def _parse_json(text: str) -> dict:
    """3-tier JSON parsing fallback: direct → strip markdown fencing → regex extract."""
    # Tier 1: direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Tier 2: strip markdown fencing
    stripped = re.sub(r"^```(?:json)?\s*", "", text.strip())
    stripped = re.sub(r"\s*```$", "", stripped)
    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    # Tier 3: regex extract first JSON object
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not parse JSON from response: {text[:200]}")


def identify_credit(doc_text: str, filename: str, api_key: Optional[str] = None) -> CreditInfo:
    guidelines_docs = get_references_by_prefix("submission_guidelines")

    # Include excerpts from all available guideline versions
    max_per_version = 15000 // max(len(guidelines_docs), 1)
    guidelines_context = ""
    for key, text in sorted(guidelines_docs.items()):
        version_label = key.replace("submission_guidelines", "Submission Guidelines").replace("_", " ")
        guidelines_context += f"\n--- {version_label} (excerpt) ---\n{text[:max_per_version]}\n"

    doc_excerpt = doc_text[:5000]

    system_prompt = f"""You are a Green Star certification expert working for the Green Building Council of Australia (GBCA).

You have deep knowledge of Green Star rating tools and credits. Use the following Submission Guidelines as reference:
{guidelines_context}
--- END GUIDELINES ---

Your task: Analyse the uploaded document and identify which Green Star credit it relates to.

Respond ONLY with a valid JSON object (no markdown, no explanation):
{{"credit_id": "e.g. Energy-1", "credit_name": "Full credit name", "rating_tool": "e.g. Green Star - Design & As Built v1.3", "project_name": "The project/building name if mentioned", "confidence": 0.0, "summary": "Brief description of what this submission covers"}}"""

    client = _get_client(api_key)
    response = client.messages.create(
        model=MODEL,
        max_tokens=1000,
        temperature=0,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Filename: {filename}\n\nDocument content:\n{doc_excerpt}",
            }
        ],
    )

    text = "".join(block.text for block in response.content if hasattr(block, "text"))
    data = _parse_json(text)

    return CreditInfo(
        credit_id=data.get("credit_id", "???"),
        credit_name=data.get("credit_name", "Unknown Credit"),
        rating_tool=data.get("rating_tool", "Unknown"),
        project_name=data.get("project_name", ""),
        confidence=float(data.get("confidence", 0)),
        summary=data.get("summary", ""),
    )


def analyse_submission(
    doc_text: str, filename: str, credit_info: CreditInfo, api_key: Optional[str] = None
) -> AnalysisResult:
    assessment_manual = get_reference("assessment_panel_manual")
    common_language = get_reference("common_language_guide")
    guidelines_docs = get_references_by_prefix("submission_guidelines")

    # Build reference context — truncate each to fit within token limits
    max_ref_chars = 10000
    ref_context = ""
    max_per_version = max_ref_chars // max(len(guidelines_docs), 1)
    for key, text in sorted(guidelines_docs.items()):
        version_label = key.replace("submission_guidelines", "Submission Guidelines").replace("_", " ")
        ref_context += f"\n--- {version_label} (excerpt) ---\n{text[:max_per_version]}\n"
    if assessment_manual:
        ref_context += f"\n--- ASSESSMENT PANEL MANUAL (excerpt) ---\n{assessment_manual[:max_ref_chars]}\n"
    if common_language:
        ref_context += f"\n--- COMMON LANGUAGE GUIDE (excerpt) ---\n{common_language[:max_ref_chars]}\n"

    doc_excerpt = doc_text[:10000]

    system_prompt = f"""You are a senior Green Star assessor for the Green Building Council of Australia (GBCA).

You are reviewing a submission for "{credit_info.credit_name}" ({credit_info.credit_id}) under the {credit_info.rating_tool} rating tool.

Use the following GBCA reference documents to inform your assessment:
{ref_context}
--- END REFERENCE DOCUMENTS ---

Check the submission for compliance across three categories:
1. STRUCTURAL: Missing sections, incorrect templates, formatting issues, missing required forms
2. CONTENT: Evidence gaps, unsubstantiated claims, missing calculations, incomplete data
3. TERMINOLOGY: Non-standard terms vs GBCA common language, incorrect credit references

For each finding, assign a severity:
- major_nc: Major non-conformance — will definitely cause assessment issues or rejection
- minor_nc: Minor non-conformance — may cause queries or delays
- general: General issue — minor improvement suggestions

Respond ONLY with a valid JSON object (no markdown, no explanation):
{{"summary": "2-3 sentence overview", "findings": [{{"id": "F1", "category": "structural|content|terminology", "severity": "major_nc|minor_nc|general", "title": "Short title", "description": "Detailed issue description", "location": "Where in the document", "suggestion": "How to fix it", "reference": "Relevant guideline reference"}}], "strengths": ["List of things done well"]}}"""

    client = _get_client(api_key)
    response = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        temperature=0,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Filename: {filename}\n\nSubmission content:\n{doc_excerpt}",
            }
        ],
    )

    text = "".join(block.text for block in response.content if hasattr(block, "text"))
    data = _parse_json(text)

    findings = []
    for f in data.get("findings", []):
        findings.append(
            Finding(
                id=f.get("id", "F?"),
                category=f.get("category", "content"),
                severity=f.get("severity", "general"),
                title=f.get("title", "Untitled"),
                description=f.get("description", ""),
                location=f.get("location", ""),
                suggestion=f.get("suggestion", ""),
                reference=f.get("reference", ""),
            )
        )

    strengths = data.get("strengths", [])

    return AnalysisResult(
        overall_score=compute_score(findings, strengths),
        summary=data.get("summary", "Analysis complete."),
        findings=findings,
        strengths=strengths,
    )
