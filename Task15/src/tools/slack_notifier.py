"""Slack Notifier Tool - Sends screening results to Slack channels."""

import json
from typing import Optional

import requests

from config import SLACK_BOT_TOKEN, SLACK_CHANNEL


class SlackNotifier:
    """Tool to send candidate screening results to Slack."""

    def __init__(self, bot_token: str = SLACK_BOT_TOKEN, channel: str = SLACK_CHANNEL):
        self.bot_token = bot_token
        self.channel = channel
        self.base_url = "https://slack.com/api"
        self.enabled = bool(bot_token)

    def send_screening_result(
        self,
        candidate_name: str,
        match_score: float,
        recommendation: str,
        summary: str,
        skills_matched: list,
        skills_missing: list,
        experience_years: Optional[int] = None,
    ) -> dict:
        """Send a formatted screening result to Slack.

        Args:
            candidate_name: Name of the candidate
            match_score: Overall match percentage (0-100)
            recommendation: Hiring recommendation text
            summary: Brief summary of the candidate
            skills_matched: List of skills that matched
            skills_missing: List of skills that are missing
            experience_years: Years of experience

        Returns:
            Response from Slack API
        """
        if not self.enabled:
            return {"status": "disabled", "message": "Slack notifications are disabled (no token configured)"}

        # Determine color based on score
        if match_score >= 80:
            color = "#36a64f"  # Green
        elif match_score >= 60:
            color = "#daa520"  # Gold
        else:
            color = "#dc143c"  # Red

        message = {
            "channel": self.channel,
            "attachments": [
                {
                    "fallback": f"Screening Result: {candidate_name} - {match_score}% match",
                    "color": color,
                    "title": f"Candidate Screening Result: {candidate_name}",
                    "fields": [
                        {
                            "title": "Match Score",
                            "value": f"{match_score}%",
                            "short": True,
                        },
                        {
                            "title": "Experience",
                            "value": f"{experience_years} years" if experience_years else "N/A",
                            "short": True,
                        },
                        {
                            "title": "Skills Matched",
                            "value": ", ".join(skills_matched) if skills_matched else "None",
                            "short": False,
                        },
                        {
                            "title": "Skills Missing",
                            "value": ", ".join(skills_missing) if skills_missing else "None",
                            "short": False,
                        },
                        {
                            "title": "Summary",
                            "value": summary[:500] + "..." if len(summary) > 500 else summary,
                            "short": False,
                        },
                        {
                            "title": "Recommendation",
                            "value": recommendation,
                            "short": False,
                        },
                    ],
                    "footer": "Candidate Screener Agent",
                }
            ],
        }

        return self._send_message(message)

    def _send_message(self, payload: dict) -> dict:
        """Send message to Slack via API."""
        if not self.enabled:
            return {"status": "disabled"}

        headers = {
            "Authorization": f"Bearer {self.bot_token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                f"{self.base_url}/chat.postMessage",
                headers=headers,
                json=payload,
                timeout=30,
            )
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def send_simple_message(self, text: str) -> dict:
        """Send a simple text message to Slack."""
        if not self.enabled:
            return {"status": "disabled"}

        payload = {
            "channel": self.channel,
            "text": text,
        }

        headers = {
            "Authorization": f"Bearer {self.bot_token}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                f"{self.base_url}/chat.postMessage",
                headers=headers,
                json=payload,
                timeout=30,
            )
            return response.json()
        except Exception as e:
            return {"status": "error", "message": str(e)}


# Singleton instance
_notifier = None


def get_slack_notifier() -> SlackNotifier:
    """Get or create the Slack notifier singleton."""
    global _notifier
    if _notifier is None:
        _notifier = SlackNotifier()
    return _notifier
