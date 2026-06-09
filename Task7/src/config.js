import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

const PROVIDERS = {
  anthropic: {
    name: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    envKey: 'ANTHROPIC_API_KEY',
    inputCostPer1M: 0.80,
    outputCostPer1M: 4.00,
  },
  openai: {
    name: 'openai',
    model: 'gpt-4o-mini',
    envKey: 'OPENAI_API_KEY',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.60,
  },
  gemini: {
    name: 'gemini',
    model: 'gemini-2.5-flash',
    envKey: 'GEMINI_API_KEY',
    inputCostPer1M: 0,    // Free tier: 1M tokens/day, 15 RPM
    outputCostPer1M: 0,   // Paid: $0.075 in / $0.30 out per 1M tokens
  },
};

export function getConfig(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}. Available: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    throw new Error(`Missing ${provider.envKey} environment variable. Set it in .env or your shell.`);
  }

  return { ...provider, apiKey };
}

export function listProviders() {
  return Object.entries(PROVIDERS).map(([key, val]) => ({
    name: key,
    model: val.model,
    hasKey: !!process.env[val.envKey],
  }));
}

export { PROVIDERS };
