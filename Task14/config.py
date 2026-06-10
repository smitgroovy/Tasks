"""
Configuration file for OpenRouter API
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Force load .env from this directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path, override=True)

# OpenRouter API Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = "openrouter/free"

def get_client():
    """Get OpenAI client configured for OpenRouter."""
    from openai import OpenAI
    return OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=OPENROUTER_API_KEY,
    )

def call_llm(messages):
    """Call OpenRouter API with reasoning enabled."""
    client = get_client()
    response = client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=messages,
        extra_body={"reasoning": {"enabled": True}}
    )
    return response.choices[0].message
