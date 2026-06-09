import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider {
  constructor(config) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
    this.name = 'gemini';
    this.maxRetries = 3;
  }

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

    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
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
      } catch (error) {
        lastError = error;
        const isRateLimit = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
        if (isRateLimit && attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 2000;
          console.log(`  Rate limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${this.maxRetries})...`);
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  _extractSystem(messages) {
    const systemMsg = messages.find(m => m.role === 'system');
    return systemMsg ? systemMsg.content : null;
  }

  _convertMessages(messages) {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.content }],
      }));
  }
}
