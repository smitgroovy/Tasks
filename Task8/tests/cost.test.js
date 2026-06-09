/**
 * Tests — Cost calculator and token counter.
 * Run with: node --test tests/cost.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateCost, getModelPricing, getAllPricing } from '../src/utils/costCalculator.js';
import { TokenCounter } from '../src/utils/tokenCounter.js';

describe('Cost Calculator', () => {
  it('calculates cost for Claude Haiku', () => {
    const cost = calculateCost('claude-3-5-haiku-20241022', 1000, 500);
    // Input: (1000/1M) * 0.80 = 0.0008
    // Output: (500/1M) * 4.00 = 0.002
    assert.ok(cost.totalCost > 0);
    assert.strictEqual(cost.modelLabel, 'Claude 3.5 Haiku');
  });

  it('calculates cost for GPT-4o-mini', () => {
    const cost = calculateCost('gpt-4o-mini', 1000, 500);
    assert.ok(cost.totalCost > 0);
    assert.strictEqual(cost.modelLabel, 'GPT-4o Mini');
  });

  it('calculates cost for Gemini Flash', () => {
    const cost = calculateCost('gemini-2.5-flash', 1000, 500);
    assert.ok(cost.totalCost >= 0);
    assert.strictEqual(cost.modelLabel, 'Gemini 2.5 Flash');
  });

  it('returns zero for unknown model', () => {
    const cost = calculateCost('unknown-model', 1000, 500);
    assert.strictEqual(cost.totalCost, 0);
  });

  it('getModelPricing returns pricing info', () => {
    const pricing = getModelPricing('gpt-4o');
    assert.ok(pricing);
    assert.strictEqual(pricing.input, 2.50);
    assert.strictEqual(pricing.output, 10.00);
  });

  it('getAllPricing returns all models', () => {
    const all = getAllPricing();
    assert.ok(all['claude-3-5-haiku-20241022']);
    assert.ok(all['gpt-4o-mini']);
    assert.ok(all['gemini-2.5-flash']);
  });
});

describe('Token Counter', () => {
  it('tracks per-turn usage', () => {
    const tc = new TokenCounter();
    tc.recordTurn(100, 50);
    const turn = tc.getTurnUsage();
    assert.strictEqual(turn.input, 100);
    assert.strictEqual(turn.output, 50);
    assert.strictEqual(turn.total, 150);
  });

  it('accumulates session usage', () => {
    const tc = new TokenCounter();
    tc.recordTurn(100, 50);
    tc.recordTurn(200, 80);
    const session = tc.getSessionUsage();
    assert.strictEqual(session.input, 300);
    assert.strictEqual(session.output, 130);
    assert.strictEqual(session.turns, 2);
  });

  it('reset clears everything', () => {
    const tc = new TokenCounter();
    tc.recordTurn(100, 50);
    tc.reset();
    const session = tc.getSessionUsage();
    assert.strictEqual(session.total, 0);
    assert.strictEqual(session.turns, 0);
  });
});
