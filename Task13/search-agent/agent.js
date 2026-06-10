// Search Agent with Web Search Tool Use - Day 13
// Powered by OpenRouter API

import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as readline from 'readline';
import { searchWeb, formatResults, formatForLLM } from './search.js';

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
// TOOL DEFINITIONS (OpenAI Function Calling Format)
// ============================================

const searchTools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: `Search the web for current information. Use this tool when:
- User asks about current events, news, or recent happenings
- User needs factual information that may have changed
- User asks "what is", "who is", "when did" type questions
- User needs to find specific websites or resources
Do NOT use for:
- Mathematical calculations
- Personal opinions or creative writing
- Information that doesn't require web access`,
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query. Be specific and concise for best results."
          },
          num_results: {
            type: "integer",
            description: "Number of results to return (1-10). Default is 5.",
            minimum: 1,
            maximum: 10
          }
        },
        required: ["query"]
      }
    }
  }
];

// ============================================
// TOOL EXECUTION FUNCTIONS
// ============================================

async function executeTool(toolName, input) {
  console.log(`\n🔧 Executing tool: ${toolName}`);
  console.log(`📥 Input:`, JSON.stringify(input, null, 2));

  try {
    switch (toolName) {
      case 'web_search': {
        const results = await searchWeb(input.query, input.num_results || 5);
        const formatted = formatForLLM(results);
        return {
          success: true,
          results: formatted,
          count: results.length
        };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// ============================================
// AGENT CONVERSATION HANDLER
// ============================================

async function runAgent(userMessage, conversationHistory = []) {
  const client = getClient();

  // Add user message to history
  conversationHistory.push({
    role: "user",
    content: userMessage
  });

  console.log("\n" + "=".repeat(50));
  console.log(`👤 User: ${userMessage}`);
  console.log("=".repeat(50));

  let lastError = null;

  for (const model of MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      // Call OpenRouter with tools
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: `You are a helpful research assistant with web search capabilities.

When answering questions:
1. Determine if web search is needed (current events, facts, recent info)
2. If yes, use the web_search tool with a well-crafted query
3. Analyze the search results
4. Provide a comprehensive answer based on the results

Always cite your sources when using search results.
If the search doesn't find good results, say so and suggest alternative searches.`
          },
          ...conversationHistory
        ],
        tools: searchTools,
        tool_choice: "auto",
        temperature: 0.3,
        max_tokens: 1024,
      });

      console.log(`✅ Using model: ${model}`);

      const choice = response.choices[0];
      const message = choice.message;

      let assistantMessage = message.content || "";
      let toolCalls = message.tool_calls || [];

      // Display assistant message
      if (assistantMessage) {
        console.log(`\n🤖 Assistant: ${assistantMessage}`);
      }

      // If there are tool calls, execute them and continue
      if (choice.finish_reason === "tool_calls" && toolCalls.length > 0) {
        // Add assistant response to history
        conversationHistory.push({
          role: "assistant",
          content: assistantMessage,
          tool_calls: toolCalls
        });

        // Execute each tool
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

          const result = await executeTool(functionName, functionArgs);

          // Add tool result to history
          conversationHistory.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }

        // Get final response from LLM
        const finalResponse = await client.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a helpful research assistant. Synthesize search results into clear, accurate answers. Always cite sources."
            },
            ...conversationHistory
          ],
          tools: searchTools,
          temperature: 0.3,
          max_tokens: 1024,
        });

        const finalMessage = finalResponse.choices[0].message;
        if (finalMessage.content) {
          assistantMessage += "\n" + finalMessage.content;
          console.log(`\n🤖 Assistant: ${finalMessage.content}`);
        }

        // Add final assistant message to history
        conversationHistory.push({
          role: "assistant",
          content: finalMessage.content
        });

        return {
          response: assistantMessage,
          history: conversationHistory,
          toolCalls: toolCalls.length
        };
      }

      // No tool calls, just return the response
      conversationHistory.push({
        role: "assistant",
        content: assistantMessage
      });

      return {
        response: assistantMessage,
        history: conversationHistory,
        toolCalls: 0
      };

    } catch (error) {
      console.warn(`⚠️  Model ${model} failed: ${error.message}`);
      lastError = error;
      continue;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError?.message}`);
}

// ============================================
// INTERACTIVE CLI
// ============================================

async function main() {
  console.log("\n" + "╔══════════════════════════════════════════════════╗");
  console.log("║     🔍 Web Search Agent with Tool Use            ║");
  console.log("║         Powered by OpenRouter API                ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\nThis agent can search the web for information!");
  console.log('Type "exit" to quit, "clear" to reset conversation\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let conversationHistory = [];

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      const trimmed = input.trim();

      if (trimmed.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      }

      if (trimmed.toLowerCase() === 'clear') {
        conversationHistory = [];
        console.log('\n🔄 Conversation cleared!\n');
        askQuestion();
        return;
      }

      if (trimmed) {
        try {
          const result = await runAgent(trimmed, conversationHistory);
          conversationHistory = result.history;
          console.log(`\n📊 Tool calls made: ${result.toolCalls}`);
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

export { searchTools, executeTool, runAgent };
