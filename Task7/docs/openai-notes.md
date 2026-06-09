# OpenAI API Study Notes

## Overview

OpenAI provides a REST API for accessing large language models including GPT-4o, GPT-4o-mini, GPT-5, and others. The primary interface is the **Chat Completions API**.

**Base URL:** `https://api.openai.com/v1`

---

## Chat Completions API

The Chat Completions API is the standard way to interact with OpenAI models. It accepts an array of messages and returns a model-generated response.

### Request Structure

```json
{
  "model": "gpt-4o-mini",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

### Response Structure

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 12,
    "total_tokens": 37
  }
}
```

---

## Roles

OpenAI uses three message roles:

| Role | Purpose | Example |
|------|---------|---------|
| `system` | Sets behavior, personality, and constraints for the assistant | "You are a Python expert." |
| `user` | Represents the human user's input | "Write a sorting algorithm" |
| `assistant` | Represents the model's previous responses (used for multi-turn) | "Here is a quicksort implementation..." |

### Role Usage Patterns

```javascript
const messages = [
  { role: "system", content: "You are a senior backend engineer." },
  { role: "user", content: "Explain connection pooling." },
  { role: "assistant", content: "Connection pooling is..." },
  { role: "user", content: "How do I configure it in Node.js?" }
];
```

Key points:
- **system** messages define the assistant's behavior and are sent with every request
- **assistant** messages are used to maintain conversation history
- Only the **user** role should contain new human input
- System messages are optional but highly recommended

---

## Function Calling

Function calling lets the model invoke external functions you define. The model does not call the function directly — it returns a structured JSON argument that your code uses to call the function.

### How It Works

1. Define functions in your request:

```json
{
  "model": "gpt-4o-mini",
  "messages": [{ "role": "user", "content": "What's the weather in NYC?" }],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": { "type": "string", "description": "City name" },
            "units": { "type": "string", "enum": ["celsius", "fahrenheit"] }
          },
          "required": ["location"]
        }
      }
    }
  ]
}
```

2. Model returns a tool call in the response:

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"location\": \"New York City\", \"units\": \"fahrenheit\"}"
        }
      }]
    }
  }]
}
```

3. You execute the function and send the result back:

```json
{
  "role": "tool",
  "tool_call_id": "call_abc123",
  "content": "{\"temperature\": 72, \"condition\": \"sunny\"}"
}
```

---

## Tool Calling

Tool calling is an evolution of function calling. Tools can include:

- **Function tools** — custom functions your code executes
- **Code interpreter** — model runs Python code in a sandbox
- **File search** — model searches through uploaded files

### Parallel Tool Calls

The model can request multiple tool calls simultaneously:

```json
{
  "tool_calls": [
    { "id": "call_1", "type": "function", "function": { "name": "get_weather", "arguments": "{\"city\": \"NYC\"}" } },
    { "id": "call_2", "type": "function", "function": { "name": "get_calendar", "arguments": "{\"date\": \"2025-01-15\"}" } }
  ]
}
```

### Tool Choice Control

```javascript
// Auto (default) — model decides
{ "tool_choice": "auto" }

// Required — model must use a tool
{ "tool_choice": "required" }

// Force specific function
{ "tool_choice": { "type": "function", "function": { "name": "get_weather" } } }

// Disable tools
{ "tool_choice": "none" }
```

---

## Model Selection

| Model | Context Window | Best For | Cost (per 1M tokens) |
|-------|---------------|----------|---------------------|
| `gpt-4o-mini` | 128K | Fast, cheap tasks | $0.15 in / $0.60 out |
| `gpt-4o` | 128K | General purpose | $2.50 in / $10.00 out |
| `gpt-4-turbo` | 128K | Complex reasoning | $10.00 in / $30.00 out |
| `gpt-5` | 256K | Advanced reasoning | $2.50 in / $10.00 out |
| `o1` | 200K | Deep reasoning | $15.00 in / $60.00 out |
| `o3-mini` | 200K | Reasoning, cheaper | $1.10 in / $4.40 out |

### Selection Guidelines

- **gpt-4o-mini**: Default choice for most tasks. Fast, cheap, good quality.
- **gpt-4o**: When you need better quality than mini for complex tasks.
- **gpt-5**: Latest model with improved reasoning and instruction following.
- **o1 / o3-mini**: For tasks requiring multi-step reasoning (math, logic, code analysis).

---

## Rate Limits

Rate limits are applied per API key and measured in **RPM** (requests per minute) and **TPM** (tokens per minute).

| Tier | RPM | TPM | Daily Spend Limit |
|------|-----|-----|-------------------|
| Free | 3 | 40,000 | $100 |
| Tier 1 | 500 | 200,000 | $100 |
| Tier 2 | 1,000 | 400,000 | $500 |
| Tier 3 | 2,000 | 800,000 | $1,000 |
| Tier 4 | 5,000 | 2,000,000 | $5,000 |
| Tier 5 | 10,000 | 4,000,000 | Custom |

### Handling Rate Limits

```javascript
async function callWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] || Math.pow(2, i);
        console.log(`Rate limited. Retrying in ${retryAfter}s...`);
        await new Promise(r => setTimeout(r, retryAfter * 1000));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## Cost Considerations

### Pricing (per 1M tokens, as of 2025)

| Model | Input | Output |
|-------|-------|--------|
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4o | $2.50 | $10.00 |
| gpt-5 | $2.50 | $10.00 |
| o3-mini | $1.10 | $4.40 |

### Cost Optimization Strategies

1. **Use gpt-4o-mini** for simple tasks (classification, extraction, formatting)
2. **Limit max_tokens** — don't request more output than needed
3. **Compress context** — summarize long conversations
4. **Cache common queries** — store and reuse results
5. **Batch requests** — use the Batch API for 50% cost reduction
6. **Monitor usage** — track tokens per request in production

---

## Best Practices

### 1. System Messages
```
Be specific about the role, format, and constraints.
Include output format examples when needed.
```

### 2. Temperature Control
- `temperature = 0`: Deterministic, best for factual tasks
- `temperature = 0.7`: Balanced creativity and consistency
- `temperature = 1.0+`: Maximum creativity (use carefully)

### 3. Prompt Engineering
- Provide clear instructions at the start
- Use delimiters to separate input from instructions
- Specify output format (JSON, markdown, etc.)
- Include examples for complex tasks

### 4. Multi-turn Conversations
- Include conversation history in the messages array
- Trim old messages to stay within context window
- Use system message to maintain consistent behavior

### 5. Error Handling
- Always handle rate limits (429 errors)
- Implement exponential backoff for retries
- Validate inputs before sending to the API
- Log usage and costs for monitoring

### 6. Security
- Never expose API keys in client-side code
- Use environment variables for configuration
- Implement server-side validation
- Set spending limits on your API key

---

## OpenAI SDK Usage (Node.js)

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function chat(messages) {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1024
  });

  return response.choices[0].message.content;
}
```

---

## References

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Chat Completions Guide](https://platform.openai.com/docs/guides/chat)
- [Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Pricing](https://platform.openai.com/pricing)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
