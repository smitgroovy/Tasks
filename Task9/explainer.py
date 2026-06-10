import os
import argparse
import time
from dotenv import load_dotenv
from telemetry import log_api_call, log_cache_savings

load_dotenv(override=True)

MAX_CHARS = 40000
CACHE_TTL = "3600s"

NIM_API_URL = "https://integrate.api.nvidia.com/v1"
DEFAULT_NIM_MODEL = "meta/llama-3.1-8b-instruct"

def read_codebase(directory_path: str) -> str:
    content = []
    total_chars = 0
    ignore_dirs = {'.git', '__pycache__', 'node_modules', '.venv', 'venv'}
    
    for root, dirs, files in os.walk(directory_path):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            file_path = os.path.join(root, file)
            if file.endswith('.pyc'):
                continue
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    file_content = f.read()
                header = f"\n\n--- File: {os.path.relpath(file_path, directory_path)} ---\n"
                chunk = header + file_content
                if total_chars + len(chunk) > MAX_CHARS:
                    content.append(f"\n\n--- File: {os.path.relpath(file_path, directory_path)} [TRUNCATED] ---")
                    break
                content.append(chunk)
                total_chars += len(chunk)
            except UnicodeDecodeError:
                pass
        if total_chars > MAX_CHARS:
            break
    return "".join(content)

def build_prompt(codebase_content: str) -> str:
    return f"""You are an expert software engineer.
Please explain the following codebase. Summarize its purpose, architecture, and key components.

Codebase content:
{codebase_content}
"""

def run_gemini(api_key, codebase_content, prompt, no_cache):
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=api_key)
    model_name = 'gemini-2.5-flash'

    if no_cache:
        print("Running WITHOUT caching...")
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2)
        )
        tokens_in = response.usage_metadata.prompt_token_count if response.usage_metadata else 0
        tokens_out = response.usage_metadata.candidates_token_count if response.usage_metadata else 0
        tokens_total = response.usage_metadata.total_token_count if response.usage_metadata else 0

        print("\n================ CODEBASE EXPLANATION ================\n")
        print(response.text)
        print("\n======================================================\n")

        log_api_call(model_name, tokens_in, tokens_out, tokens_total, cached=False)
        print(f"[Telemetry] Logged {tokens_total} total tokens (uncached).")
    else:
        print("Creating cached content...")
        try:
            cached_content = client.caches.create(
                model=model_name,
                config=types.CreateCachedContentConfig(
                    contents=codebase_content,
                    ttl=CACHE_TTL,
                    display_name="codebase-cache"
                )
            )
            print(f"Cached content created: {cached_content.name}")

            print("Running WITH caching...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    cached_content=cached_content.name
                )
            )
            in_cached = response.usage_metadata.prompt_token_count if response.usage_metadata else 0
            out_cached = response.usage_metadata.candidates_token_count if response.usage_metadata else 0
            total_cached = response.usage_metadata.total_token_count if response.usage_metadata else 0

            print("\n================ CODEBASE EXPLANATION ================\n")
            print(response.text)
            print("\n======================================================\n")

            log_api_call(model_name, in_cached, out_cached, total_cached, cached=True)
            print(f"[Telemetry] Logged {total_cached} total tokens (cached).")

            print("\nRunning WITHOUT caching for comparison...")
            response2 = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            in_uncached = response2.usage_metadata.prompt_token_count if response2.usage_metadata else 0
            out_uncached = response2.usage_metadata.candidates_token_count if response2.usage_metadata else 0
            total_uncached = response2.usage_metadata.total_token_count if response2.usage_metadata else 0

            log_api_call(model_name, in_uncached, out_uncached, total_uncached, cached=False)
            print(f"[Telemetry] Logged {total_uncached} total tokens (uncached).")

            log_cache_savings(in_uncached, in_cached, out_cached)

            saved = in_uncached - in_cached
            pct = (saved / in_uncached * 100) if in_uncached > 0 else 0
            print(f"\n========== SAVINGS REPORT ==========")
            print(f"Input tokens (uncached): {in_uncached}")
            print(f"Input tokens (cached):   {in_cached}")
            print(f"Tokens saved by cache:   {saved}")
            print(f"Savings percentage:      {pct:.1f}%")
            print(f"====================================")

            client.caches.delete(name=cached_content.name)
            print("Cache cleaned up.")
        except Exception as e:
            print(f"Caching failed: {e}")
            print("Falling back to uncached call...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(temperature=0.2)
            )
            t = response.usage_metadata
            log_api_call(model_name, t.prompt_token_count, t.candidates_token_count, t.total_token_count, cached=False)
            print("\n================ CODEBASE EXPLANATION ================\n")
            print(response.text)
            print("\n======================================================\n")

def run_nim(api_key, codebase_content, prompt, no_cache, model):
    from openai import OpenAI

    client = OpenAI(base_url=NIM_API_URL, api_key=api_key)
    model_name = model or DEFAULT_NIM_MODEL

    print(f"Provider: NVIDIA NIM")
    print(f"Model:    {model_name}")
    print(f"API URL:  {NIM_API_URL}")
    print(f"Key:      {api_key[:12]}...{api_key[-4:]}")
    print()

    print("Testing API connection...")
    try:
        test = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": "Say OK"}],
            max_tokens=5
        )
        print(f"API test successful: {test.choices[0].message.content}\n")
    except Exception as e:
        print(f"API test failed: {e}\n")
        return

    def make_call(msgs):
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=msgs,
                temperature=0.2,
                max_tokens=4096
            )
            text = response.choices[0].message.content
            usage = response.usage
            tokens_in = usage.prompt_tokens if usage else 0
            tokens_out = usage.completion_tokens if usage else 0
            tokens_total = usage.total_tokens if usage else 0
            return text, tokens_in, tokens_out, tokens_total
        except Exception as e:
            print(f"\nAPI Error: {e}")
            print("\nTroubleshooting:")
            print("  1. Regenerate your API key at https://build.nvidia.com")
            print("  2. Set it: set NVIDIA_API_KEY=nvapi-new_key_here")
            print("  3. Check model access at https://build.nvidia.com/models")
            raise

    msgs = [{"role": "user", "content": prompt}]

    if no_cache:
        print(f"Running WITHOUT caching on NIM ({model_name})...")
        text, in_tok, out_tok, total_tok = make_call(msgs)

        print("\n================ CODEBASE EXPLANATION ================\n")
        print(text)
        print("\n======================================================\n")

        log_api_call(model_name, in_tok, out_tok, total_tok, cached=False)
        print(f"[Telemetry] Logged {total_tok} total tokens (uncached).")
    else:
        print(f"Running on NIM ({model_name}) with prefix caching...")
        print("NIM KV Cache Reuse is automatic — same prefix = cache hit on 2nd+ call.\n")

        print("Request 1 (cold — fills cache)...")
        t1_start = time.time()
        text1, in1, out1, total1 = make_call(msgs)
        t1_elapsed = time.time() - t1_start

        print("\n================ CODEBASE EXPLANATION ================\n")
        print(text1)
        print("\n======================================================\n")

        log_api_call(model_name, in1, out1, total1, cached=False)
        print(f"[Telemetry] Logged {total1} total tokens (cold call, {t1_elapsed:.2f}s).")

        print("\nRequest 2 (warm — should hit KV cache)...")
        t2_start = time.time()
        text2, in2, out2, total2 = make_call(msgs)
        t2_elapsed = time.time() - t2_start

        log_api_call(model_name, in2, out2, total2, cached=True)
        print(f"[Telemetry] Logged {total2} total tokens (cached, {t2_elapsed:.2f}s).")

        log_cache_savings(in1, in2, out2)

        saved = in1 - in2
        pct = (saved / in1 * 100) if in1 > 0 else 0
        speedup = ((t1_elapsed - t2_elapsed) / t1_elapsed * 100) if t1_elapsed > 0 else 0
        print(f"\n========== SAVINGS REPORT ==========")
        print(f"Input tokens (cold):  {in1}")
        print(f"Input tokens (warm):  {in2}")
        print(f"Tokens saved:         {saved}")
        print(f"Savings percentage:   {pct:.1f}%")
        print(f"Cold time:            {t1_elapsed:.2f}s")
        print(f"Warm time:            {t2_elapsed:.2f}s")
        print(f"Speedup:              {speedup:.1f}%")
        print(f"====================================")

def main():
    parser = argparse.ArgumentParser(description='Explain a codebase using LLM with prompt caching.')
    parser.add_argument('directory', type=str, help='Path to the directory to explain')
    parser.add_argument('--provider', choices=['gemini', 'nim'], default='nim', help='LLM provider (default: nim)')
    parser.add_argument('--model', type=str, default=None, help='Model name (NIM only, default: meta/llama-3.1-8b-instruct)')
    parser.add_argument('--no-cache', action='store_true', help='Run without caching for comparison')
    args = parser.parse_args()

    print(f"Reading codebase from: {args.directory}")
    codebase_content = read_codebase(args.directory)
    
    if not codebase_content.strip():
        print("No text files found or directory is empty.")
        return

    prompt = build_prompt(codebase_content)

    if args.provider == 'gemini':
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            print("Error: GEMINI_API_KEY environment variable not set.")
            return
        run_gemini(api_key, codebase_content, prompt, args.no_cache)
    elif args.provider == 'nim':
        api_key = os.environ.get('NVIDIA_API_KEY')
        if not api_key:
            print("Error: NVIDIA_API_KEY environment variable not set.")
            print("Get a free key at: https://build.nvidia.com")
            return
        print(f"API key loaded: {api_key[:8]}...{api_key[-4:]}")
        run_nim(api_key, codebase_content, prompt, args.no_cache, args.model)

if __name__ == "__main__":
    main()
