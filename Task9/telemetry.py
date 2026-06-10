import csv
import datetime
import os

CSV_FILE = "token_tracking.csv"
SAVINGS_FILE = "cache_savings.csv"

def log_api_call(model_name: str, input_tokens: int, output_tokens: int, total_tokens: int, cached: bool = False):
    file_exists = os.path.isfile(CSV_FILE)
    
    with open(CSV_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['timestamp', 'model_name', 'input_tokens', 'output_tokens', 'total_tokens', 'cached'])
        timestamp = datetime.datetime.now().isoformat()
        writer.writerow([timestamp, model_name, input_tokens, output_tokens, total_tokens, cached])

def log_cache_savings(input_uncached: int, input_cached: int, output_tokens: int):
    file_exists = os.path.isfile(SAVINGS_FILE)
    
    with open(SAVINGS_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['timestamp', 'input_tokens_uncached', 'input_tokens_cached', 'tokens_saved', 'savings_pct', 'output_tokens'])
        
        timestamp = datetime.datetime.now().isoformat()
        tokens_saved = input_uncached - input_cached
        savings_pct = (tokens_saved / input_uncached * 100) if input_uncached > 0 else 0
        writer.writerow([timestamp, input_uncached, input_cached, tokens_saved, f"{savings_pct:.1f}", output_tokens])
