"""Resume Parser Tool - Extracts and structures text from resume files."""

import re
from pathlib import Path
from typing import Union


class ResumeParser:
    """Tool to parse resume files and extract structured information."""

    def __init__(self):
        self.sections = {
            "experience": r"(?:experience|work history|employment)",
            "education": r"(?:education|academic background|qualifications)",
            "skills": r"(?:skills|technical skills|competencies)",
            "projects": r"(?:projects|portfolio|work samples)",
        }

    def parse(self, file_path: Union[str, Path]) -> dict:
        """Parse a resume file and return structured data.

        Args:
            file_path: Path to the resume file (PDF, TXT, or MD)

        Returns:
            Dictionary with extracted text and metadata
        """
        file_path = Path(file_path)

        if not file_path.exists():
            raise FileNotFoundError(f"Resume file not found: {file_path}")

        # Extract text based on file type
        text = self._extract_text(file_path)

        # Structure the extracted text
        structured_data = self._structure_text(text)

        return {
            "filename": file_path.name,
            "content": text,
            "structured": structured_data,
        }

    def _extract_text(self, file_path: Path) -> str:
        """Extract raw text from various file formats."""
        suffix = file_path.suffix.lower()

        if suffix == ".pdf":
            return self._extract_from_pdf(file_path)
        elif suffix in (".txt", ".md", ".py", ".json"):
            return file_path.read_text(encoding="utf-8")
        else:
            raise ValueError(f"Unsupported file format: {suffix}")

    def _extract_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file."""
        try:
            from PyPDF2 import PdfReader

            reader = PdfReader(str(file_path))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except ImportError:
            raise ImportError("PyPDF2 is required to parse PDF files. Install with: pip install PyPDF2")

    def _structure_text(self, text: str) -> dict:
        """Structure extracted text into logical sections."""
        # Fallback: Use simple heuristics to identify sections
        lines = text.split("\n")

        structured = {
            "name": self._extract_name(lines),
            "email": self._extract_email(text),
            "phone": self._extract_phone(text),
            "linkedin": self._extract_linkedin(text),
        }

        return structured

    def _extract_name(self, lines: list) -> str:
        """Extract candidate name from first few lines."""
        for line in lines[:3]:
            line = line.strip()
            if line and len(line.split()) <= 4 and not any(
                word in line.lower() for word in ("resume", "cv", "curriculum", "vitae")
            ):
                return line
        return "Unknown"

    def _extract_email(self, text: str) -> str:
        """Extract email address from text."""
        pattern = r"[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}"
        match = re.search(pattern, text)
        return match.group(0) if match else ""

    def _extract_phone(self, text: str) -> str:
        """Extract phone number from text."""
        pattern = r"\+?[\d\s\-\(\)]{10,}"
        match = re.search(pattern, text)
        return match.group(0) if match else ""

    def _extract_linkedin(self, text: str) -> str:
        """Extract LinkedIn URL from text."""
        pattern = r"linkedin\.com/in/[\w-]+"
        match = re.search(pattern, text.lower())
        return match.group(0) if match else ""


# Singleton instance for convenience
_resume_parser = None


def get_resume_parser() -> ResumeParser:
    """Get or create the resume parser singleton."""
    global _resume_parser
    if _resume_parser is None:
        _resume_parser = ResumeParser()
    return _resume_parser
