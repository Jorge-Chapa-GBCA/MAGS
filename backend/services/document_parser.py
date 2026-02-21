import io

import fitz  # pymupdf
from docx import Document as DocxDocument
from openpyxl import load_workbook

from backend.models.schemas import ParsedDocument


def parse_pdf(file_bytes: bytes, filename: str) -> ParsedDocument:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    text = "\n\n".join(pages)
    return ParsedDocument(
        filename=filename,
        file_type="pdf",
        text=text,
        page_count=len(doc),
        metadata={"title": doc.metadata.get("title", "")},
    )


def parse_docx(file_bytes: bytes, filename: str) -> ParsedDocument:
    doc = DocxDocument(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    text = "\n".join(paragraphs)

    # Also extract tables
    for table in doc.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells]
            text += "\n" + " | ".join(cells)

    return ParsedDocument(
        filename=filename,
        file_type="docx",
        text=text,
        page_count=max(1, len(paragraphs) // 40),
    )


def parse_xlsx(file_bytes: bytes, filename: str) -> ParsedDocument:
    wb = load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
    lines = []
    sheet_count = 0
    for sheet_name in wb.sheetnames:
        sheet_count += 1
        ws = wb[sheet_name]
        lines.append(f"=== Sheet: {sheet_name} ===")
        for row in ws.iter_rows(values_only=True):
            cells = [str(c) if c is not None else "" for c in row]
            if any(cells):
                lines.append(" | ".join(cells))
    text = "\n".join(lines)
    return ParsedDocument(
        filename=filename,
        file_type="xlsx",
        text=text,
        page_count=sheet_count,
    )


def parse_text(file_bytes: bytes, filename: str) -> ParsedDocument:
    text = file_bytes.decode("utf-8", errors="replace")
    return ParsedDocument(
        filename=filename,
        file_type="txt",
        text=text,
        page_count=1,
    )


def parse_document(file_bytes: bytes, filename: str) -> ParsedDocument:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext == "pdf":
        return parse_pdf(file_bytes, filename)
    elif ext in ("docx", "doc"):
        return parse_docx(file_bytes, filename)
    elif ext in ("xlsx", "xls"):
        return parse_xlsx(file_bytes, filename)
    else:
        return parse_text(file_bytes, filename)
