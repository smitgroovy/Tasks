# Tool Specification & JSON Schema Design Guide

## Day 13 - Tool Use & Function Calling

### 1. Tool Specification Overview

Tool use (also called function calling) allows LLMs to interact with external tools and APIs. The LLM doesn't execute tools directly - it generates structured JSON describing which tool to call and with what arguments.

### 2. Anatomy of a Tool Specification

```json
{
  "type": "function",
  "function": {
    "name": "calculator",
    "description": "Perform basic arithmetic operations",
    "parameters": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "enum": ["add", "subtract", "multiply", "divide"],
          "description": "The arithmetic operation to perform"
        },
        "a": {
          "type": "number",
          "description": "First operand"
        },
        "b": {
          "type": "number",
          "description": "Second operand"
        }
      },
      "required": ["operation", "a", "b"]
    }
  }
}
```

### 3. JSON Schema Design Principles

#### Required Fields
- **type**: Always "object" for function parameters
- **properties**: Define each parameter with type and description
- **required**: List of mandatory parameters

#### Best Practices

1. **Clear Descriptions**: Write descriptions that help the LLM understand when and how to use the tool
   ```
   Bad:  "Does math"
   Good: "Performs arithmetic operations (add, subtract, multiply, divide) on two numbers"
   ```

2. **Use Enums for Fixed Options**: When a parameter has limited valid values
   ```json
   "operation": {
     "type": "string",
     "enum": ["add", "subtract", "multiply", "divide"]
   }
   ```

3. **Type Safety**: Always specify correct types
   - `number` for integers and floats
   - `string` for text
   - `boolean` for true/false
   - `array` for lists
   - `object` for complex structures

4. **Nested Objects**: For complex parameters
   ```json
   "location": {
     "type": "object",
     "properties": {
       "city": { "type": "string" },
       "country": { "type": "string" }
     },
     "required": ["city"]
   }
   ```

### 4. Tool Calling Flow

```
User Query → LLM → Tool Call (JSON) → Execute Tool → Result → LLM → Response
```

1. User sends a message
2. LLM analyzes and decides to call a tool
3. LLM generates structured JSON with tool name and arguments
4. Application executes the tool with those arguments
5. Tool result is sent back to the LLM
6. LLM generates final response incorporating tool output

### 5. Multi-Tool Design Patterns

#### Independent Tools
```json
{
  "tools": [
    { "function": { "name": "search", ... } },
    { "function": { "name": "calculate", ... } },
    { "function": { "name": "notify", ... } }
  ]
}
```

#### Tool Selection Guidelines
- Each tool should have a **single, clear responsibility**
- Descriptions should indicate **when** to use each tool
- Avoid overlapping functionality between tools

### 6. Error Handling in Tool Calls

Design tools to return structured errors:
```json
{
  "success": false,
  "error": "Division by zero is not allowed",
  "result": null
}
```

### 7. Security Considerations

- **Input Validation**: Always validate tool inputs
- **Rate Limiting**: Prevent abuse of external APIs
- **Sanitization**: Clean user inputs before processing
- **Scope Limitation**: Tools should have minimal necessary permissions

---

## Quick Reference: Common Parameter Types

| Type | Use Case | Example |
|------|----------|---------|
| `string` | Text, URLs, IDs | `"query": "weather in NYC"` |
| `number` | Math, quantities | `"amount": 42.5` |
| `integer` | Counts, indices | `"count": 10` |
| `boolean` | Flags, toggles | `"verbose": true` |
| `array` | Lists, collections | `"items": ["a", "b", "c"]` |
| `object` | Structured data | `"location": {"city": "NYC"}` |
| `enum` | Fixed choices | `"unit": "celsius"` |

---

## NVIDIA NIM Integration

### Overview

NVIDIA NIM (NVIDIA Inference Microservice) provides an OpenAI-compatible API for running LLMs with function calling support. This project uses NIM for tool-use agents.

### NIM API Details

| Property | Value |
|----------|-------|
| Base URL | `https://integrate.api.nvidia.com/v1` |
| API Format | OpenAI-compatible |
| Auth | Bearer token (`NVIDIA_API_KEY`) |
| Function Calling | Supported |

### Available Models

| Model | ID |
|-------|-----|
| Llama 3.3 70B | `meta/llama-3.3-70b-instruct` |
| Llama 4 Maverick 17B | `meta/llama-4-maverick-17b-128e-instruct` |
| Gemma 4 31B | `google/gemma-4-31b-it` |
| DeepSeek V4 Pro | `deepseek-ai/deepseek-v4-pro` |

### Tool Definition Format (OpenAI/NIM)

```javascript
// Tool definition
{
  type: "function",
  function: {
    name: "tool_name",
    description: "What this tool does",
    parameters: {
      type: "object",
      properties: {
        param1: { type: "string", description: "..." }
      },
      required: ["param1"]
    }
  }
}

// Tool call in response
message.tool_calls = [
  {
    id: "call_abc123",
    type: "function",
    function: {
      name: "tool_name",
      arguments: '{"param1": "value"}'
    }
  }
]

// Tool result sent back
{
  role: "tool",
  tool_call_id: "call_abc123",
  content: '{"result": "..."}'
}
```

### Example: Calling NIM with Tools

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const response = await client.chat.completions.create({
  model: 'meta/llama-3.3-70b-instruct',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is 15% of 200?' }
  ],
  tools: toolDefinitions,
  tool_choice: "auto",
  temperature: 0.3,
  max_tokens: 1024,
});

// Check if tool was called
if (response.choices[0].finish_reason === 'tool_calls') {
  const toolCalls = response.choices[0].message.tool_calls;
  // Execute tools and send results back...
}
```

### Model Fallback Strategy

When using NIM, implement model fallback for reliability:

```javascript
const MODELS = [
  'meta/llama-3.3-70b-instruct',
  'meta/llama-4-maverick-17b-128e-instruct',
  'google/gemma-4-31b-it',
  'deepseek-ai/deepseek-v4-pro',
];

async function createCompletionWithFallback(messages, tools) {
  for (const model of MODELS) {
    try {
      return await client.chat.completions.create({
        model,
        messages,
        tools,
      });
    } catch (error) {
      console.warn(`${model} failed, trying next...`);
    }
  }
  throw new Error('All models failed');
}
```
