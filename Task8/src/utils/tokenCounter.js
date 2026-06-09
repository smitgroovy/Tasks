/**
 * Token Counter — Tracks token usage across turns and sessions.
 * Provides per-turn and cumulative token counts.
 */

export class TokenCounter {
  constructor() {
    this.reset();
  }

  /** Reset all counters. */
  reset() {
    this.sessionInputTokens = 0;
    this.sessionOutputTokens = 0;
    this.turnInputTokens = 0;
    this.turnOutputTokens = 0;
    this.turnCount = 0;
  }

  /** Record token usage for the current turn. */
  recordTurn(inputTokens, outputTokens) {
    this.turnInputTokens = inputTokens;
    this.turnOutputTokens = outputTokens;
    this.sessionInputTokens += inputTokens;
    this.sessionOutputTokens += outputTokens;
    this.turnCount++;
  }

  /** Get current turn usage. */
  getTurnUsage() {
    return {
      input: this.turnInputTokens,
      output: this.turnOutputTokens,
      total: this.turnInputTokens + this.turnOutputTokens,
    };
  }

  /** Get cumulative session usage. */
  getSessionUsage() {
    return {
      input: this.sessionInputTokens,
      output: this.sessionOutputTokens,
      total: this.sessionInputTokens + this.sessionOutputTokens,
      turns: this.turnCount,
    };
  }
}

export default TokenCounter;
