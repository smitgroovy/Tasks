"""Configuration management for the Candidate Screener Agent."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent.resolve()
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

# OpenRouter API Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")  # Get from https://openrouter.ai/keys
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Slack Configuration
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_CHANNEL = os.getenv("SLACK_CHANNEL", "#hiring-notifications")

# Database Configuration
DATABASE_PATH = os.getenv("DATABASE_PATH", str(DATA_DIR / "screening_db.sqlite"))

# Screening Criteria
MIN_MATCH_SCORE = int(os.getenv("MIN_MATCH_SCORE", "70"))

# Job Requirements (can be loaded from a config file or database)
DEFAULT_JOB_REQUIREMENTS = {
    "title": "Senior Software Engineer",
    "required_skills": [
        "Python",
        "FastAPI",
        "PostgreSQL",
        "Docker",
        "AWS",
        "Git",
    ],
    "preferred_skills": [
        "Kubernetes",
        "React",
        "Redis",
        "GraphQL",
        "CI/CD",
    ],
    "min_experience": 5,  # years
    "education": "Bachelor's degree in Computer Science or related field",
    "key_responsibilities": [
        "Design and build scalable backend services",
        "Mentor junior developers",
        "Lead technical architecture discussions",
        "Collaborate with cross-functional teams",
    ],
}


def get_job_requirements() -> dict:
    """Return current job requirements."""
    return DEFAULT_JOB_REQUIREMENTS.copy()
