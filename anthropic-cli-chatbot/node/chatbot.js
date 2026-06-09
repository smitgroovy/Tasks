import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const client = new Anthropic();
const messages = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function chat() {
  console.log("Claude Chatbot (type 'exit' to quit)\n");

  while (true) {
    const input = await ask("You: ");
    if (input.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: input });

    try {
      const res = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages,
      });

      const reply = res.content[0].text;
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
