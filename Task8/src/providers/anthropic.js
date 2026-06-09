/**
 * Anthropic Provider — Streaming + non-streaming via Anthropic SDK.
 */

import Anthropic from '@anthropic-ai/sdk';
import { StreamHandler } from '../utils/streaming.js';

export class AnthropicProvider {
  constructor(config) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model;
    this.name = 'anthropic';
    this.streamHandler = new StreamHandler();
  }

  /**
   * Generate a streaming response. Tokens are printed as they arrive.
   * @param {Array} messages - Chat messages array
   * @param {Function} onToken - Called with each text chunk
   * @returns {Promise<{content: string, usage: object, latency: number}>}
   */
  async generateStreamingResponse(messages, onToken) {
    const systemMessage = this._extractSystem(messages);
    const apiMessages = this._convertMessages(messages);

    const startTime = Date.now();

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 1024,
      ...(systemMessage && { system: systemMessage }),
      messages: apiMessages,
    });

    const result = await this.streamHandler.processAnthropicStream(stream, onToken);
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
    const systemMessage = this._extractSystem(messages);
    const apiMessages = this._convertMessages(messages);

    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      ...(systemMessage && { system: systemMessage }),
      messages: apiMessages,
    });

    const latency = Date.now() - startTime;
    const content = response.content[0]?.text || '';

    return {
      content,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      latency,
      model: this.model,
      provider: this.name,
    };
  }

  _extractSystem(messages) {
    const systemMsg = messages.find((m) => m.role === 'system');
    return systemMsg ? systemMsg.content : null;
  }

  _convertMessages(messages) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));
  }
}
