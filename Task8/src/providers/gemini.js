/**
 * Gemini Provider — Streaming + non-streaming via Google Generative AI SDK.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { StreamHandler } from '../utils/streaming.js';

export class GeminiProvider {
  constructor(config) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
    this.name = 'gemini';
    this.streamHandler = new StreamHandler();
  }

  /**
   * Generate a streaming response. Tokens are printed as they arrive.
   * @param {Array} messages - Chat messages array
   * @param {Function} onToken - Called with each text chunk
   * @returns {Promise<{content: string, usage: object, latency: number}>}
   */
  async generateStreamingResponse(messages, onToken) {
    const systemInstruction = this._extractSystem(messages);
    const history = this._convertMessages(messages);
    const lastMessage = history.pop();

    const model = this.genAI.getGenerativeModel({
      model: this.model,
      ...(systemInstruction && { systemInstruction }),
    });

    const chat = model.startChat({ history });
    const startTime = Date.now();

    const result = await chat.sendMessageStream(lastMessage.parts[0].text);
    const stream = result.stream;

    const streamResult = await this.streamHandler.processGeminiStream(stream, onToken);
    const latency = Date.now() - startTime;

    return {
      content: streamResult.text,
      usage: streamResult.usage,
      latency,
      model: this.model,
      provider: this.name,
    };
  }

  /**
   * Generate a non-streaming response (fallback).
   */
  async generateResponse(messages) {
    const systemInstruction = this._extractSystem(messages);
    const history = this._convertMessages(messages);
    const lastMessage = history.pop();

    const model = this.genAI.getGenerativeModel({
      model: this.model,
      ...(systemInstruction && { systemInstruction }),
    });

    const chat = model.startChat({ history });
    const startTime = Date.now();

    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const response = result.response;
    const latency = Date.now() - startTime;
    const usage = response.usageMetadata || {};

    return {
      content: response.text() || '',
      usage: {
        inputTokens: usage.promptTokenCount || 0,
        outputTokens: usage.candidatesTokenCount || 0,
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
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      }));
  }
}
