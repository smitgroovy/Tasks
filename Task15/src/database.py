"""Database module for storing candidate screening results."""

import json
import sqlite3
from contextlib import contextmanager
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from config import DATABASE_PATH


@dataclass
class ScreeningResult:
    """Represents a candidate screening result."""

    id: Optional[int] = None
    candidate_name: str = ""
    email: str = ""
    filename: str = ""
    match_score: float = 0.0
    recommendation: str = ""
    summary: str = ""
    skills_matched: str = ""  # JSON string
    skills_missing: str = ""  # JSON string
    experience_years: int = 0
    created_at: Optional[str] = None

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return asdict(self)


class Database:
    """SQLite database manager for screening results."""

    def __init__(self, db_path: str = DATABASE_PATH):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the database with required tables."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS screening_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    candidate_name TEXT NOT NULL,
                    email TEXT,
                    filename TEXT NOT NULL,
                    match_score REAL DEFAULT 0.0,
                    recommendation TEXT,
                    summary TEXT,
                    skills_matched TEXT,
                    skills_missing TEXT,
                    experience_years INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

    @contextmanager
    def _get_connection(self):
        """Get a database connection as a context manager."""
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()

    def save_result(self, result: ScreeningResult) -> int:
        """Save a screening result to the database.

        Args:
            result: The screening result to save

        Returns:
            The ID of the saved record
        """
        with self._get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO screening_results
                (candidate_name, email, filename, match_score, recommendation,
                 summary, skills_matched, skills_missing, experience_years)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    result.candidate_name,
                    result.email,
                    result.filename,
                    result.match_score,
                    result.recommendation,
                    result.summary,
                    result.skills_matched,
                    result.skills_missing,
                    result.experience_years,
                ),
            )
            conn.commit()
            return cursor.lastrowid

    def get_result(self, result_id: int) -> Optional[ScreeningResult]:
        """Get a specific screening result by ID."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM screening_results WHERE id = ?",
                (result_id,),
            )
            row = cursor.fetchone()

            if row:
                return self._row_to_result(row)
            return None

    def get_all_results(self, limit: int = 100) -> List[ScreeningResult]:
        """Get all screening results, ordered by most recent."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM screening_results ORDER BY created_at DESC LIMIT ?",
                (limit,),
            )
            return [self._row_to_result(row) for row in cursor.fetchall()]

    def get_results_by_score(self, min_score: float = 0.0, max_score: float = 100.0) -> List[ScreeningResult]:
        """Get screening results filtered by match score."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT * FROM screening_results WHERE match_score BETWEEN ? AND ? ORDER BY match_score DESC",
                (min_score, max_score),
            )
            return [self._row_to_result(row) for row in cursor.fetchall()]

    def _row_to_result(self, row) -> ScreeningResult:
        """Convert a database row to a ScreeningResult object."""
        return ScreeningResult(
            id=row[0],
            candidate_name=row[1],
            email=row[2],
            filename=row[3],
            match_score=row[4],
            recommendation=row[5],
            summary=row[6],
            skills_matched=row[7],
            skills_missing=row[8],
            experience_years=row[9],
            created_at=row[10],
        )

    def export_to_json(self, output_path: Optional[str] = None) -> str:
        """Export all screening results to a JSON file.

        Args:
            output_path: Path to save the JSON file. If None, uses default path.

        Returns:
            Path to the exported JSON file
        """
        if output_path is None:
            output_path = f"screening_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        results = self.get_all_results()
        data = [result.to_dict() for result in results]

        Path(output_path).write_text(json.dumps(data, indent=2, default=str))
        return output_path

    def get_stats(self) -> dict:
        """Get aggregate statistics about screening results."""
        with self._get_connection() as conn:
            total = conn.execute("SELECT COUNT(*) FROM screening_results").fetchone()[0]
            avg_score = conn.execute(
                "SELECT AVG(match_score) FROM screening_results"
            ).fetchone()[0]
            high_matches = conn.execute(
                "SELECT COUNT(*) FROM screening_results WHERE match_score >= 80"
            ).fetchone()[0]
            low_matches = conn.execute(
                "SELECT COUNT(*) FROM screening_results WHERE match_score < 60"
            ).fetchone()[0]

            return {
                "total_screened": total,
                "average_score": round(avg_score, 2) if avg_score else 0,
                "strong_matches": high_matches,
                "weak_matches": low_matches,
            }


# Singleton instance
_db = None


def get_database() -> Database:
    """Get or create the database singleton."""
    global _db
    if _db is None:
        _db = Database()
    return _db
