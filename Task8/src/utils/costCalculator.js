/**
 * Cost Calculator — Estimates costs per provider/model.
 * Prices are per 1M tokens.
 */

const MODEL_PRICING = {
  // Anthropic models
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00, label: 'Claude 3.5 Haiku' },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00, label: 'Claude 3.5 Sonnet' },
  'claude-sonnet-4-20250514': { input: 3.00, output: 15.00, label: 'Claude Sonnet 4' },

  // OpenAI models
  'gpt-4o-mini': { input: 0.15, output: 0.60, label: 'GPT-4o Mini' },
  'gpt-4o': { input: 2.50, output: 10.00, label: 'GPT-4o' },

  // Google models
  'gemini-2.5-flash': { input: 0.075, output: 0.30, label: 'Gemini 2.5 Flash' },
  'gemini-2.0-flash': { input: 0.075, output: 0.30, label: 'Gemini 2.0 Flash' },
};

/**
 * Calculate the estimated cost for a given model and token usage.
 * @param {string} model - Model identifier
 * @param {number} inputTokens - Number of input tokens
 * @param {number} outputTokens - Number of output tokens
 * @returns {{inputCost: number, outputCost: number, totalCost: number, modelLabel: string}}
 */
export function calculateCost(model, inputTokens, outputTokens) {
  const pricing = MODEL_PRICING[model];

  // Unknown model — return zero
  if (!pricing) {
    return { inputCost: 0, outputCost: 0, totalCost: 0, modelLabel: model };
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    modelLabel: pricing.label,
  };
}

/**
 * Get pricing info for a model (for display).
 * @param {string} model
 * @returns {{input: number, output: number, label: string} | null}
 */
export function getModelPricing(model) {
  return MODEL_PRICING[model] || null;
}

/**
 * Get all supported models and their pricing.
 */
export function getAllPricing() {
  return { ...MODEL_PRICING };
}

export default calculateCost;
