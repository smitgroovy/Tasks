/**
 * OpenAI Provider — Streaming + non-streaming via OpenAI SDK.
 */

import OpenAI from 'openai';
import { StreamHandler } from '../utils/streaming.js';

export class OpenAIProvider {
  constructor(config) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model;
    this.name = 'openai';
    this.streamHandler = new StreamHandler();
  }

  /**
   * Generate a streaming response. Tokens are printed as they arrive.
   * @param {Array} messages - Chat messages array
   * @param {Function} onToken - Called with each text chunk
   * @returns {Promise<{content: string, usage: object, latency: number}>}
   */
  async generateStreamingResponse(messages, onToken) {
    const startTime = Date.now();

    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
      stream_options: { include_usage: true },
    });

    const result = await this.streamHandler.processOpenAIStream(stream, onToken);
    const latency = Date.now() - startTime;

    return {
      content: result.text,
      usage: result.usage,
      latency,
      model: this.model,
      provider: this.name,
    };
  }

  /**
   * Generate a non-streaming response (fallback).
   */
  async generateResponse(messages) {
    const startTime = Date.now();

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const latency = Date.now() - startTime;
    const choice = response.choices[0];

    return {
      content: choice?.message?.content || '',
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
      },
      latency,
      model: this.model,
      provider: this.name,
    };
  }
}
