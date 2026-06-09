import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

client = Anthropic()

try:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Hello! What can you do?"}],
    )
    print("Response:", response.content[0].text)
    print("Tokens used:", response.usage)
except Exception as e:
    print("API Error:", e)
