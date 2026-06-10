// Test file for Calculator Tools (NVIDIA NIM format)
// Verifies tool definitions and execution

import { calculatorTools, executeTool } from './agent.js';

console.log("🧪 Testing Calculator Tools\n");
console.log("═".repeat(50));
console.log("Format: OpenAI-compatible (NVIDIA NIM)");
console.log("═".repeat(50));

// Test 1: Verify tool definitions
console.log("\n📋 Test 1: Tool Definitions (OpenAI Format)");
console.log(`Found ${calculatorTools.length} tools:`);
calculatorTools.forEach(tool => {
  const isOpenAIFormat = tool.type === 'function' &&
                        tool.function &&
                        tool.function.name;

  console.log(`  ${isOpenAIFormat ? '✅' : '❌'} ${tool.function.name}: ${tool.function.description.split('.')[0]}`);
});

// Test 2: Verify JSON Schema structure
console.log("\n📋 Test 2: JSON Schema Validation");
calculatorTools.forEach(tool => {
  const schema = tool.function.parameters;
  const isValid = schema.type === 'object' &&
                  schema.properties &&
                  schema.required;

  console.log(`  ${isValid ? '✅' : '❌'} ${tool.function.name} - Schema ${isValid ? 'valid' : 'invalid'}`);

  if (!isValid) {
    console.log(`    Expected: type=object, properties, required`);
    console.log(`    Got:`, JSON.stringify(schema, null, 4));
  }
});

// Test 3: Execute tools
console.log("\n📋 Test 3: Tool Execution");

const testCases = [
  { tool: 'add', input: { a: 10, b: 5 }, expected: 15 },
  { tool: 'subtract', input: { a: 20, b: 8 }, expected: 12 },
  { tool: 'multiply', input: { a: 6, b: 7 }, expected: 42 },
  { tool: 'divide', input: { a: 100, b: 4 }, expected: 25 },
  { tool: 'power', input: { base: 2, exponent: 3 }, expected: 8 },
  { tool: 'sqrt', input: { number: 144 }, expected: 12 },
];

testCases.forEach(({ tool, input, expected }) => {
  const result = executeTool(tool, input);
  const passed = result.result === expected;
  console.log(`  ${passed ? '✅' : '❌'} ${tool}(${JSON.stringify(input)}) = ${result.result} ${passed ? '' : `(expected ${expected})`}`);
});

// Test 4: Error handling
console.log("\n📋 Test 4: Error Handling");

const errorCases = [
  { tool: 'divide', input: { a: 10, b: 0 }, desc: 'Division by zero' },
  { tool: 'sqrt', input: { number: -4 }, desc: 'Square root of negative' },
];

errorCases.forEach(({ tool, input, desc }) => {
  const result = executeTool(tool, input);
  const hasError = result.error !== undefined;
  console.log(`  ${hasError ? '✅' : '❌'} ${desc}: ${hasError ? result.error : 'No error!'}`);
});

// Test 5: OpenAI/NIM format example
console.log("\n📋 Test 5: OpenAI/NIM Format Example");
console.log("\nFirst tool as NIM expects it:");
console.log(JSON.stringify(calculatorTools[0], null, 2));

// Test 6: NIM compatibility check
console.log("\n📋 Test 6: NIM API Compatibility");
const nimChecks = {
  'Array of tools': Array.isArray(calculatorTools),
  'Each has type=function': calculatorTools.every(t => t.type === 'function'),
  'Each has function object': calculatorTools.every(t => t.function),
  'Each has function.name': calculatorTools.every(t => t.function.name),
  'Each has function.parameters': calculatorTools.every(t => t.function.parameters),
  'Parameters type=object': calculatorTools.every(t => t.function.parameters.type === 'object')
};

Object.entries(nimChecks).forEach(([check, passed]) => {
  console.log(`  ${passed ? '✅' : '❌'} ${check}`);
});

console.log("\n" + "═".repeat(50));
console.log("✅ All tests completed!");
console.log("\nReady for NVIDIA NIM API integration!");
