import * as readline from 'readline';
import { getConfig } from './config.js';
import { AnthropicProvider } from './providers/anthropic.js';
import { OpenAIProvider } from './providers/openai.js';
import { GeminiProvider } from './providers/gemini.js';

const PROVIDER_MAP = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const provider = args.includes('--provider')
    ? args[args.indexOf('--provider') + 1]
    : process.env.DEFAULT_PROVIDER || 'gemini';

  return { provider };
}

function createProvider(providerName) {
  const config = getConfig(providerName);
  const ProviderClass = PROVIDER_MAP[providerName];
  return new ProviderClass(config);
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function formatCost(usage, config) {
  const inputCost = (usage.inputTokens / 1_000_000) * config.inputCostPer1M;
  const outputCost = (usage.outputTokens / 1_000_000) * config.outputCostPer1M;
  return inputCost + outputCost;
}

async function main() {
  const { provider: providerName } = parseArgs();

  let provider;
  try {
    provider = createProvider(providerName);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }

  const config = getConfig(providerName);

  console.log('='.repeat(50));
  console.log('  Multi-Provider AI CLI Chatbot');
  console.log('='.repeat(50));
  console.log(`  Provider:  ${providerName}`);
  console.log(`  Model:     ${config.model}`);
  console.log(`  Commands:  /quit, /clear, /history, /cost`);
  console.log('='.repeat(50));
  console.log('');

  const rl = createInterface();
  const messages = [
    { role: 'system', content: 'You are a helpful, friendly AI assistant. Provide clear and concise responses.' },
  ];

  let totalCost = 0;
  let turnCount = 0;

  const prompt = () => rl.question('You: ', handleInput);

  async function handleInput(input) {
    const trimmed = input.trim();

    if (!trimmed) {
      prompt();
      return;
    }

    if (trimmed === '/quit' || trimmed === '/exit') {
      console.log('\nGoodbye! 👋');
      rl.close();
      return;
    }

    if (trimmed === '/clear') {
      messages.length = 1;
      totalCost = 0;
      turnCount = 0;
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
      console.log(`\nSession stats: ${turnCount} turns | Estimated cost: $${totalCost.toFixed(4)}\n`);
      prompt();
      return;
    }

    messages.push({ role: 'user', content: trimmed });
    turnCount++;

    try {
      process.stdout.write('AI: ');
      const response = await provider.generateResponse(messages);
      messages.push({ role: 'assistant', content: response.content });

      const turnCost = formatCost(response.usage, config);
      totalCost += turnCost;

      console.log(response.content);
      console.log(
        `\n  [${response.latency}ms | in: ${response.usage.inputTokens} | out: ${response.usage.outputTokens} | cost: $${turnCost.toFixed(4)}]\n`
      );
    } catch (error) {
      console.error(`\nError: ${error.message}\n`);
      messages.pop();
      turnCount--;
    }

    prompt();
  }

  prompt();
}

main();
