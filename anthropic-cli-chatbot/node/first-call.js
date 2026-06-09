import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const client = new Anthropic();

async function main() {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: "Hello! What can you do?" }],
    });

    console.log("Response:", response.content[0].text);
    console.log("Tokens used:", response.usage);
  } catch (error) {
    console.error("API Error:", error.message);
  }
}

main();
