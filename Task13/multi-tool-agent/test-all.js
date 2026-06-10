// Test All Tools - Multi-Tool Agent (NVIDIA NIM)
// Day 13 - Comprehensive Testing

import { toolDefinitions, executeTool, calculate, webSearch, sendSlackNotification } from './tools.js';

console.log("🧪 Multi-Tool Agent - Comprehensive Tests\n");
console.log("═".repeat(50));
console.log("Powered by NVIDIA NIM (OpenAI-compatible format)");
console.log("═".repeat(50));

async function runAllTests() {
  // ============================================
  // TEST 1: Tool Definitions (OpenAI Format)
  // ============================================
  console.log("\n📋 TEST 1: Tool Definitions (OpenAI Function Calling Format)");
  console.log("─".repeat(40));

  console.log(`Found ${toolDefinitions.length} tools:`);
  toolDefinitions.forEach(tool => {
    const isOpenAIFormat = tool.type === 'function' &&
                          tool.function &&
                          tool.function.name &&
                          tool.function.description &&
                          tool.function.parameters;

    console.log(`  ${isOpenAIFormat ? '✅' : '❌'} ${tool.function.name}`);
    console.log(`     ${tool.function.description.split('\n')[0]}`);

    if (!isOpenAIFormat) {
      console.log(`     ⚠️  Not in OpenAI format!`);
    }
  });

  // ============================================
  // TEST 2: JSON Schema Validation
  // ============================================
  console.log("\n📋 TEST 2: JSON Schema Validation");
  console.log("─".repeat(40));

  toolDefinitions.forEach(tool => {
    const schema = tool.function.parameters;
    const checks = {
      'Has type: function': tool.type === 'function',
      'Has function.name': !!tool.function.name,
      'Has function.description': !!tool.function.description,
      'Parameters type is object': schema?.type === 'object',
      'Has properties': !!schema?.properties,
      'Has required array': Array.isArray(schema?.required)
    };

    const allPassed = Object.values(checks).every(v => v);
    console.log(`  ${allPassed ? '✅' : '❌'} ${tool.function.name}: ${allPassed ? 'Valid' : 'Invalid'}`);

    if (!allPassed) {
      Object.entries(checks).forEach(([check, passed]) => {
        if (!passed) console.log(`     ⚠️  Failed: ${check}`);
      });
    }
  });

  // ============================================
  // TEST 3: Calculator Tool
  // ============================================
  console.log("\n📋 TEST 3: Calculator Tool");
  console.log("─".repeat(40));

  const calcTests = [
    { expr: "2 + 3", expected: 5 },
    { expr: "10 * 5", expected: 50 },
    { expr: "100 / 4", expected: 25 },
    { expr: "50 - 15", expected: 35 },
    { expr: "2 ^ 10", expected: 1024 },
    { expr: "15% of 200", expected: 30 },
    { expr: "sqrt(144)", expected: 12 }
  ];

  for (const test of calcTests) {
    const result = calculate(test.expr);
    const passed = result.success && result.result === test.expected;
    console.log(`  ${passed ? '✅' : '❌'} ${test.expr} = ${result.result || result.error}`);
  }

  // ============================================
  // TEST 4: Web Search Tool
  // ============================================
  console.log("\n📋 TEST 4: Web Search Tool");
  console.log("─".repeat(40));

  try {
    const searchResult = await webSearch("Node.js programming", 2);
    console.log(`  ${searchResult.success ? '✅' : '❌'} Search for "Node.js programming"`);
    console.log(`     Found ${searchResult.results?.length || 0} results`);

    if (searchResult.results?.length > 0) {
      console.log(`     First result: ${searchResult.results[0].title}`);
    }
  } catch (error) {
    console.log(`  ❌ Search failed: ${error.message}`);
  }

  // ============================================
  // TEST 5: Slack Notification Tool
  // ============================================
  console.log("\n📋 TEST 5: Slack Notification Tool");
  console.log("─".repeat(40));

  const slackResult = await sendSlackNotification(
    "Test notification from Multi-Tool Agent",
    "testing",
    "normal"
  );
  console.log(`  ${slackResult.success ? '✅' : '❌'} Slack notification`);
  console.log(`     Status: ${slackResult.simulated ? 'Simulated' : 'Sent'}`);

  // ============================================
  // TEST 6: Execute Tool Router
  // ============================================
  console.log("\n📋 TEST 6: Tool Router (executeTool)");
  console.log("─".repeat(40));

  const routerTests = [
    { tool: 'calculate', input: { expression: '5 + 5' } },
    { tool: 'web_search', input: { query: 'test', num_results: 1 } },
    { tool: 'send_slack_notification', input: { message: 'test' } },
    { tool: 'unknown_tool', input: {} }
  ];

  for (const test of routerTests) {
    try {
      const result = await executeTool(test.tool, test.input);
      const success = test.tool === 'unknown_tool' ? result.error : true;
      console.log(`  ${success ? '✅' : '❌'} ${test.tool}: ${result.success !== undefined ? 'OK' : result.error}`);
    } catch (error) {
      console.log(`  ${test.tool === 'unknown_tool' ? '✅' : '❌'} ${test.tool}: ${error.message}`);
    }
  }

  // ============================================
  // TEST 7: NIM API Format Compatibility
  // ============================================
  console.log("\n📋 TEST 7: NIM API Format Compatibility");
  console.log("─".repeat(40));

  // Simulate what NIM expects
  const nimFormatCheck = {
    'Tools array format': Array.isArray(toolDefinitions),
    'Each tool has type': toolDefinitions.every(t => t.type === 'function'),
    'Each tool has function': toolDefinitions.every(t => t.function),
    'Function has name': toolDefinitions.every(t => t.function.name),
    'Function has parameters': toolDefinitions.every(t => t.function.parameters),
    'Parameters is object type': toolDefinitions.every(t => t.function.parameters.type === 'object')
  };

  Object.entries(nimFormatCheck).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n" + "═".repeat(50));
  console.log("✅ All tests completed!");
  console.log("\nTools available (OpenAI/NIM format):");
  console.log("  1. 🧮 calculate - Mathematical calculations");
  console.log("  2. 🔍 web_search - Internet search (DuckDuckGo)");
  console.log("  3. 📢 send_slack_notification - Slack notifications");
  console.log("\nAPI Format: OpenAI-compatible (NVIDIA NIM)");
  console.log("Base URL: https://integrate.api.nvidia.com/v1");
}

runAllTests().catch(console.error);
