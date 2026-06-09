import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"],
)

try:
    response = client.chat.completions.create(
        model="nvidia/llama-3.3-nemotron-super-49b-v1.5",
        messages=[{"role": "user", "content": "Hello! What can you do?"}],
    )
    print("Response:", response.choices[0].message.content)
    print("Usage:", response.usage)
except Exception as e:
    print("API Error:", e)
