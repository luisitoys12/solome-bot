const axios = require('axios');
const configManager = require('../utils/configManager');

class AIService {
  constructor() {
    this.providers = {
      openai: this.callOpenAI.bind(this),
      gemini: this.callGemini.bind(this),
      anthropic: this.callAnthropic.bind(this)
    };
  }

  async chat(options) {
    const { provider, model, messages, userId, guildId } = options;
    
    // Verificar límites
    const tier = configManager.getUserTier(userId, guildId);
    const limits = configManager.get(`features.ai.limits.${tier}`);
    
    if (limits && limits.daily !== -1) {
      // TODO: Implementar sistema de conteo de uso diario
      // Por ahora permitimos todo para beta
    }

    const activeProvider = provider || configManager.get('features.ai.defaultProvider');
    const providerConfig = configManager.get(`features.ai.providers.${activeProvider}`);

    if (!providerConfig || !providerConfig.enabled) {
      throw new Error(`Proveedor ${activeProvider} no está disponible`);
    }

    const modelToUse = model || providerConfig.models.chat;
    const handler = this.providers[activeProvider];

    if (!handler) {
      throw new Error(`Proveedor ${activeProvider} no soportado`);
    }

    return await handler({ model: modelToUse, messages, type: 'chat' });
  }

  async callOpenAI({ model, messages }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: model || 'gpt-4o-mini',
          messages: messages,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content,
        provider: 'openai',
        model: response.data.model
      };
    } catch (error) {
      console.error('OpenAI Error:', error.response?.data || error.message);
      throw new Error('Error al comunicarse con OpenAI');
    }
  }

  async callGemini({ model, messages }) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no configurada');
    }

    try {
      // Convertir formato de mensajes a formato Gemini
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash-exp'}:generateContent?key=${apiKey}`,
        {
          contents: contents,
          generationConfig: {
            maxOutputTokens: 1000
          }
        }
      );

      return {
        success: true,
        content: response.data.candidates[0].content.parts[0].text,
        provider: 'gemini',
        model: model
      };
    } catch (error) {
      console.error('Gemini Error:', error.response?.data || error.message);
      throw new Error('Error al comunicarse con Gemini');
    }
  }

  async callAnthropic({ model, messages }) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY no configurada');
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: model || 'claude-3-5-sonnet-20241022',
          messages: messages,
          max_tokens: 1000
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        content: response.data.content[0].text,
        provider: 'anthropic',
        model: response.data.model
      };
    } catch (error) {
      console.error('Anthropic Error:', error.response?.data || error.message);
      throw new Error('Error al comunicarse con Anthropic');
    }
  }

  getAvailableProviders() {
    const providers = configManager.get('features.ai.providers');
    return Object.entries(providers)
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => ({ name, models: config.models }));
  }
}

module.exports = new AIService();
