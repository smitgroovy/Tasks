# Anthropic CLI Chatbot

A multi-turn chatbot built with the Anthropic Claude API. Available in both Node.js and Python.

---

## Installation

```bash
git clone https://github.com/smitgroovy/Tasks.git
cd Tasks/anthropic-cli-chatbot
```

---

## Getting Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key** and copy it

---

## Setup

### Node.js

```bash
cd node
npm install
cp .env.example .env
# Add your API key to .env
```

### Python

```bash
cd python
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env
# Add your API key to .env
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
Claude Chatbot (type 'exit' to quit)

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

- **Anthropic Messages API**: REST-based API that accepts conversation history and returns structured responses
- **Authentication**: API key passed via `x-api-key` header
- **Conversation history**: The `messages` array maintains context across turns
- **Model selection**: `claude-sonnet-4-6` offers the best balance of speed and intelligence
- **SDK differences**: Node.js uses ES modules, Python uses synchronous calls by default

---

## Challenges

- Understanding that `max_tokens` is required even for short responses
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
- Add support for image and file inputs

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
