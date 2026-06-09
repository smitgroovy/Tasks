import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from '../config.js';
import { AnthropicProvider } from '../providers/anthropic.js';
import { OpenAIProvider } from '../providers/openai.js';
import { GeminiProvider } from '../providers/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROVIDER_MAP = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
};

function loadPrompts() {
  const promptsPath = resolve(__dirname, '..', '..', 'benchmark', 'prompts.json');
  return JSON.parse(readFileSync(promptsPath, 'utf-8'));
}

function estimateCost(usage, config) {
  const inputCost = (usage.inputTokens / 1_000_000) * config.inputCostPer1M;
  const outputCost = (usage.outputTokens / 1_000_000) * config.outputCostPer1M;
  return inputCost + outputCost;
}

function formatCsvRow(result) {
  return [
    result.id,
    result.category,
    result.model,
    result.provider,
    result.latency,
    result.inputTokens,
    result.outputTokens,
    result.estimatedCost.toFixed(6),
    result.responseLength,
    result.timestamp,
  ].join(',');
}

async function runBenchmark(providerName, options = {}) {
  const { limit, concurrency = 1 } = options;

  const config = getConfig(providerName);
  const ProviderClass = PROVIDER_MAP[providerName];
  const provider = new ProviderClass(config);

  const prompts = loadPrompts();
  const runPrompts = limit ? prompts.slice(0, limit) : prompts;

  console.log('='.repeat(60));
  console.log('  Benchmark Runner');
  console.log('='.repeat(60));
  console.log(`  Provider:    ${providerName}`);
  console.log(`  Model:       ${config.model}`);
  console.log(`  Prompts:     ${runPrompts.length}`);
  console.log('='.repeat(60));
  console.log('');

  const results = [];

  for (const prompt of runPrompts) {
    const timestamp = new Date().toISOString();
    process.stdout.write(`  [${prompt.id}/${runPrompts.length}] ${prompt.category}...`);

    try {
      const response = await provider.generateResponse([
        { role: 'user', content: prompt.prompt },
      ]);

      const cost = estimateCost(response.usage, config);

      const result = {
        id: prompt.id,
        category: prompt.category,
        model: response.model,
        provider: response.provider,
        latency: response.latency,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        estimatedCost: cost,
        responseLength: response.content.length,
        timestamp,
      };

      results.push(result);
      console.log(` ${response.latency}ms | $${cost.toFixed(4)} | ${response.content.length} chars`);
    } catch (error) {
      console.log(` ERROR: ${error.message}`);
      results.push({
        id: prompt.id,
        category: prompt.category,
        model: config.model,
        provider: providerName,
        latency: 0,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        responseLength: 0,
        timestamp,
        error: error.message,
      });
    }

    if (concurrency === 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const csvHeader = 'id,category,model,provider,latency_ms,input_tokens,output_tokens,estimated_cost,response_length,timestamp';
  const csvRows = results.map(formatCsvRow);
  const csvContent = [csvHeader, ...csvRows].join('\n');

  const csvPath = resolve(__dirname, '..', '..', 'benchmark', `results-${providerName}.csv`);
  writeFileSync(csvPath, csvContent);

  const totalCost = results.reduce((sum, r) => sum + r.estimatedCost, 0);
  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;
  const totalInput = results.reduce((sum, r) => sum + r.inputTokens, 0);
  const totalOutput = results.reduce((sum, r) => sum + r.outputTokens, 0);
  const errors = results.filter(r => r.error).length;

  const summary = {
    provider: providerName,
    model: config.model,
    totalPrompts: runPrompts.length,
    errors,
    totalCost,
    avgLatency: Math.round(avgLatency),
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
  };

  console.log('');
  console.log('='.repeat(60));
  console.log('  Summary');
  console.log('='.repeat(60));
  console.log(`  Total prompts:      ${summary.totalPrompts}`);
  console.log(`  Errors:             ${summary.errors}`);
  console.log(`  Total cost:         $${summary.totalCost.toFixed(4)}`);
  console.log(`  Avg latency:        ${summary.avgLatency}ms`);
  console.log(`  Total input tokens: ${summary.totalInputTokens.toLocaleString()}`);
  console.log(`  Total output tokens:${summary.totalOutputTokens.toLocaleString()}`);
  console.log(`  Results saved to:   ${csvPath}`);
  console.log('='.repeat(60));

  return { summary, results };
}

const args = process.argv.slice(2);
const providerArg = args.includes('--provider') ? args[args.indexOf('--provider') + 1] : 'openai';
const limitArg = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : undefined;

runBenchmark(providerArg, { limit: limitArg }).catch(error => {
  console.error('Benchmark failed:', error.message);
  process.exit(1);
});
