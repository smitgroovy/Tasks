# NVIDIA NIM CLI Chatbot

A multi-turn chatbot built with the NVIDIA NIM API using Llama Nemotron Super 49B. Available in both Node.js and Python.

---

## Installation

```bash
git clone https://github.com/smitgroovy/Tasks.git
cd Tasks/anthropic-cli-chatbot
```

---

## Getting Your API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up (free, no credit card)
3. Go to **Settings → API Keys**
4. Click **Generate Key** and copy it

---

## Setup

### Node.js

```bash
cd node
npm install
cp .env.example .env
# Add your NVIDIA API key to .env
```

### Python

```bash
cd python
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
# Add your NVIDIA API key to .env
```

---

## Running

### First API Call (Node.js)

```bash
cd node
node first-call.js
```

### First API Call (Python)

```bash
cd python
python first_call.py
```

### Chatbot (Node.js)

```bash
cd node
node chatbot.js
```

### Chatbot (Python)

```bash
cd python
python chatbot.py
```

---

## Example Output

```
NIM Chatbot — Llama Nemotron Super 49B (type 'exit' to quit)

You: Hello
Bot: Hi there! How can I help you today?

You: What did I just say?
Bot: You said "Hello".

You: exit
Goodbye!
```

---

## Screenshots

> Add screenshots of the chatbot in action here

---

## Learnings

- **NVIDIA NIM API**: OpenAI-compatible API providing free access to 100+ open-source LLMs
- **Authentication**: Bearer token via `Authorization` header
- **Conversation history**: The `messages` array maintains context across turns
- **Model selection**: `nvidia/llama-3.3-nemotron-super-49b-v1.5` offers fast, free inference
- **OpenAI SDK reuse**: Same SDK works with NIM by just changing the base URL

---

## Challenges

- Understanding the difference between Anthropic and OpenAI message formats
- Handling API rate limits with proper retry logic
- Managing conversation history to avoid exceeding context window limits
- Keeping API keys secure and out of version control

---

## Future Improvements

- Add streaming responses for real-time output
- Add conversation persistence (save/load chat history)
- Support for system prompts and custom personalities
- Add token usage tracking per conversation
- Build a web-based UI version
- Compare performance across multiple NIM models

---

## Project Structure

```
anthropic-cli-chatbot/
├── node/
│   ├── chatbot.js
│   ├── first-call.js
│   ├── package.json
│   └── .env.example
├── python/
│   ├── chatbot.py
│   ├── first_call.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── anthropic-api-notes.md
│   └── setup-guide.md
├── README.md
└── .gitignore
```

---

## License

MIT
