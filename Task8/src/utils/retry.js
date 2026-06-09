/**
 * Retry Layer — Exponential backoff with rate limit awareness.
 * Wraps any async function with configurable retries.
 */

const RETRY_CONFIG = {
  maxRetries: 4,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
};

// Error codes that should trigger a retry
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

/**
 * Determines if an error is retryable (network failure, rate limit, server error).
 * @param {Error} error
 * @returns {boolean}
 */
function isRetryableError(error) {
  // Network errors (ECONNRESET, ETIMEDOUT, fetch failures)
  if (error.code && ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(error.code)) {
    return true;
  }

  // Rate limit or server errors via status code
  if (error.status && RETRYABLE_STATUS_CODES.includes(error.status)) {
    return true;
  }

  // Rate limit via message patterns
  const msg = error.message || '';
  if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('RESOURCE_EXHAUSTED')) {
    return true;
  }

  // Server errors
  if (msg.includes('500') || msg.includes('502') || msg.includes('503') || msg.includes('504')) {
    return true;
  }

  return false;
}

/**
 * Calculates delay with exponential backoff and optional jitter.
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(attempt) {
  const exponentialDelay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelayMs);

  if (RETRY_CONFIG.jitter) {
    // Add random jitter between 0-50% of the delay
    const jitterRange = cappedDelay * 0.5;
    return cappedDelay + Math.random() * jitterRange;
  }

  return cappedDelay;
}

/**
 * Wraps an async function with exponential backoff retry logic.
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Override defaults
 * @param {number} options.maxRetries - Max retry attempts
 * @param {Function} options.onRetry - Callback(attempt, error, delay) for each retry
 * @returns {Promise} Result of fn()
 */
export async function withRetry(fn, options = {}) {
  const config = { ...RETRY_CONFIG, ...options };
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable or no retries left
      if (!isRetryableError(error) || attempt >= config.maxRetries) {
        throw error;
      }

      const delay = calculateDelay(attempt);

      // Notify caller of retry
      if (options.onRetry) {
        options.onRetry(attempt + 1, error, delay);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export { RETRY_CONFIG, isRetryableError, calculateDelay };
