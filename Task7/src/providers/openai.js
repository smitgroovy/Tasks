import OpenAI from 'openai';

export class OpenAIProvider {
  constructor(config) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model;
    this.name = 'openai';
  }

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
