# Candidate Screener Agent

A real-world hiring automation tool that screens candidate resumes using the OpenRouter API with reasoning capabilities.

## Architecture

- **LLM**: OpenRouter API (openrouter/free) with reasoning enabled
- **Tool 1**: Resume Parser (PDF/TXT/MD)
- **Tool 2**: Slack Notifier
- **Database**: SQLite for storing screening results
- **Output**: Structured screening results with match scores and recommendations

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (copy .env.example to .env and fill in your keys):
```bash
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY
```

3. Run the agent:
```bash
python run.py screen data/sample_resume.txt
```

## Commands

- `python run.py screen <file>` - Screen a single resume
- `python run.py stats` - Show screening statistics
- `python run.py export --output results.json` - Export results

## Slack Integration

Set `SLACK_BOT_TOKEN` and `SLACK_CHANNEL` in `.env` to enable Slack notifications for strong candidates (match score >= 70%).

## Project Structure

```
.
├── config.py              # Configuration management
├── run.py                 # Entry point
├── requirements.txt       # Python dependencies
├── .env.example           # Environment template
├── data/                  # Sample data & database
│   └── sample_resume.txt
├── src/
│   ├── main.py            # CLI entry point
│   ├── agent.py           # Main screening agent (OpenRouter LLM)
│   ├── database.py        # SQLite storage handler
│   └── tools/
│       ├── resume_parser.py   # Tool 1: Resume text extraction
│       └── slack_notifier.py  # Tool 2: Slack notifications
└── tests/                 # Unit tests
```

## Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| OPENROUTER_API_KEY | OpenRouter API key | Yes |
| OPENROUTER_MODEL | Model name (default: openrouter/free) | No |
| SLACK_BOT_TOKEN | Slack Bot OAuth token | No |
| SLACK_CHANNEL | Slack channel (e.g., #hiring) | No |
| MIN_MATCH_SCORE | Minimum score for strong match | No (default: 70) |
| DATABASE_PATH | SQLite database file path | No |

Get your OpenRouter API key at: https://openrouter.ai/keys

## Technologies Used

- **Python 3.10+**
- **OpenRouter API** (openrouter/free) - LLM for intelligent screening with reasoning
- **OpenAI SDK** - Python client for API calls
- **SQLite** - Lightweight database for persistence
- **PyPDF2** - PDF text extraction
- **python-dotenv** - Environment variable management

## How It Works

1. **Resume Parsing**: Extracts raw text from PDF/TXT/MD files using the Resume Parser tool
2. **LLM Analysis**: Sends structured prompt to OpenRouter API with job requirements and resume text
3. **Reasoning**: Model uses chain-of-thought reasoning to analyze candidate fit
4. **Structured Output**: LLM returns JSON with match score, skills matched/missing, experience estimate, and recommendation
5. **Database Storage**: SQLite stores all results with timestamps
6. **Slack Notification**: For candidates with match score >= MIN_MATCH_SCORE, sends formatted message to Slack
7. **Export**: Can export all results to JSON for reporting

## Demo to Leadership

**10-minute demo structure:**
1. **2 min**: Show real hiring pain (manual resume review takes 30+ min each)
2. **3 min**: Run agent on sample resume - show speed and structured output
3. **3 min**: Show database results and export capability
4. **2 min**: Explain extensibility (new job reqs, multiple candidates, Slack integration)

## License

MIT
