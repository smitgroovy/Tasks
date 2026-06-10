// Demo Script - Multi-Tool Agent (NVIDIA NIM)
// Day 13 - Showcases all three tools in action

import { MultiToolAgent } from './agent.js';

console.log("\n" + "╔══════════════════════════════════════════════════════╗");
console.log("║     🎬 Multi-Tool Agent Demo - Day 13                ║");
console.log("║     Powered by NVIDIA NIM (Llama 3.3 70B)            ║");
console.log("║     Demonstrating Tool Use & Function Calling        ║");
console.log("╚══════════════════════════════════════════════════════╝");

const DEMO_QUERIES = [
  {
    title: "🧮 Calculator Tool Demo",
    query: "What's 15% of 240 plus the square root of 144?",
    description: "Tests the calculator with percentage and square root"
  },
  {
    title: "🔍 Web Search Tool Demo",
    query: "What is NVIDIA NIM and how does it work?",
    description: "Tests web search for factual information"
  },
  {
    title: "📢 Slack Notification Demo",
    query: "Send a notification to the engineering team that the deployment is starting",
    description: "Tests Slack notification capability"
  },
  {
    title: "🔗 Multi-Tool Demo",
    query: "Search for the current Bitcoin price, then calculate how much 0.5 BTC is worth",
    description: "Tests using multiple tools in sequence"
  }
];

async function runDemo() {
  const agent = new MultiToolAgent();

  console.log("\n📋 Demo will run through 4 scenarios:");
  DEMO_QUERIES.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.title}`);
    console.log(`     ${q.description}`);
  });

  console.log("\n🤖 Using NVIDIA NIM API with model fallback:");
  console.log("   • meta/llama-3.3-70b-instruct (primary)");
  console.log("   • meta/llama-4-maverick-17b-128e-instruct");
  console.log("   • google/gemma-4-31b-it");
  console.log("   • deepseek-ai/deepseek-v4-pro");

  console.log("\n" + "─".repeat(55));
  console.log("Press Ctrl+C to stop, or wait for automatic progression");
  console.log("─".repeat(55));

  // Wait a moment for user to read
  await new Promise(resolve => setTimeout(resolve, 2000));

  for (let i = 0; i < DEMO_QUERIES.length; i++) {
    const demo = DEMO_QUERIES[i];

    console.log("\n\n" + "═".repeat(55));
    console.log(`📍 Demo ${i + 1}/${DEMO_QUERIES.length}: ${demo.title}`);
    console.log("═".repeat(55));
    console.log(`\n💬 Query: "${demo.query}"\n`);

    try {
      const result = await agent.processMessage(demo.query);

      console.log("\n" + "─".repeat(55));
      console.log(`✅ Demo ${i + 1} Complete`);
      console.log(`   Tool calls: ${result.toolCalls || 0}`);
      console.log(`   Status: ${result.success ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log(`\n❌ Demo ${i + 1} Error: ${error.message}`);
    }

    // Pause between demos
    if (i < DEMO_QUERIES.length - 1) {
      console.log("\n⏳ Next demo in 3 seconds...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Final summary
  console.log("\n\n" + "═".repeat(55));
  console.log("🎉 Demo Complete!");
  console.log("═".repeat(55));

  const stats = agent.getStats();
  console.log("\n📊 Session Statistics:");
  console.log(`   Total tool calls: ${stats.totalToolCalls}`);
  console.log(`   Calculations: ${stats.calculations}`);
  console.log(`   Searches: ${stats.searches}`);
  console.log(`   Notifications: ${stats.notifications}`);
  console.log(`   Models used: ${stats.modelsUsed.join(', ')}`);
  console.log(`   Conversation turns: ${stats.conversationLength}`);

  console.log("\n💡 Key Features Demonstrated:");
  console.log("   ✅ OpenAI-compatible function calling format");
  console.log("   ✅ NVIDIA NIM API integration");
  console.log("   ✅ LLM-driven tool selection");
  console.log("   ✅ Multi-tool orchestration");
  console.log("   ✅ Model fallback strategy");
  console.log("   ✅ Tool result processing");
  console.log("   ✅ Conversation context maintenance");

  console.log("\n🚀 To run interactively: npm start");
  console.log("🧪 To run tests: npm test\n");
}

// Run the demo
runDemo().catch(console.error);
