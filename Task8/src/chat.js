/**
 * chat.js — Production-Grade CLI Bot v2
 *
 * Entry point. Wires together: config -> provider -> retry -> streaming -> tokens -> cost -> logging.
 *
 * Usage:
 *   node src/chat.js --provider anthropic
 *   node src/chat.js --provider openai
 *   node src/chat.js --provider gemini
 */

import * as readline from 'readline';
import { getConfig } from './core/config.js';
import { createProvider } from './core/providerRouter.js';
import { withRetry } from './utils/retry.js';
import { TokenCounter } from './utils/tokenCounter.js';
import { calculateCost } from './utils/costCalculator.js';
import { logTurn } from './utils/logger.js';

// ── CLI argument parsing ──────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  const providerIndex = args.indexOf('--provider');
  const provider =
    providerIndex !== -1
      ? args[providerIndex + 1]
      : process.env.DEFAULT_PROVIDER || 'gemini';

  return { provider };
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  const { provider: providerName } = parseArgs();

  // Validate config and create provider
  let config;
  let provider;
  try {
    config = getConfig(providerName);
    provider = createProvider(providerName, config);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  // Print banner
  console.log('='.repeat(55));
  console.log('  Production CLI Bot v2 — Streaming + Retries + Cost Tracking');
  console.log('='.repeat(55));
  console.log(`  Provider:  ${providerName}`);
  console.log(`  Model:     ${config.model}`);
  console.log(`  Commands:  /quit, /clear, /history, /cost, /logs`);
  console.log('='.repeat(55));
  console.log('');

  // Shared state
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const messages = [
    { role: 'system', content: 'You are a helpful, friendly AI assistant. Provide clear and concise responses.' },
  ];
  const tokenCounter = new TokenCounter();
  let totalCost = 0;

  const prompt = () => rl.question('You: ', handleInput);

  // ── Handle each user input ────────────────────────────────────
  async function handleInput(input) {
    const trimmed = input.trim();

    if (!trimmed) {
      prompt();
      return;
    }

    // Slash commands
    if (trimmed === '/quit' || trimmed === '/exit') {
      console.log('\nGoodbye!');
      rl.close();
      return;
    }

    if (trimmed === '/clear') {
      messages.length = 1;
      tokenCounter.reset();
      totalCost = 0;
      console.log('Conversation cleared.\n');
      prompt();
      return;
    }

    if (trimmed === '/history') {
      console.log('\n--- Conversation History ---');
      for (const msg of messages) {
        if (msg.role === 'system') continue;
        const label = msg.role === 'user' ? 'You' : 'AI';
        console.log(`${label}: ${msg.content}`);
      }
      console.log('--- End ---\n');
      prompt();
      return;
    }

    if (trimmed === '/cost') {
      const session = tokenCounter.getSessionUsage();
      console.log(
        `\nSession: ${session.turns} turns | ` +
        `Tokens: ${session.total} (in: ${session.input}, out: ${session.output}) | ` +
        `Cost: $${totalCost.toFixed(6)}\n`
      );
      prompt();
      return;
    }

    if (trimmed === '/logs') {
      try {
        const { readFileSync } = await import('fs');
        const { resolve, dirname } = await import('path');
        const { fileURLToPath } = await import('url');
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const logPath = resolve(__dirname, '..', 'logs', 'session.log');
        const raw = readFileSync(logPath, 'utf-8');
        const entries = raw.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
        console.log('\n--- Session Logs ---');
        for (const e of entries) {
          console.log(
            `[${e.timestamp}] ${e.provider}/${e.model} | ` +
            `${e.latencyMs}ms | tokens: ${e.tokens.total} | ` +
            `cost: $${e.estimatedCost.toFixed(6)} | ${e.status}`
          );
        }
        console.log('--- End ---\n');
      } catch {
        console.log('\nNo logs yet.\n');
      }
      prompt();
      return;
    }

    // ── Send message with retry + streaming ──────────────────────
    messages.push({ role: 'user', content: trimmed });

    process.stdout.write('AI: ');

    try {
      const response = await withRetry(
        () => provider.generateStreamingResponse(messages, (token) => {
          process.stdout.write(token);
        }),
        {
          onRetry: (attempt, error, delay) => {
            console.log(
              `\n  [Retry ${attempt}/4 in ${(delay / 1000).toFixed(1)}s — ${error.message}]\n  AI: `
            );
          },
        }
      );

      // Flush the line after streaming
      console.log('');

      // Record tokens
      tokenCounter.recordTurn(response.usage.inputTokens, response.usage.outputTokens);

      // Calculate cost
      const cost = calculateCost(response.model, response.usage.inputTokens, response.usage.outputTokens);
      totalCost += cost.totalCost;

      // Save assistant reply
      messages.push({ role: 'assistant', content: response.content });

      // Log the turn
      logTurn({
        provider: response.provider,
        model: response.model,
        latencyMs: response.latency,
        tokens: {
          input: response.usage.inputTokens,
          output: response.usage.outputTokens,
          total: response.usage.inputTokens + response.usage.outputTokens,
        },
        estimatedCost: cost.totalCost,
        status: 'success',
      });

      // Print metadata
      console.log(
        `  [${response.latency}ms | in: ${response.usage.inputTokens} | ` +
        `out: ${response.usage.outputTokens} | cost: $${cost.totalCost.toFixed(6)}]\n`
      );
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);

      // Log the failed turn
      logTurn({
        provider: providerName,
        model: config.model,
        latencyMs: 0,
        tokens: { input: 0, output: 0, total: 0 },
        estimatedCost: 0,
        status: 'error',
        error: error.message,
      });

      // Remove the failed user message
      messages.pop();
    }

    prompt();
  }

  prompt();
}

main();
