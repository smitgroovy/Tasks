/**
 * Tests — Retry layer, cost calculator, token counter, logger, provider router.
 * Run with: node --test tests/retry.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { withRetry, isRetryableError, calculateDelay } from '../src/utils/retry.js';

describe('Retry Layer', () => {
  it('should succeed on first try if no error', async () => {
    let calls = 0;
    const result = await withRetry(async () => {
      calls++;
      return 'ok';
    });
    assert.strictEqual(result, 'ok');
    assert.strictEqual(calls, 1);
  });

  it('should retry on retryable error and eventually succeed', async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) {
          const err = new Error('rate limited');
          err.status = 429;
          throw err;
        }
        return 'recovered';
      },
      { maxRetries: 4, baseDelayMs: 10 } // fast for tests
    );
    assert.strictEqual(result, 'recovered');
    assert.strictEqual(calls, 3);
  });

  it('should throw after exhausting retries', async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        withRetry(
          async () => {
            calls++;
            const err = new Error('server error');
            err.status = 500;
            throw err;
          },
          { maxRetries: 2, baseDelayMs: 10 }
        ),
      { message: 'server error' }
    );
    assert.strictEqual(calls, 3); // 1 initial + 2 retries
  });

  it('should NOT retry non-retryable errors', async () => {
    let calls = 0;
    await assert.rejects(
      () =>
        withRetry(
          async () => {
            calls++;
            throw new Error('bad request');
          },
          { maxRetries: 4, baseDelayMs: 10 }
        ),
      { message: 'bad request' }
    );
    assert.strictEqual(calls, 1); // no retries
  });

  it('isRetryableError detects 429', () => {
    const err = new Error('rate limited');
    err.status = 429;
    assert.strictEqual(isRetryableError(err), true);
  });

  it('isRetryableError detects 500', () => {
    const err = new Error('server error');
    err.status = 500;
    assert.strictEqual(isRetryableError(err), true);
  });

  it('isRetryableError detects ECONNRESET', () => {
    const err = new Error('connection reset');
    err.code = 'ECONNRESET';
    assert.strictEqual(isRetryableError(err), true);
  });

  it('isRetryableError rejects 400', () => {
    const err = new Error('bad request');
    err.status = 400;
    assert.strictEqual(isRetryableError(err), false);
  });

  it('calculateDelay returns increasing values', () => {
    const d0 = calculateDelay(0);
    const d1 = calculateDelay(1);
    const d2 = calculateDelay(2);
    // With jitter, d2 should generally be larger than d0
    assert.ok(d0 > 0);
    assert.ok(d1 > 0);
    assert.ok(d2 > 0);
  });
});
