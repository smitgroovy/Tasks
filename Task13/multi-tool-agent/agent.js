// Multi-Tool Agent - Day 13 Final Deliverable
// 3 Tools: Calculator + Web Search + Slack Notification
// Powered by OpenRouter API

import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { toolDefinitions, executeTool } from './tools.js';

dotenv.config({ override: true });

// ============================================
// OPENROUTER CONFIGURATION
// ============================================

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const MODELS = [
  'openrouter/free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
];

function getClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not set. Get one at https://openrouter.ai/keys');
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: OPENROUTER_BASE_URL,
  });
}

// ============================================
// SYSTEM PROMPT
// ============================================

const SYSTEM_PROMPT = `You are a powerful AI assistant with access to three tools:

1. **calculate** - Perform mathematical calculations
   - Use for: Any math, percentages, conversions
   - Example: "What's 15% of 200?" → calculate({expression: "15% of 200"})

2. **web_search** - Search the internet for information
   - Use for: Current events, facts, definitions, research
   - Example: "What's the latest news about AI?" → web_search({query: "latest AI news"})

3. **send_slack_notification** - Send messages to Slack
   - Use for: Team notifications, alerts, reminders
   - Example: "Tell the team we're deploying" → send_slack_notification({message: "Deploying v2.0 now", channel: "engineering"})

GUIDELINES:
- Analyze the user's request carefully before choosing a tool
- You can use MULTIPLE tools in sequence if needed
- Always explain what you're doing and why
- Format responses clearly and cite sources when using search
- For Slack messages, ask for confirmation if the message seems critical

When you don't need a tool, just respond normally.`;

// ============================================
// AGENT CLASS
// ============================================

class MultiToolAgent {
  constructor() {
    this.conversationHistory = [];
    this.toolCallCount = 0;
    this.sessionStats = {
      calculations: 0,
      searches: 0,
      notifications: 0,
      modelsUsed: new Set()
    };
  }

  /**
   * Try completion with model fallback
   */
  async createCompletion(messages) {
    const client = getClient();
    let lastError = null;

    for (const model of MODELS) {
      try {
        console.log(`🤖 Trying model: ${model}`);

        const response = await client.chat.completions.create({
          model: model,
          messages: messages,
          tools: toolDefinitions,
          tool_choice: "auto",
          temperature: 0.3,
          max_tokens: 2048,
        });

        this.sessionStats.modelsUsed.add(model);
        console.log(`✅ Using model: ${model}`);
        return response;

      } catch (error) {
        console.warn(`⚠️  Model ${model} failed: ${error.message}`);
        lastError = error;
        continue;
      }
    }

    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  /**
   * Process a user message and handle tool calls
   */
  async processMessage(userMessage) {
    // Add user message to history
    this.conversationHistory.push({
      role: "user",
      content: userMessage
    });

    console.log("\n" + "╔" + "═".repeat(48) + "╗");
    console.log(`║ 👤 User: ${userMessage.substring(0, 37).padEnd(37)} ║`);
    console.log("╚" + "═".repeat(48) + "╝");

    try {
      // Call OpenRouter with tools
      const response = await this.createCompletion([
        { role: "system", content: SYSTEM_PROMPT },
        ...this.conversationHistory
      ]);
      return await this.processResponse(response);

    } catch (error) {
      console.error('\n❌ API Error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process LLM response and handle tool calls
   */
  async processResponse(response) {
    const choice = response.choices[0];
    const message = choice.message;

    let assistantMessage = message.content || "";
    let toolCalls = message.tool_calls || [];

    // Display assistant message
    if (assistantMessage) {
      console.log(`\n🤖 Assistant: ${assistantMessage}`);
    }

    // If no tool calls, return response
    if (choice.finish_reason !== "tool_calls" || toolCalls.length === 0) {
      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage
      });
      return { success: true, message: assistantMessage, toolCalls: 0 };
    }

    // Add assistant response to history (with tool calls)
    this.conversationHistory.push({
      role: "assistant",
      content: assistantMessage,
      tool_calls: toolCalls
    });

    // Execute all tool calls
    console.log(`\n🎯 Processing ${toolCalls.length} tool call(s)...`);

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      let functionArgs;

      try {
        functionArgs = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        functionArgs = {};
      }

      console.log(`\n🎯 Tool Call: ${functionName}`);
      console.log(`   Parameters:`, JSON.stringify(functionArgs, null, 2));

      // Execute the tool
      const result = await executeTool(functionName, functionArgs);

      // Update stats
      this.toolCallCount++;
      if (functionName === 'calculate') this.sessionStats.calculations++;
      if (functionName === 'web_search') this.sessionStats.searches++;
      if (functionName === 'send_slack_notification') this.sessionStats.notifications++;

      // Add tool result to history
      this.conversationHistory.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      });
    }

    // Get final response from LLM
    const finalResponse = await this.createCompletion([
      { role: "system", content: SYSTEM_PROMPT },
      ...this.conversationHistory
    ]);

    const finalChoice = finalResponse.choices[0];
    const finalMessage = finalChoice.message;

    let finalContent = finalMessage.content || "";
    if (finalContent) {
      console.log(`\n🤖 Assistant: ${finalContent}`);
    }

    // Check for additional tool calls (recursive)
    if (finalChoice.finish_reason === "tool_calls" && finalMessage.tool_calls?.length > 0) {
      this.conversationHistory.push({
        role: "assistant",
        content: finalContent,
        tool_calls: finalMessage.tool_calls
      });

      const additionalResult = await this.processResponse(finalResponse);
      return {
        success: true,
        message: finalContent + "\n" + (additionalResult.message || ""),
        toolCalls: toolCalls.length + (additionalResult.toolCalls || 0)
      };
    }

    this.conversationHistory.push({
      role: "assistant",
      content: finalContent
    });

    return {
      success: true,
      message: finalContent,
      toolCalls: toolCalls.length
    };
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      totalToolCalls: this.toolCallCount,
      ...this.sessionStats,
      modelsUsed: Array.from(this.sessionStats.modelsUsed),
      conversationLength: this.conversationHistory.length
    };
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    console.log('\n🔄 Conversation history cleared');
  }
}

// ============================================
// INTERACTIVE CLI
// ============================================

async function main() {
  console.log("\n" + "╔══════════════════════════════════════════════════════╗");
  console.log("║     🛠️  Multi-Tool Agent - Day 13 Deliverable        ║");
  console.log("║         Powered by OpenRouter API                    ║");
  console.log("║      Search • Calculator • Slack Notifications      ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log("\nAvailable tools:");
  console.log("  🧮 calculate    - Math calculations");
  console.log("  🔍 web_search   - Search the internet");
  console.log("  📢 slack_notify - Send Slack notifications");
  console.log('\nCommands: "exit" to quit | "clear" to reset | "stats" for statistics\n');

  const agent = new MultiToolAgent();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const trimmed = input.trim();

      // Handle special commands
      if (trimmed.toLowerCase() === 'exit') {
        console.log('\n📊 Session Statistics:');
        console.log(JSON.stringify(agent.getStats(), null, 2));
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      }

      if (trimmed.toLowerCase() === 'clear') {
        agent.clearHistory();
        askQuestion();
        return;
      }

      if (trimmed.toLowerCase() === 'stats') {
        console.log('\n📊 Session Statistics:');
        console.log(JSON.stringify(agent.getStats(), null, 2));
        askQuestion();
        return;
      }

      if (trimmed) {
        try {
          const result = await agent.processMessage(trimmed);
          if (result.toolCalls > 0) {
            console.log(`\n📊 Tool calls this turn: ${result.toolCalls}`);
          }
        } catch (error) {
          console.error('\n❌ Error:', error.message);
        }
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Run if this is the main module
main().catch(console.error);

export { MultiToolAgent };
