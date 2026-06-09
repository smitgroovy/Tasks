# Anthropic API Notes

## Authentication

Anthropic uses API keys for authentication. Every request must include your API key in the `x-api-key` header.

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json"
```

- **Get your key**: Sign up at [console.anthropic.com](https://console.anthropic.com) and create an API key
- **Keep it secret**: Never commit API keys to GitHub or expose them in client-side code
- **Environment variable**: Always store your key in a `.env` file and load it via `dotenv`

---

## Models

| Model | API ID | Context Window | Max Output | Best For |
|-------|--------|---------------|------------|----------|
| Claude Opus 4.8 | `claude-opus-4-8` | 1M tokens | 128k tokens | Complex reasoning, agentic coding |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | 1M tokens | 64k tokens | Best speed + intelligence balance |
| Claude Haiku 4.5 | `claude-haiku-4-5` | 200k tokens | 64k tokens | Fastest, cost-effective |

**This project uses `claude-sonnet-4-6`** — the best combination of speed and intelligence for chatbot use cases.

---

## Rate Limits

Anthropic enforces rate limits to ensure fair usage:

| Tier | Requests/min | Tokens/min |
|------|-------------|------------|
| Free | 50 | 40,000 |
| Build | 1,000 | 100,000 |
| Scale | 2,000 | 400,000 |

- **429 Too Many Requests**: If you hit the limit, wait and retry
- **Retry-After header**: Tells you how long to wait
- **Best practice**: Implement exponential backoff in production

---

## Messages API (`messages.create`)

**Endpoint**: `POST https://api.anthropic.com/v1/messages`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model ID (e.g., `claude-sonnet-4-6`) |
| `max_tokens` | number | Maximum tokens to generate (required, even for small outputs) |
| `messages` | array | Array of message objects with `role` and `content` |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `system` | string | none | System prompt to set Claude's behavior |
| `temperature` | number | 1.0 | Randomness (0.0 = deterministic, 1.0 = creative) |
| `stream` | boolean | false | Stream response via SSE |
| `stop_sequences` | array | none | Custom stop strings |
| `top_p` | number | 1.0 | Nucleus sampling |

### Request Format

```json
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

### Response Format

```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Hi! How can I help?"}],
  "model": "claude-sonnet-4-6",
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 12, "output_tokens": 15}
}
```

---

## Best Practices

1. **Always set `max_tokens`** — it's required and controls response length
2. **Use system prompts** — set Claude's role and behavior upfront
3. **Include conversation history** — pass previous messages for multi-turn chat
4. **Handle errors gracefully** — catch network, auth, and rate limit errors
5. **Never expose API keys** in frontend code or version control
6. **Use environment variables** for all secrets
7. **Start with `claude-sonnet-4-6`** — best balance of speed, cost, and quality
8. **Keep messages array under 100,000** entries per request

---

## SDKs

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@anthropic-ai/sdk` | `npm install @anthropic-ai/sdk` |
| Python | `anthropic` | `pip install anthropic` |

Both SDKs handle authentication, retries, and response parsing automatically.
