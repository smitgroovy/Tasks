# Multi-Provider AI CLI Chatbot

A production-quality CLI chatbot that supports three AI providers — Anthropic (Claude), OpenAI (GPT), and Google (Gemini) — through a clean provider abstraction layer.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLI Interface                   │
│            (chatbot.js + readline)               │
├─────────────────────────────────────────────────┤
│              Provider Abstraction                │
│         generateResponse(messages)               │
├──────────┬──────────┬──────────┬────────────────┤
│Anthropic │  OpenAI  │  Gemini  │   (extensible) │
│ Provider │ Provider │ Provider │                │
├──────────┼──────────┼──────────┼────────────────┤
│@anthropic│ openai   │@google/  │                │
│ ai/sdk   │   SDK    │generative│                │
└──────────┴──────────┴──────────┴────────────────┘
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- At least one API key (Anthropic, OpenAI, or Gemini)

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
```

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx    # Get from console.anthropic.com
OPENAI_API_KEY=sk-xxxxx           # Get from platform.openai.com
GEMINI_API_KEY=xxxxx              # Get from aistudio.google.com
DEFAULT_PROVIDER=gemini              # Optional: gemini, anthropic, or openai
```

You only need the API key for the provider(s) you plan to use.

## Running the Chatbot

```bash
# Default provider (gemini - free tier)
npm start

# Specify provider
node src/chatbot.js --provider gemini
node src/chatbot.js --provider anthropic
node src/chatbot.js --provider openai

# npm script shortcuts
npm run chat:gemini
npm run chat:anthropic
npm run chat:openai
```

### Chat Commands

| Command | Description |
|---------|-------------|
| `/quit` | Exit the chatbot |
| `/clear` | Clear conversation history |
| `/history` | Show conversation history |
| `/cost` | Show session cost and turn count |

## Running Benchmarks

```bash
# Benchmark a specific provider (all 50 prompts)
npm run benchmark -- --provider openai
npm run benchmark -- --provider anthropic
npm run benchmark -- --provider gemini

# Limit number of prompts
npm run benchmark -- --provider openai --limit 10
```

Results are saved to `benchmark/results-{provider}.csv`.

## Switching Providers

The provider abstraction makes switching seamless. No business logic changes needed:

```javascript
// In your code, just change the provider name
const provider = createProvider('gemini');  // or 'openai', 'anthropic'
const response = await provider.generateResponse(messages);
```

All providers expose the same `generateResponse(messages)` interface returning:

```javascript
{
  content: "string",
  usage: { inputTokens, outputTokens },
  latency: "number (ms)",
  model: "string",
  provider: "string"
}
```

## Cost Analysis

| Model | Input (per 1M) | Output (per 1M) | 50 Prompts | 5,000 Prompts |
|-------|---------------|----------------|------------|---------------|
| Claude 3.5 Haiku | $0.80 | $4.00 | ~$0.01 | ~$1.05 |
| GPT-4o-mini | $0.15 | $0.60 | ~$0.002 | ~$0.20 |
| Gemini 2.5 Flash | $0.15 | $0.60 | ~$0.002 | ~$0.24 |

See `docs/cost-report.md` for detailed analysis and `docs/decision-matrix.md` for model selection guidance.

## Project Structure

```
multi-provider-cli/
├── src/
│   ├── chatbot.js              # Main CLI entry point
│   ├── config.js               # Configuration and environment
│   └── providers/
│       ├── anthropic.js         # Anthropic provider
│       ├── openai.js            # OpenAI provider
│       └── gemini.js            # Gemini provider
├── src/benchmark/
│   └── benchmark.js             # Benchmark runner
├── benchmark/
│   ├── prompts.json             # 50 benchmark prompts
│   ├── results-template.csv     # CSV template
│   └── results-{provider}.csv   # Generated results
├── docs/
│   ├── openai-notes.md          # OpenAI API study
│   ├── gemini-notes.md          # Gemini API study
│   ├── cost-report.md           # Cost analysis
│   └── decision-matrix.md       # Model selection guide
├── submission-report.md         # Internship submission report
├── package.json
├── .env.example
└── .gitignore
```

## Lessons Learned

1. **Provider abstraction is worth the upfront investment** — adding a new provider takes ~50 lines of code.
2. **Token counting varies by provider** — each API has different tokenization, making fair comparisons challenging.
3. **Free tiers are essential for development** — Gemini's free tier enabled rapid iteration without cost concerns.
4. **Error handling must be provider-specific** — each API has different error formats and retry semantics.
5. **Cost and quality don't always correlate** — Gemini Flash is cheapest but performs well on many tasks.

## License

MIT
