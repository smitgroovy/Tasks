/**
 * Structured Logger — Writes JSON log entries to logs/session.log.
 * Each entry includes timestamp, provider, model, latency, tokens, cost, and status.
 */

import { appendFileSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOG_DIR = resolve(__dirname, '..', '..', 'logs');
const LOG_FILE = resolve(LOG_DIR, 'session.log');

// Ensure logs directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log a completed API call.
 * @param {Object} entry
 * @param {string} entry.provider - Provider name
 * @param {string} entry.model - Model name
 * @param {number} entry.latencyMs - Response latency in ms
 * @param {Object} entry.tokens - { input, output, total }
 * @param {number} entry.estimatedCost - Cost in USD
 * @param {string} entry.status - 'success' | 'error' | 'retry'
 * @param {string} [entry.error] - Error message if status is error
 */
export function logTurn(entry) {
  const record = {
    timestamp: new Date().toISOString(),
    provider: entry.provider,
    model: entry.model,
    latencyMs: entry.latencyMs,
    tokens: entry.tokens,
    estimatedCost: entry.estimatedCost,
    status: entry.status,
  };

  if (entry.error) {
    record.error = entry.error;
  }

  try {
    appendFileSync(LOG_FILE, JSON.stringify(record) + '\n', 'utf-8');
  } catch {
    // Silently fail — logging should never crash the app
  }
}

/**
 * Read all log entries from the current session log.
 * @returns {Array<Object>}
 */
export function readLogs() {
  try {
    const raw = readFileSync(LOG_FILE, 'utf-8');
    return raw
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

/**
 * Clear the session log.
 */
export function clearLogs() {
  try {
    writeFileSync(LOG_FILE, '', 'utf-8');
  } catch {
    // Silently fail
  }
}

export default logTurn;
