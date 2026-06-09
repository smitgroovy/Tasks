/**
 * Streaming Layer — Handles streaming responses from all providers.
 * Normalizes streaming events into a consistent format.
 */

/**
 * Creates a streaming handler that processes provider-specific stream events.
 * Calls onToken for each token chunk and returns the full accumulated text.
 */
export class StreamHandler {
  constructor() {
    this.fullText = '';
    this.tokenCount = 0;
  }

  /**
   * Process Anthropic streaming events.
   * @param {AsyncIterable} stream - Anthropic message stream
   * @param {Function} onToken - Callback for each text chunk
   * @returns {Promise<{text: string, usage: object}>}
   */
  async processAnthropicStream(stream, onToken) {
    this.reset();
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.text) {
        this.fullText += event.delta.text;
        this.tokenCount++;
        if (onToken) onToken(event.delta.text, this.tokenCount);
      }

      if (event.type === 'message_start' && event.message?.usage) {
        inputTokens = event.message.usage.input_tokens || 0;
      }

      if (event.type === 'message_delta' && event.usage) {
        outputTokens = event.usage.output_tokens || 0;
      }
    }

    return {
      text: this.fullText,
      usage: { inputTokens, outputTokens },
    };
  }

  /**
   * Process OpenAI streaming events.
   * @param {AsyncIterable} stream - OpenAI chat completion stream
   * @param {Function} onToken - Callback for each text chunk
   * @returns {Promise<{text: string, usage: object}>}
   */
  async processOpenAIStream(stream, onToken) {
    this.reset();
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      // Handle delta content
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        this.fullText += delta;
        this.tokenCount++;
        if (onToken) onToken(delta, this.tokenCount);
      }

      // Handle usage (usually in the final chunk with stream_options)
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens || 0;
        outputTokens = chunk.usage.completion_tokens || 0;
      }
    }

    return {
      text: this.fullText,
      usage: { inputTokens, outputTokens },
    };
  }

  /**
   * Process Gemini streaming events.
   * @param {AsyncIterable} stream - Gemini generateContent stream
   * @param {Function} onToken - Callback for each text chunk
   * @returns {Promise<{text: string, usage: object}>}
   */
  async processGeminiStream(stream, onToken) {
    this.reset();
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      const text = chunk.text();
      if (text) {
        this.fullText += text;
        this.tokenCount++;
        if (onToken) onToken(text, this.tokenCount);
      }

      // Capture usage from final chunk
      if (chunk.usageMetadata) {
        inputTokens = chunk.usageMetadata.promptTokenCount || 0;
        outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
      }
    }

    return {
      text: this.fullText,
      usage: { inputTokens, outputTokens },
    };
  }

  reset() {
    this.fullText = '';
    this.tokenCount = 0;
  }
}

export default StreamHandler;
