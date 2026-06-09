import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider {
  constructor(config) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model;
    this.name = 'anthropic';
  }

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
    const systemMsg = messages.find(m => m.role === 'system');
    return systemMsg ? systemMsg.content : null;
  }

  _convertMessages(messages) {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
  }
}
