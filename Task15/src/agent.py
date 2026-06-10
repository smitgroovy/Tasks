"""Candidate Screening Agent - Uses OpenRouter API for intelligent resume screening."""

import json
import logging
import re
from typing import List, Optional

from openai import OpenAI

from config import MIN_MATCH_SCORE, get_job_requirements
from database import Database, ScreeningResult, get_database
from tools.resume_parser import get_resume_parser
from tools.slack_notifier import get_slack_notifier

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class OpenRouterClient:
    """Client for OpenRouter API using OpenAI SDK."""

    def __init__(self, api_key: str, model: str, base_url: str = "https://openrouter.ai/api/v1"):
        self.client = OpenAI(
            base_url=base_url,
            api_key=api_key,
        )
        self.model = model
        logger.info(f"OpenRouterClient initialized with model: {model}")

    def chat_completion(self, messages: list, temperature: float = 0.2, max_tokens: int = 2048) -> str:
        """Send a chat completion request to OpenRouter API with reasoning enabled."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                extra_body={"reasoning": {"enabled": True}},
            )

            # Extract the assistant message
            assistant_message = response.choices[0].message
            return assistant_message.content or ""

        except Exception as e:
            logger.error(f"OpenRouter API Error: {str(e)}")
            raise

    def chat_completion_with_reasoning(self, messages: list) -> dict:
        """Send a chat completion request and return both content and reasoning."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                extra_body={"reasoning": {"enabled": True}},
            )

            assistant_message = response.choices[0].message
            return {
                "content": assistant_message.content or "",
                "reasoning_details": getattr(assistant_message, "reasoning_details", None),
            }

        except Exception as e:
            logger.error(f"OpenRouter API Error: {str(e)}")
            raise


class CandidateScreener:
    """Main agent for screening candidate resumes using OpenRouter API."""

    def __init__(self, api_key: str, model: str, base_url: str = "https://openrouter.ai/api/v1",
                 db: Optional[Database] = None, min_score: int = MIN_MATCH_SCORE):
        self.client = OpenRouterClient(api_key, model, base_url)
        self.db = db or get_database()
        self.min_score = min_score
        self.parser = get_resume_parser()
        self.notifier = get_slack_notifier()
        self.job_requirements = get_job_requirements()
        logger.info(f"CandidateScreener initialized with model: {model}")

    def screen_resume(self, file_path: str) -> ScreeningResult:
        """Screen a single resume and return result."""
        logger.info(f"Screening resume: {file_path}")

        # Step 1: Parse resume
        parsed = self.parser.parse(file_path)
        resume_text = parsed["content"]
        structured = parsed["structured"]

        # Step 2: Generate prompt for LLM screening
        prompt = self._create_screening_prompt(resume_text)

        # Step 3: Get LLM analysis via OpenRouter API
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert technical recruiter and hiring manager. "
                    "Analyze the candidate's resume against the job requirements. "
                    "Provide structured output in JSON format only. "
                    "Think carefully through each requirement before giving your final assessment."
                ),
            },
            {"role": "user", "content": prompt},
        ]

        try:
            llm_response = self.client.chat_completion(messages)
            analysis = self._parse_llm_response(llm_response)
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
            analysis = self._fallback_analysis(resume_text)

        # Step 4: Create screening result
        result = ScreeningResult(
            candidate_name=structured.get("name", "Unknown"),
            email=structured.get("email", ""),
            filename=parsed["filename"],
            match_score=analysis["match_score"],
            recommendation=analysis["recommendation"],
            summary=analysis["summary"],
            skills_matched=json.dumps(analysis["skills_matched"]),
            skills_missing=json.dumps(analysis["skills_missing"]),
            experience_years=analysis["experience_years"],
        )

        # Step 5: Save to database
        result_id = self.db.save_result(result)
        result.id = result_id
        logger.info(f"Screening result saved with ID: {result_id}")

        # Step 6: Send Slack notification if score is good
        if result.match_score >= self.min_score:
            slack_response = self.notifier.send_screening_result(
                candidate_name=result.candidate_name,
                match_score=result.match_score,
                recommendation=result.recommendation,
                summary=result.summary,
                skills_matched=analysis["skills_matched"],
                skills_missing=analysis["skills_missing"],
                experience_years=result.experience_years,
            )
            logger.info(f"Slack notification sent: {slack_response.get('status', 'unknown')}")

        return result

    def _create_screening_prompt(self, resume_text: str) -> str:
        """Create detailed prompt for LLM screening."""
        requirements = self.job_requirements

        prompt = f"""Analyze this candidate's resume against the following job requirements and return ONLY a JSON object with no markdown formatting.

Job Title: {requirements['title']}
Required Skills: {', '.join(requirements['required_skills'])}
Preferred Skills: {', '.join(requirements['preferred_skills'])}
Minimum Experience: {requirements['min_experience']} years
Education: {requirements['education']}
Key Responsibilities: {', '.join(requirements['key_responsibilities'])}

Candidate Resume:
{resume_text[:4000]}

Return a JSON object with exactly these fields:
{{
    "match_score": <number between 0-100>,
    "skills_matched": [<list of matched skills>],
    "skills_missing": [<list of missing required skills>],
    "experience_years": <estimated years of experience as number>,
    "summary": "<2-3 sentence summary of candidate strengths and gaps>",
    "recommendation": "<Strong Recommend / Recommend / Maybe / Reject>"
}}
"""
        return prompt

    def _parse_llm_response(self, response: str) -> dict:
        """Parse and validate the LLM response."""
        try:
            # Try to extract JSON from the response
            # LLM might wrap it in markdown code blocks
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]

            # Find JSON in the response
            json_match = re.search(r"\{.*\}", response, re.DOTALL)
            if json_match:
                response = json_match.group(0)

            analysis = json.loads(response.strip())
            return self._validate_analysis(analysis)

        except (json.JSONDecodeError, IndexError) as e:
            logger.warning(f"Failed to parse LLM response: {e}. Using fallback.")
            return self._fallback_analysis(response)

    def _validate_analysis(self, analysis: dict) -> dict:
        """Validate and fill missing fields with defaults."""
        default = {
            "match_score": 0.0,
            "skills_matched": [],
            "skills_missing": [],
            "experience_years": 0,
            "summary": "Unable to fully analyze candidate.",
            "recommendation": "Review Manually",
        }

        for key in default:
            if key not in analysis or analysis[key] is None:
                analysis[key] = default[key]

        # Ensure match_score is within range
        analysis["match_score"] = max(0, min(100, float(analysis["match_score"])))

        return analysis

    def _fallback_analysis(self, resume_text: str) -> dict:
        """Fallback analysis when LLM fails."""
        logger.warning("Using fallback keyword-based analysis")

        requirements = self.job_requirements
        skills = requirements["required_skills"] + requirements["preferred_skills"]

        matched = []
        missing = []
        resume_lower = resume_text.lower()

        for skill in skills:
            if skill.lower() in resume_lower:
                matched.append(skill)
            else:
                missing.append(skill)

        # Simple scoring
        score = (len(matched) / len(skills)) * 100 if skills else 0

        return {
            "match_score": round(score, 1),
            "skills_matched": matched,
            "skills_missing": missing,
            "experience_years": 3,  # Unknown default
            "summary": "Analysis performed using keyword matching. LLM analysis unavailable.",
            "recommendation": "Review Manually",
        }

    def screen_multiple(self, file_paths: List[str]) -> List[ScreeningResult]:
        """Screen multiple resumes and return results."""
        results = []
        for path in file_paths:
            try:
                result = self.screen_resume(path)
                results.append(result)
            except Exception as e:
                logger.error(f"Failed to screen {path}: {e}")
        return results
