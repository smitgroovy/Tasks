/**
 * Tests — Logger and provider router.
 * Run with: node --test tests/logger.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { logTurn, readLogs, clearLogs } from '../src/utils/logger.js';
import { getAvailableProviders } from '../src/core/providerRouter.js';

describe('Logger', () => {
  it('writes and reads log entries', () => {
    clearLogs();

    logTurn({
      provider: 'anthropic',
      model: 'claude-3-5-haiku-20241022',
      latencyMs: 1234,
      tokens: { input: 100, output: 50, total: 150 },
      estimatedCost: 0.001,
      status: 'success',
    });

    const logs = readLogs();
    assert.ok(logs.length >= 1);
    const last = logs[logs.length - 1];
    assert.strictEqual(last.provider, 'anthropic');
    assert.strictEqual(last.status, 'success');
    assert.strictEqual(last.latencyMs, 1234);
  });

  it('logs error entries', () => {
    clearLogs();

    logTurn({
      provider: 'openai',
      model: 'gpt-4o-mini',
      latencyMs: 0,
      tokens: { input: 0, output: 0, total: 0 },
      estimatedCost: 0,
      status: 'error',
      error: 'rate limited',
    });

    const logs = readLogs();
    assert.ok(logs.length >= 1);
    const last = logs[logs.length - 1];
    assert.strictEqual(last.status, 'error');
    assert.strictEqual(last.error, 'rate limited');
  });

  it('clearLogs empties the log', () => {
    clearLogs();
    const logs = readLogs();
    assert.strictEqual(logs.length, 0);
  });
});

describe('Provider Router', () => {
  it('lists all available providers', () => {
    const providers = getAvailableProviders();
    assert.ok(providers.includes('anthropic'));
    assert.ok(providers.includes('openai'));
    assert.ok(providers.includes('gemini'));
  });
});
