/**
 * Configuration — Loads .env and provides per-provider config.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually (no dotenv dependency)
function loadEnv() {
  const envPath = resolve(__dirname, '..', '..', '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      // Don't override existing env vars
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

loadEnv();

// Provider definitions with model and pricing info
const PROVIDERS = {
  anthropic: {
    name: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    envKey: 'ANTHROPIC_API_KEY',
  },
  openai: {
    name: 'openai',
    model: 'gpt-4o-mini',
    envKey: 'OPENAI_API_KEY',
  },
  gemini: {
    name: 'gemini',
    model: 'gemini-2.5-flash',
    envKey: 'GEMINI_API_KEY',
  },
};

/**
 * Get validated config for a provider.
 * @param {string} providerName
 * @returns {{name: string, model: string, apiKey: string}}
 */
export function getConfig(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(
      `Unknown provider: ${providerName}. Available: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }

  const apiKey = process.env[provider.envKey];
  if (!apiKey) {
    throw new Error(
      `Missing ${provider.envKey} environment variable. Set it in .env or your shell.`
    );
  }

  return { ...provider, apiKey };
}

/**
 * List all providers and whether their API key is set.
 */
export function listProviders() {
  return Object.entries(PROVIDERS).map(([key, val]) => ({
    name: key,
    model: val.model,
    hasKey: !!process.env[val.envKey],
  }));
}

export { PROVIDERS };
