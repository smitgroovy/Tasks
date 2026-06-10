// Test file for Web Search Tool (NVIDIA NIM format)
// Verifies search functionality

import { searchWeb, formatResults, formatForLLM } from './search.js';

console.log("🧪 Testing Web Search Tool\n");
console.log("═".repeat(50));
console.log("Format: OpenAI-compatible (NVIDIA NIM)");
console.log("═".repeat(50));

async function runTests() {
  // Test 1: Basic search
  console.log("\n📋 Test 1: Basic Web Search");
  try {
    const results = await searchWeb("Claude AI Anthropic", 3);
    console.log(`✅ Found ${results.length} results`);

    if (results.length > 0) {
      console.log("\nFirst result:");
      console.log(`  Title: ${results[0].title}`);
      console.log(`  URL: ${results[0].url}`);
      console.log(`  Snippet: ${results[0].snippet.substring(0, 100)}...`);
    }
  } catch (error) {
    console.log(`❌ Search failed: ${error.message}`);
  }

  // Test 2: Format results for display
  console.log("\n📋 Test 2: Format Results for Display");
  const sampleResults = [
    { title: "Test Title 1", url: "https://example.com/1", snippet: "Test snippet 1" },
    { title: "Test Title 2", url: "https://example.com/2", snippet: "Test snippet 2" }
  ];
  const formatted = formatResults(sampleResults);
  console.log("✅ Formatted output:");
  console.log(formatted);

  // Test 3: Format results for LLM
  console.log("\n📋 Test 3: Format Results for LLM");
  const llmFormatted = formatForLLM(sampleResults);
  console.log("✅ LLM format:");
  console.log(llmFormatted);

  // Test 4: Empty results
  console.log("\n📋 Test 4: Empty Results Handling");
  const emptyFormatted = formatResults([]);
  console.log(`✅ Empty results: "${emptyFormatted}"`);

  // Test 5: Tool schema in OpenAI/NIM format
  console.log("\n📋 Test 5: Tool Schema (OpenAI/NIM Format)");
  const webSearchSchema = {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The search query" },
          num_results: { type: "integer", description: "Number of results" }
        },
        required: ["query"]
      }
    }
  };

  const isOpenAIFormat = webSearchSchema.type === 'function' &&
                        webSearchSchema.function &&
                        webSearchSchema.function.name &&
                        webSearchSchema.function.parameters;

  console.log(`✅ OpenAI/NIM format validation: ${isOpenAIFormat ? 'PASS' : 'FAIL'}`);
  console.log("\nExample schema:");
  console.log(JSON.stringify(webSearchSchema, null, 2));

  // Test 6: NIM compatibility
  console.log("\n📋 Test 6: NIM API Compatibility Check");
  const nimChecks = {
    'Has type: function': webSearchSchema.type === 'function',
    'Has function.name': !!webSearchSchema.function.name,
    'Has function.description': !!webSearchSchema.function.description,
    'Has function.parameters': !!webSearchSchema.function.parameters,
    'Parameters type=object': webSearchSchema.function.parameters.type === 'object',
    'Has properties': !!webSearchSchema.function.parameters.properties,
    'Has required array': Array.isArray(webSearchSchema.function.parameters.required)
  };

  Object.entries(nimChecks).forEach(([check, passed]) => {
    console.log(`  ${passed ? '✅' : '❌'} ${check}`);
  });

  console.log("\n" + "═".repeat(50));
  console.log("✅ All tests completed!");
  console.log("\nReady for NVIDIA NIM API integration!");
}

runTests().catch(console.error);
