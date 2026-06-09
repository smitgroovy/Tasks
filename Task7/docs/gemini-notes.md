# Gemini API Study Notes

## Overview

Google Gemini is a family of multimodal AI models accessible through the Google AI Studio API. Gemini models can process text, images, audio, and video natively.

**Base URL:** `https://generativelanguage.googleapis.com/v1beta`

---

## Gemini API Overview

The Gemini API uses a **generateContent** endpoint for text-based interactions. It follows a similar pattern to other chat APIs but with some key differences.

### Request Structure

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Hello, Gemini!" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 1024
  }
}
```

### Response Structure

```json
{
  "candidates": [
    {
      "content": {
        "parts": [{ "text": "Hello! How can I help you?" }],
        "role": "model"
      },
      "finishReason": "STOP",
      "safetyRatings": [...]
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 10,
    "candidatesTokenCount": 12,
    "totalTokenCount": 22
  }
}
```

---

## Gemini Models

### Flash Models

| Model | Context | Best For | Cost (per 1M tokens) |
|-------|---------|----------|---------------------|
| `gemini-1.5-flash` | 1M | Fast, cheap tasks | $0.075 in / $0.30 out |
| `gemini-1.5-flash-8b` | 1M | Smaller, faster | $0.0375 in / $0.15 out |
| `gemini-2.5-flash` | 1M | Latest, fastest, free tier | $0.15 in / $0.60 out |

**Flash characteristics:**
- Optimized for speed and cost efficiency
- Good for high-volume, latency-sensitive tasks
- Supports multimodal inputs
- Ideal for classification, extraction, summarization

### Pro Models

| Model | Context | Best For | Cost (per 1M tokens) |
|-------|---------|----------|---------------------|
| `gemini-1.5-pro` | 2M | Complex reasoning | $1.25 in / $5.00 out |
| `gemini-2.0-pro` | 2M | Latest, most capable | $1.25 in / $5.00 out |

**Pro characteristics:**
- Most capable Gemini models
- Better at complex reasoning and analysis
- Larger context windows (up to 2M tokens)
- Best for code generation, research, analysis

### Model Selection Guidelines

- **gemini-2.5-flash**: Default choice. Fast, affordable, and has free tier.
- **gemini-1.5-flash-8b**: When you need the cheapest option.
- **gemini-2.0-pro**: For complex tasks requiring deep understanding.
- **gemini-1.5-pro**: When you need the 2M token context window.

---

## Multimodal Capabilities

Gemini models natively support multiple modalities in a single request.

### Text + Images

```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "What's in this image?" },
      { "inlineData": {
        "mimeType": "image/jpeg",
        "data": "base64-encoded-image..."
      }}
    ]
  }]
}
```

### Text + Audio

```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "Transcribe this audio" },
      { "inlineData": {
        "mimeType": "audio/wav",
        "data": "base64-encoded-audio..."
      }}
    ]
  }]
}
```

### Text + Video

```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "text": "Summarize this video" },
      { "inlineData": {
        "mimeType": "video/mp4",
        "data": "base64-encoded-video..."
      }}
    ]
  }]
}
```

### Supported MIME Types

| Modality | MIME Types |
|----------|-----------|
| Image | `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| Audio | `audio/wav`, `audio/mp3`, `audio/aac`, `audio/ogg` |
| Video | `video/mp4`, `video/mpeg`, `video/webm` |

---

## Prompting Differences

### vs OpenAI

| Aspect | OpenAI | Gemini |
|--------|--------|--------|
| Message format | `{ role, content }` string | `{ role, parts: [{ text }] }` array |
| System messages | `role: "system"` | `systemInstruction` field |
| Tool calls | `tools` parameter | `tools` with `functionDeclarations` |
| Model name | `model` string | Model path in URL |
| Authentication | `Authorization: Bearer` | `key=` query parameter or `x-goog-api-key` header |
| Streaming | SSE with delta chunks | SSE with `candidates` chunks |
| Safety settings | Not built-in | Built-in `safetySettings` |
| Multimodal | Vision via URL/base64 | Native multimodal in parts |

### Key Prompting Differences

1. **Message Structure**: Gemini uses `parts` arrays instead of string content
2. **System Instructions**: Gemini uses a separate `systemInstruction` field, not a message role
3. **Role Names**: Gemini uses `"user"` and `"model"` (not `"assistant"`)
4. **Context Length**: Gemini supports up to 2M tokens (vs 128K for most OpenAI models)
5. **Multimodal**: Gemini handles images/audio/video natively in the parts array

### vs Anthropic

| Aspect | Anthropic | Gemini |
|--------|-----------|--------|
| API format | `messages` array | `contents` array |
| System prompt | Top-level `system` field | `systemInstruction` field |
| Model naming | `claude-3-5-haiku-20241022` | `gemini-2.5-flash` |
| Max context | 200K | 2M |
| Tool format | `tools` array with `input_schema` | `tools` with `functionDeclarations` |
| Streaming | SSE with `content_block_delta` | SSE with `candidates` chunks |
| Content format | String or array of blocks | `parts` array |

### Key Differences from Anthropic

1. **No `assistant` role**: Gemini uses `"model"` as the role name
2. **Parts-based content**: Everything goes through the `parts` array
3. **Built-in safety**: Gemini has safety rating system in responses
4. **Larger context**: 2M tokens vs 200K for Anthropic

---

## Safety Behavior

Gemini includes built-in safety filtering with configurable thresholds.

### Safety Categories

| Category | Description |
|----------|-------------|
| `HARM_CATEGORY_HARASSMENT` | Harassment and bullying content |
| `HARM_CATEGORY_HATE_SPEECH` | Hate speech and discrimination |
| `HARM_CATEGORY_SEXUALLY_EXPLICIT` | Sexually explicit content |
| `HARM_CATEGORY_DANGEROUS_CONTENT` | Dangerous activities and content |

### Safety Settings

```json
{
  "safetySettings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_ONLY_HIGH"
    }
  ]
}
```

### Threshold Values

- `BLOCK_NONE` — No blocking (use with caution)
- `BLOCK_ONLY_HIGH` — Block only high probability
- `BLOCK_MEDIUM_AND_ABOVE` — Block medium and high
- `BLOCK_LOW_AND_ABOVE` — Block low, medium, and high

### Safety Ratings in Response

```json
{
  "safetyRatings": [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "probability": "NEGLIGIBLE",
      "blocked": false
    }
  ]
}
```

---

## Cost Considerations

### Pricing (per 1M tokens)

| Model | Input | Output | Free Tier |
|-------|-------|--------|-----------|
| gemini-1.5-flash-8b | $0.0375 | $0.15 | 1M tokens/day |
| gemini-1.5-flash | $0.075 | $0.30 | 1M tokens/day |
| gemini-2.5-flash | $0.15 | $0.60 | 1M tokens/day |
| gemini-1.5-pro | $1.25 | $5.00 | None |
| gemini-2.0-pro | $1.25 | $5.00 | None |

### Free Tier

- **gemini-2.5-flash**: Free up to 15 RPM, 1M tokens/day
- **gemini-1.5-flash**: Free up to 15 RPM, 1M tokens/day
- No free tier for Pro models

### Cost Optimization

1. **Use Flash models** for most tasks — they are significantly cheaper
2. **gemini-1.5-flash-8b** is the cheapest option for simple tasks
3. **Batch API**: Use for non-urgent tasks to reduce costs
4. **Context caching**: Cache frequently used prompts to save tokens
5. **Prompt compression**: Summarize long contexts when possible

---

## Best Practices

### 1. System Instructions

```javascript
const request = {
  systemInstruction: {
    parts: [{ text: "You are a helpful coding assistant. Always provide code examples." }]
  },
  contents: [{
    role: "user",
    parts: [{ text: "Explain async/await" }]
  }]
};
```

### 2. Temperature Control

- `temperature = 0`: Deterministic output for factual tasks
- `temperature = 0.4`: Default for most tasks
- `temperature = 0.8`: Creative tasks (writing, brainstorming)
- `temperature = 1.0`: Maximum creativity

### 3. Structured Output

```javascript
const request = {
  contents: [{
    role: "user",
    parts: [{ text: "Extract the name and age from: John is 25. Return as JSON." }]
  }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "integer" }
      }
    }
  }
};
```

### 4. Multi-turn Conversations

```javascript
const contents = [
  { role: "user", parts: [{ text: "What is Python?" }] },
  { role: "model", parts: [{ text: "Python is a programming language..." }] },
  { role: "user", parts: [{ text: "How do I install it?" }] }
];
```

### 5. Error Handling

```javascript
try {
  const result = await model.generateContent(request);
  if (result.response.promptFeedback?.blockReason) {
    console.log("Blocked:", result.response.promptFeedback.blockReason);
  }
} catch (error) {
  if (error.status === 429) {
    // Rate limited — implement backoff
  }
}
```

### 6. Streaming

```javascript
const result = await model.generateContentStream(request);
for await (const chunk of result.stream) {
  const text = chunk.text();
  process.stdout.write(text);
}
```

---

## Gemini SDK Usage (Node.js)

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function chat(messages) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }]
    }))
  });

  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return result.response.text();
}
```

### Alternative: REST API Direct

```javascript
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
    generationConfig: { temperature: 0.7 }
  })
});
```

---

## References

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Models](https://ai.google.dev/models)
- [Prompting Guide](https://ai.google.dev/docs/prompting-intro)
- [Safety Settings](https://ai.google.dev/docs/safety-setting)
- [Pricing](https://ai.google.dev/pricing)
- [Context Caching](https://ai.google.dev/docs/context-caching)
