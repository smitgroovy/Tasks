# Setup Guide

## Prerequisites

- **Node.js** 18+ (for Node.js examples)
- **Python** 3.9+ (for Python examples)
- **NVIDIA API Key** (free tier available)

---

## Step 1: Get Your API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up or log in (free, no credit card)
3. Go to **Settings → API Keys**
4. Click **Generate Key** and copy it
5. Save it somewhere safe — you won't see it again

---

## Step 2: Clone the Repository

```bash
git clone https://github.com/smitgroovy/Tasks.git
cd Tasks/anthropic-cli-chatbot
```

---

## Step 3: Node.js Setup

```bash
cd node
npm install
cp .env.example .env
# Edit .env and add your NVIDIA API key
```

---

## Step 4: Python Setup

```bash
cd python

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your NVIDIA API key
```

---

## Step 5: Run the Examples

### Node.js — First API Call

```bash
cd node
node first-call.js
```

### Node.js — Chatbot

```bash
cd node
node chatbot.js
```

### Python — First API Call

```bash
cd python
python first_call.py
```

### Python — Chatbot

```bash
cd python
python chatbot.py
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Invalid API key | Check your `.env` file |
| `429 Too Many Requests` | Rate limit hit | Wait a few seconds and retry |
| `Module not found` | Dependencies not installed | Run `npm install` or `pip install -r requirements.txt` |
| `NVIDIA_API_KEY not set` | Missing env variable | Make sure `.env` file exists and has your key |
