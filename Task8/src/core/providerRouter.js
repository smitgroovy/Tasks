/**
 * Provider Router — Maps provider names to their classes.
 * Central place to register new providers.
 */

import { AnthropicProvider } from '../providers/anthropic.js';
import { OpenAIProvider } from '../providers/openai.js';
import { GeminiProvider } from '../providers/gemini.js';

// Registry of provider classes
const PROVIDER_MAP = {
  anthropic: AnthropicProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
};

/**
 * Create a provider instance by name.
 * @param {string} name - Provider name (anthropic, openai, gemini)
 * @param {Object} config - Provider config with apiKey, model, etc.
 * @returns {Object} Provider instance
 */
export function createProvider(name, config) {
  const ProviderClass = PROVIDER_MAP[name];
  if (!ProviderClass) {
    throw new Error(
      `No provider registered for "${name}". Available: ${Object.keys(PROVIDER_MAP).join(', ')}`
    );
  }
  return new ProviderClass(config);
}

/**
 * Get list of all registered provider names.
 */
export function getAvailableProviders() {
  return Object.keys(PROVIDER_MAP);
}

export default createProvider;
