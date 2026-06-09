import OpenAI from "openai";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config({ override: true });

const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

const messages = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function chat() {
  console.log("NIM Chatbot — Llama 3.1 8B (type 'exit' to quit)\n");

  while (true) {
    const input = await ask("You: ");
    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });

    try {
      const res = await client.chat.completions.create({
        model: "meta/llama-3.1-8b-instruct",
        messages,
      });

      const reply = res.choices[0].message.content;
      messages.push({ role: "assistant", content: reply });
      console.log("Bot:", reply, "\n");
    } catch (err) {
      console.error("Error:", err.message, "\n");
    }
  }

  rl.close();
  console.log("Goodbye!");
}

chat();
