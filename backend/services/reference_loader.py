from __future__ import annotations

import os
import re
import glob
import logging

from backend.services.document_parser import parse_pdf

logger = logging.getLogger(__name__)

# Module-level cache for parsed reference documents
_reference_docs: dict[str, str] = {}

# Map filename patterns to short keys
KEY_PATTERNS = [
    ("Assessment Panel Manual", "assessment_panel_manual"),
    ("Common Language Guide", "common_language_guide"),
    ("Submission Guidelines", "submission_guidelines"),
    ("Submission_Guidelines", "submission_guidelines"),
]


def _key_for_filename(filename: str) -> str:
    base_key = None
    for pattern, key in KEY_PATTERNS:
        if pattern.lower() in filename.lower():
            base_key = key
            break

    if base_key is None:
        return os.path.splitext(filename)[0]

    # Extract version number if present (e.g. v1.2, v1.3)
    version_match = re.search(r'v(\d+\.?\d*)', filename, re.IGNORECASE)
    if version_match:
        version = version_match.group(1)
        return f"{base_key}_v{version}"

    return base_key


def load_references(base_dir: str | None = None) -> dict[str, str]:
    global _reference_docs

    if base_dir is None:
        base_dir = os.path.join(os.path.dirname(__file__), "..", "..")

    pdf_files = glob.glob(os.path.join(base_dir, "*.pdf"))
    if not pdf_files:
        logger.warning(f"No reference PDFs found in {base_dir}")
        return _reference_docs

    loaded = 0
    for filepath in sorted(pdf_files):
        filename = os.path.basename(filepath)
        key = _key_for_filename(filename)

        try:
            with open(filepath, "rb") as f:
                file_bytes = f.read()
            doc = parse_pdf(file_bytes, filename)
            _reference_docs[key] = doc.text
            loaded += 1
            logger.info(f"Loaded reference: {filename} -> '{key}' ({len(doc.text)} chars, {doc.page_count} pages)")
        except Exception as e:
            logger.error(f"Failed to load {filename}: {e}")

    logger.info(f"Loaded {loaded} reference document(s): {list(_reference_docs.keys())}")
    return _reference_docs


def get_references() -> dict[str, str]:
    return _reference_docs


def get_reference(key: str) -> str:
    return _reference_docs.get(key, "")


def get_references_by_prefix(prefix: str) -> dict[str, str]:
    """Get all reference docs whose key starts with a given prefix."""
    return {k: v for k, v in _reference_docs.items() if k.startswith(prefix)}
