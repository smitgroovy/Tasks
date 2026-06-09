# NVIDIA NIM API Notes

## What is NVIDIA NIM?

NVIDIA NIM (NVIDIA Inference Microservices) provides optimized API access to 100+ open-source LLMs hosted on NVIDIA GPUs. It uses an OpenAI-compatible API format.

---

## Authentication

NIM uses Bearer token authentication via the `Authorization` header.

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_NVIDIA_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "nvidia/llama-3.3-nemotron-super-49b-v1.5", "messages": [{"role": "user", "content": "Hello"}]}'
```

- **Get your key**: Sign up at [build.nvidia.com](https://build.nvidia.com) → Settings → API Keys
- **Free tier**: 40 requests/min, no credit card required
- **Keep it secret**: Never commit API keys to GitHub

---

## Models

| Model | API ID | Context | Max Output | Best For |
|-------|--------|---------|------------|----------|
| Nemotron Super 49B | `nvidia/llama-3.3-nemotron-super-49b-v1.5` | 131K | 16K | Chat, fastest on NIM |
| Llama 3.1 70B | `meta/llama-3.1-70b-instruct` | 131K | 16K | General reasoning |
| DeepSeek V4 Flash | `deepseek-ai/deepseek-v4-flash` | 1M | 131K | Long context |
| Qwen 3.5 122B | `qwen/qwen3.5-122b-a10b` | 262K | 262K | Multilingual |
| MiniMax M2.7 | `minimaxai/minimax-m2.7` | 205K | 197K | Large output |

**This project uses `nvidia/llama-3.3-nemotron-super-49b-v1.5`** — NVIDIA-optimized, fastest response times, free tier available.

---

## Rate Limits

| Tier | Requests/min | Notes |
|------|-------------|-------|
| Free | 40 | No credit card needed |
| Enterprise | Higher | Contact NVIDIA |

- **429 Too Many Requests**: Wait and retry with exponential backoff
- **Best practice**: Implement retry logic in production

---

## Chat Completions API

**Endpoint**: `POST https://integrate.api.nvidia.com/v1/chat/completions`

NIM is **OpenAI-compatible** — use the OpenAI SDK, just change the base URL.

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `model` | string | Model ID (e.g., `nvidia/llama-3.3-nemotron-super-49b-v1.5`) |
| `messages` | array | Array of message objects with `role` and `content` |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `max_tokens` | number | model default | Maximum tokens to generate |
| `temperature` | number | 1.0 | Randomness (0.0 = deterministic, 1.0 = creative) |
| `stream` | boolean | false | Stream response via SSE |
| `top_p` | number | 1.0 | Nucleus sampling |

### Request Format

```json
{
  "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ]
}
```

### Response Format

```json
{
  "id": "chatcmpl-abc123",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "Hi! How can I help?"},
    "finish_reason": "stop"
  }],
  "usage": {"prompt_tokens": 12, "completion_tokens": 15, "total_tokens": 27}
}
```

---

## Best Practices

1. **Use the OpenAI SDK** — NIM is fully compatible, no need for a separate SDK
2. **Set max_tokens** — controls response length
3. **Use system prompts** — set the model's behavior via a system message
4. **Include conversation history** — pass previous messages for multi-turn chat
5. **Handle errors gracefully** — catch network, auth, and rate limit errors
6. **Never expose API keys** in frontend code or version control
7. **Use environment variables** for all secrets

---

## SDKs (OpenAI-Compatible)

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `openai` | `npm install openai` |
| Python | `openai` | `pip install openai` |

Both SDKs work with NIM by setting `baseURL` to `https://integrate.api.nvidia.com/v1`.

### Node.js Setup

```js
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});
```

### Python Setup

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"],
)
```
