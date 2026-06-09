import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      messages: [{ role: "user", content: "Hello! What can you do?" }],
    });

    console.log("Response:", response.choices[0].message.content);
    console.log("Usage:", response.usage);
  } catch (error) {
    console.error("API Error:", error.message);
  }
}

main();
