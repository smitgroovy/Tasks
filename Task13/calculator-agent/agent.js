// Calculator Agent with Tool Use - Day 13
// Powered by OpenRouter API

import OpenAI from 'openai';
import dotenv from 'dotenv';
import * as readline from 'readline';

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

const calculatorTools = [
  {
    type: "function",
    function: {
      name: "add",
      description: "Add two numbers together. Use when the user wants to sum or add values.",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number", description: "The first number to add" },
          b: { type: "number", description: "The second number to add" }
        },
        required: ["a", "b"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "subtract",
      description: "Subtract the second number from the first. Use when finding the difference.",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number", description: "The number to subtract from (minuend)" },
          b: { type: "number", description: "The number to subtract (subtrahend)" }
        },
        required: ["a", "b"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "multiply",
      description: "Multiply two numbers together. Use when finding the product.",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number", description: "The first number to multiply" },
          b: { type: "number", description: "The second number to multiply" }
        },
        required: ["a", "b"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "divide",
      description: "Divide the first number by the second. Use when finding the quotient.",
      parameters: {
        type: "object",
        properties: {
          a: { type: "number", description: "The dividend (number to be divided)" },
          b: { type: "number", description: "The divisor (number to divide by)" }
        },
        required: ["a", "b"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "power",
      description: "Raise a number to a power. Use for exponentiation calculations.",
      parameters: {
        type: "object",
        properties: {
          base: { type: "number", description: "The base number" },
          exponent: { type: "number", description: "The exponent to raise the base to" }
        },
        required: ["base", "exponent"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "sqrt",
      description: "Calculate the square root of a number.",
      parameters: {
        type: "object",
        properties: {
          number: { type: "number", description: "The number to find the square root of" }
        },
        required: ["number"]
      }
    }
  }
];

// ============================================
// TOOL EXECUTION FUNCTIONS
// ============================================

function executeTool(toolName, input) {
  console.log(`\n🔧 Executing tool: ${toolName}`);
  console.log(`📥 Input:`, JSON.stringify(input, null, 2));

  let result;

  switch (toolName) {
    case 'add':
      result = input.a + input.b;
      break;
    case 'subtract':
      result = input.a - input.b;
      break;
    case 'multiply':
      result = input.a * input.b;
      break;
    case 'divide':
      if (input.b === 0) {
        return { error: "Division by zero is not allowed" };
      }
      result = input.a / input.b;
      break;
    case 'power':
      result = Math.pow(input.base, input.exponent);
      break;
    case 'sqrt':
      if (input.number < 0) {
        return { error: "Cannot calculate square root of negative number" };
      }
      result = Math.sqrt(input.number);
      break;
    default:
      return { error: `Unknown tool: ${toolName}` };
  }

  console.log(`📤 Result: ${result}`);
  return { result };
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
            content: `You are a helpful calculator assistant. You have access to mathematical tools.

When users ask math questions:
1. Determine which tool(s) to use
2. Call the appropriate tool(s) with the correct parameters
3. Explain the result clearly

For multi-step calculations, break them down into individual tool calls.
Always show your work and explain the calculation process.`
          },
          ...conversationHistory
        ],
        tools: calculatorTools,
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

          const result = executeTool(functionName, functionArgs);

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
              content: "You are a helpful calculator assistant. Explain the calculation results clearly."
            },
            ...conversationHistory
          ],
          tools: calculatorTools,
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
  console.log("║     🧮 Calculator Agent with Tool Use            ║");
  console.log("║         Powered by OpenRouter API                ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log("\nAvailable tools: add, subtract, multiply, divide, power, sqrt");
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

export { calculatorTools, executeTool, runAgent };
