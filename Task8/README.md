# Production CLI Bot v2

A production-grade multi-provider AI CLI chatbot with streaming, exponential backoff retries, token tracking, cost estimation, and structured logging.

## Architecture

```
User Input -> Provider Router -> Retry Layer -> Streaming Layer -> Token Tracking -> Cost Tracking -> Logger -> Output
```

```
src/
  chat.js                 # Entry point — CLI loop, wires all layers
  core/
    config.js             # Loads .env, validates provider config
    providerRouter.js     # Maps provider names to classes
  providers/
    anthropic.js          # Anthropic Claude (streaming)
    openai.js             # OpenAI GPT (streaming)
    gemini.js             # Google Gemini (streaming)
  utils/
    retry.js              # Exponential backoff with rate limit detection
    streaming.js          # Normalizes streaming events across providers
    tokenCounter.js       # Tracks input/output tokens per turn and session
    costCalculator.js     # Estimates USD cost per model
    logger.js             # Structured JSON logging to logs/session.log
logs/
  session.log             # Auto-created, one JSON line per API call
tests/
  retry.test.js           # Retry layer tests
  cost.test.js            # Cost calculator + token counter tests
  logger.test.js          # Logger + provider router tests
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy .env.example to .env and add your API keys
cp .env.example .env

# 3. Edit .env with your keys
```

## Running

```bash
# Start with a specific provider
node src/chat.js --provider anthropic
node src/chat.js --provider openai
node src/chat.js --provider gemini

# Or use npm scripts
npm run chat:anthropic
npm run chat:openai
npm run chat:gemini
```

## Streaming

Tokens are printed as they arrive — no waiting for the full response.

```
You: What is the capital of France?
AI: The capital of France is Paris.
  [842ms | in: 12 | out: 8 | cost: $0.000032]
```

## Slash Commands

| Command    | Description                     |
|------------|---------------------------------|
| `/quit`    | Exit the chat                   |
| `/clear`   | Clear conversation history      |
| `/history` | Show conversation history       |
| `/cost`    | Show session token/cost summary |
| `/logs`    | Show structured log entries     |

## Retry Logic

- Max 4 retries on failure
- Exponential backoff: 1s -> 2s -> 4s -> 8s (with jitter)
- Retries on: 429 (rate limit), 500/502/503/504 (server errors), network errors (ECONNRESET, ETIMEDOUT)
- Does NOT retry on: 400 (bad request), 401 (auth), 403 (forbidden)

## Token Tracking

Every turn tracks:
- **Input tokens** — tokens in your prompt
- **Output tokens** — tokens in the AI response
- **Total tokens** — input + output

Session totals accumulate across all turns.

## Cost Tracking

Estimated costs per model (per 1M tokens):

| Model               | Input    | Output   |
|---------------------|----------|----------|
| Claude 3.5 Haiku    | $0.80    | $4.00    |
| Claude 3.5 Sonnet   | $3.00    | $15.00   |
| GPT-4o Mini         | $0.15    | $0.60    |
| GPT-4o              | $2.50    | $10.00   |
| Gemini 2.5 Flash    | $0.075   | $0.30    |

## Logging

Every API call is logged to `logs/session.log` as a JSON line:

```json
{
  "timestamp": "2026-06-09T12:00:00.000Z",
  "provider": "anthropic",
  "model": "claude-3-5-haiku-20241022",
  "latencyMs": 842,
  "tokens": { "input": 12, "output": 8, "total": 20 },
  "estimatedCost": 0.000032,
  "status": "success"
}
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
node --test tests/retry.test.js
node --test tests/cost.test.js
node --test tests/logger.test.js
```

22 tests covering retry behavior, cost calculation, token counting, logging, and provider routing.

## Future Improvements

- Conversation persistence (save/load history to disk)
- Configurable max tokens per response
- Multiple output formats (markdown, JSON)
- Plugin system for custom providers
- Web UI alongside CLI
- Streaming cost estimation (cost per token as it streams)
- Rate limit cooldown timer display
- Response quality scoring
- Multi-language support
- Docker containerization
