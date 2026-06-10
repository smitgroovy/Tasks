# Prompt Caching · Cost Optimization (Day 9)

A codebase explainer tool with prompt caching support for Gemini and NVIDIA NIM.

## Features

- **Codebase Explainer** — Reads a directory and explains its purpose, architecture, and key components
- **Dual Provider Support** — Works with Gemini (explicit caching) and NIM (KV cache reuse)
- **Savings Measurement** — Compares cached vs uncached token usage and reports savings percentage
- **Telemetry** — Logs every API call to CSV for tracking

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set your API key:
   ```
   set NVIDIA_API_KEY=nvapi-your_key_here
   ```
   Or for Gemini:
   ```
   set GEMINI_API_KEY=your_key_here
   ```

## Usage

```bash
# NIM (default) with KV cache reuse
run_explainer.bat .

# NIM with a specific model
run_explainer.bat . --model deepseek-ai/deepseek-r1

# Gemini with explicit caching
run_explainer.bat . --provider gemini

# Without caching (for comparison)
run_explainer.bat . --no-cache
```

## Supported Models (NIM)

| Model | Description |
|-------|-------------|
| `meta/llama-3.1-8b-instruct` | Fast, lightweight (default) |
| `nvidia/llama-3.1-nemotron-70b-instruct` | Higher quality |
| `deepseek-ai/deepseek-r1` | Strong reasoning |

Get a free API key at [build.nvidia.com](https://build.nvidia.com).

## How Caching Works

**Gemini:** Uses explicit `cached_content` API — caches the codebase and reuses it across calls. Requires paid API key.

**NIM:** Uses automatic **KV Cache Reuse** — sends the same prefix (codebase) with different questions. The server caches the prefix automatically. First call is cold, subsequent calls hit the cache.

## Output Files

| File | Description |
|------|-------------|
| `token_tracking.csv` | Every API call logged (timestamp, model, tokens, cached flag) |
| `cache_savings.csv` | Before/after token counts and savings percentage |

## CSV Columns

**token_tracking.csv:** `timestamp, model_name, input_tokens, output_tokens, total_tokens, cached`

**cache_savings.csv:** `timestamp, input_tokens_uncached, input_tokens_cached, tokens_saved, savings_pct, output_tokens`
