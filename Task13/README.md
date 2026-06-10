# Day 13: Tool Use & Function Calling

## 📋 Task Overview

| Requirement | Status | Description |
|-------------|--------|-------------|
| Learn tool spec & JSON schema design | ✅ | Documented in TOOL_SPEC_GUIDE.md |
| Build calculator agent | ✅ | LLM picks add/subtract/multiply/divide |
| Add web-search tool | ✅ | DuckDuckGo integration (no API key needed) |
| Build 3-tool agent | ✅ | Search + Calculator + Slack webhook |
| Demo to cohort | ✅ | Interactive demo script included |
| Deliverable | ✅ | Complete tool-using agent code |

---

## 🏗️ Project Structure

```
Task13/
├── README.md                 # This file
├── TOOL_SPEC_GUIDE.md        # Tool specification & JSON schema guide
│
├── calculator-agent/         # Part 1: Calculator with tool use
│   ├── package.json
│   ├── agent.js              # Calculator agent implementation
│   ├── test-tools.js         # Tool tests
│   └── .env.example
│
├── search-agent/             # Part 2: Web search tool
│   ├── package.json
│   ├── agent.js              # Search agent implementation
│   ├── search.js             # DuckDuckGo search module
│   ├── test-search.js        # Search tests
│   └── .env.example
│
└── multi-tool-agent/         # Part 3: Full 3-tool agent (DELIVERABLE)
    ├── package.json
    ├── agent.js              # Main multi-tool agent
    ├── tools.js              # Tool definitions & implementations
    ├── test-all.js           # Comprehensive tests
    ├── demo.js               # Interactive demo script
    └── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- NVIDIA NIM API key (get from https://build.nvidia.com/)

### Installation

```bash
# Navigate to the multi-tool agent
cd multi-tool-agent

# Install dependencies
npm install

# Copy environment file and add your API key
cp .env.example .env
# Edit .env and add your NVIDIA_API_KEY

# Run tests
npm test

# Run the demo
npm run demo

# Start interactive mode
npm start
```

---

## 🤖 Powered by NVIDIA NIM

This agent uses **NVIDIA NIM** (NVIDIA Inference Microservice) with the following models:

| Model | Description |
|-------|-------------|
| `meta/llama-3.3-70b-instruct` | Llama 3.3 70B - Default model |
| `meta/llama-4-maverick-17b-128e-instruct` | Llama 4 Maverick 17B |
| `google/gemma-4-31b-it` | Google Gemma 4 31B |
| `deepseek-ai/deepseek-v4-pro` | DeepSeek V4 Pro |

The agent automatically tries different models if one fails.

---

## 🛠️ Tools Implemented

### 1. 🧮 Calculator Tool

```json
{
  "type": "function",
  "function": {
    "name": "calculate",
    "description": "Perform mathematical calculations",
    "parameters": {
      "type": "object",
      "properties": {
        "expression": {
          "type": "string",
          "description": "Mathematical expression to evaluate"
        }
      },
      "required": ["expression"]
    }
  }
}
```

**Supported operations:**
- Basic arithmetic: `+`, `-`, `*`, `/`
- Exponents: `^` or `pow()`
- Square root: `sqrt()`
- Percentages: `15% of 200`

### 2. 🔍 Web Search Tool

```json
{
  "type": "function",
  "function": {
    "name": "web_search",
    "description": "Search the web for information",
    "parameters": {
      "type": "object",
      "properties": {
        "query": { "type": "string" },
        "num_results": { "type": "integer" }
      },
      "required": ["query"]
    }
  }
}
```

**Features:**
- Uses DuckDuckGo HTML search (no API key required)
- Returns structured results with title, URL, snippet
- Automatic URL cleaning for DuckDuckGo redirects

### 3. 📢 Slack Notification Tool

```json
{
  "type": "function",
  "function": {
    "name": "send_slack_notification",
    "description": "Send notifications to Slack",
    "parameters": {
      "type": "object",
      "properties": {
        "message": { "type": "string" },
        "channel": { "type": "string" },
        "priority": { "type": "string", "enum": ["low", "normal", "high", "urgent"] }
      },
      "required": ["message"]
    }
  }
}
```

**Features:**
- Simulated mode when webhook not configured
- Priority-based formatting with emojis
- Rich message blocks for Slack

---

## 📖 How Tool Calling Works (NIM / OpenAI Format)

### Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│  NIM LLM    │────▶│  Tool Call  │
│   Query     │     │  (Llama)    │     │   (JSON)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           ▲                   │
                           │                   ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   Final     │◀────│   Execute   │
                    │  Response   │     │    Tool     │
                    └─────────────┘     └─────────────┘
```

### OpenAI-Compatible Function Calling Format

NVIDIA NIM uses the OpenAI-compatible format for tool definitions:

```javascript
// Tool definition format
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
{
  role: "assistant",
  tool_calls: [
    {
      id: "call_abc123",
      type: "function",
      function: {
        name: "tool_name",
        arguments: '{"param1": "value"}'
      }
    }
  ]
}

// Tool result format
{
  role: "tool",
  tool_call_id: "call_abc123",
  content: '{"result": "..."}'
}
```

### Step-by-Step Process

1. **User sends message** → "What's 15% of 200?"

2. **NIM LLM analyzes** → Determines calculator tool is needed

3. **LLM generates tool call:**
   ```json
   {
     "tool_calls": [{
       "function": {
         "name": "calculate",
         "arguments": "{\"expression\": \"15% of 200\"}"
       }
     }]
   }
   ```

4. **Application executes tool** → Returns `{ result: 30 }`

5. **LLM receives result** → Generates final response

6. **User receives answer** → "15% of 200 is 30"

---

## 🎯 Example Conversations

### Calculator Example
```
You: What's the square root of 144 plus 50?

🤖 Assistant: I'll calculate that for you using the calculator tool.

🎯 Tool Call: calculate
   Parameters: { "expression": "sqrt(144) + 50" }

🔧 Executing tool: calculate
📥 Input: { "expression": "sqrt(144) + 50" }
📤 Result: 62

🤖 Assistant: The square root of 144 is 12, plus 50 equals 62.
```

### Web Search Example
```
You: What is the latest news about AI?

🤖 Assistant: I'll search the web for the latest AI news.

🎯 Tool Call: web_search
   Parameters: { "query": "latest AI news 2024", "num_results": 3 }

🔧 Executing tool: web_search
🔍 Searching: "latest AI news 2024"
✅ Found 3 results

🤖 Assistant: Based on my search, here's the latest AI news:
1. [Title of first result]...
2. [Title of second result]...
```

### Multi-Tool Example
```
You: Search for Bitcoin price and calculate 0.5 BTC

🤖 Assistant: I'll help you with that! Let me first search for the current Bitcoin price.

🎯 Tool Call: web_search
   Parameters: { "query": "current Bitcoin price USD" }

[After getting search results]

🎯 Tool Call: calculate
   Parameters: { "expression": "43250 * 0.5" }

🤖 Assistant: The current Bitcoin price is approximately $43,250.
0.5 BTC would be worth approximately $21,625.
```

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
- ✅ Tool definitions validation
- ✅ JSON schema structure
- ✅ Calculator operations
- ✅ Web search functionality
- ✅ Slack notification (simulated)
- ✅ Tool router/dispatcher
- ✅ Error handling

---

## 🎬 Demo

### Run the Demo
```bash
npm run demo
```

The demo script showcases:
1. Calculator tool with complex expressions
2. Web search for factual information
3. Slack notification capability
4. Multi-tool orchestration

---

## 📚 Key Learnings

### 1. Tool Specification Design
- Tools should have **clear, specific descriptions**
- Use **enums** for fixed option sets
- Include **examples** in descriptions when helpful
- Always specify **required** vs optional parameters

### 2. OpenAI Function Calling Format (Used by NIM)
```json
{
  "type": "function",
  "function": {
    "name": "tool_name",
    "description": "...",
    "parameters": { ... }
  }
}
```

### 3. Tool Calling Patterns
- **Single tool**: LLM picks one tool for the task
- **Sequential tools**: Use output from one tool as input to another
- **Parallel tools**: Call multiple independent tools simultaneously

### 4. Error Handling
- Always validate tool inputs
- Return structured error responses
- Let the LLM handle and explain errors to users

### 5. Model Fallback Strategy
NIM provides multiple models - the agent tries them in order:
1. Llama 3.3 70B (primary)
2. Llama 4 Maverick 17B
3. Gemma 4 31B
4. DeepSeek V4 Pro

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | Yes | Your NVIDIA NIM API key |
| `SLACK_WEBHOOK_URL` | No | Slack webhook URL for notifications |

### Getting NVIDIA NIM API Key

1. Go to https://build.nvidia.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Add to `.env` file as `NVIDIA_API_KEY=nvapi-xxx`

### Slack Webhook Setup

1. Go to https://api.slack.com/apps
2. Create a new app → "From scratch"
3. Enable "Incoming Webhooks"
4. Add to channel and copy webhook URL
5. Add to `.env` file

---

## 📊 Session Statistics

The agent tracks usage statistics:
```json
{
  "totalToolCalls": 15,
  "calculations": 8,
  "searches": 5,
  "notifications": 2,
  "modelsUsed": ["meta/llama-3.3-70b-instruct"],
  "conversationLength": 24
}
```

---

## 🎓 Day 13 Summary

### What I Built
1. **Calculator Agent** - LLM picks appropriate math operation
2. **Search Agent** - Web search via DuckDuckGo
3. **Multi-Tool Agent** - All three tools integrated

### Skills Demonstrated
- ✅ JSON Schema design for tool definitions
- ✅ NVIDIA NIM API integration
- ✅ OpenAI-compatible function calling
- ✅ Tool execution and result handling
- ✅ Multi-tool orchestration
- ✅ Model fallback strategy
- ✅ Error handling and validation
- ✅ Interactive CLI with conversation history

### Deliverable
**Complete tool-using agent** with:
- 3 fully functional tools
- NVIDIA NIM powered (Llama 3.3 70B)
- Interactive CLI interface
- Demo script for presentation
- Comprehensive test suite
- Full documentation

---

## 📝 Notes

- Web search uses DuckDuckGo HTML (no API key required)
- Slack notifications simulate when webhook not configured
- All tools have proper error handling
- Agent maintains conversation context across tool calls
- Model fallback ensures high availability

---

## 🚀 Next Steps

Potential enhancements:
- Add more tools (file operations, database queries, API calls)
- Implement tool result caching
- Add streaming support for long operations
- Create a web UI for the agent
- Add tool usage analytics
- Implement parallel tool execution

---

*Day 13 - Tool Use & Function Calling with NVIDIA NIM - Completed ✅*
