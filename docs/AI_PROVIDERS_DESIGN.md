# 🤖 AI Providers - Diseño de Arquitectura

> Sistema multi-proveedor de IA configurable desde el dashboard, permitiendo a los owners elegir OpenAI, Gemini, Anthropic u otros proveedores sin tocar código.

---

## 🎯 Objetivos

1. **Flexibilidad**: Soportar múltiples proveedores de IA (OpenAI, Gemini, Anthropic, Ollama, etc.).
2. **Sin vendor lock-in**: Cambiar de proveedor sin reescribir comandos.
3. **Configurable**: Owners eligen proveedores desde el dashboard.
4. **Per-server override**: Servidores Pro pueden usar sus propias APIs.
5. **Extensible**: Fácil agregar nuevos proveedores.

---

## 📋 Arquitectura general

```
┌───────────────────┐
│  Comandos Discord  │
│  /ia, /charlar     │
└───────┬───────────┘
        │
        ↓
┌───────┴─────────────────────┐
│      AIService (Central)       │
│  - getConfig(guildId)        │
│  - chat()                    │
│  - image()                   │
│  - tts()                     │
└───────┬─────────────────────┘
        │
        ↓
┌───────┴─────────────────────┐
│   Config Resolver           │
│  1. Check guild override    │
│  2. Fallback to global      │
└───────┬─────────────────────┘
        │
        ↓
┌───────┴──────────────────────────────────────────────┐
│                Provider Adapters                   │
├────────────┬────────────┬────────────┬────────────┤
│  OpenAI    │   Gemini   │ Anthropic │   Ollama   │
│  Adapter   │  Adapter  │  Adapter  │  Adapter  │
└────────────┴────────────┴────────────┴────────────┘
        │              │            │            │
        ↓              ↓            ↓            ↓
┌────────────┴────────────┴────────────┴────────────┐
│              External AI APIs                     │
└────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de archivos

```
src/
├── services/
│   ├── aiService.js              # Servicio central
│   └── providers/                # Adapters por proveedor
│       ├── openai.js
│       ├── gemini.js
│       ├── anthropic.js
│       ├── ollama.js
│       └── http.js               # HTTP genérico
├── config/
│   └── aiProviders.json          # Config de ejemplo
└── commands/
    ├── ia.js                     # Usa aiService
    └── charlar.js                # Usa aiService
```

---

## 🔧 Implementación

### 1. Config global (para owners)

**Archivo**: `src/config/aiProviders.json`

```json
{
  "global": {
    "provider": "gemini",
    "providers": {
      "openai": {
        "apiKey": "sk-...",
        "models": {
          "chat": "gpt-4-turbo",
          "image": "dall-e-3",
          "tts": "tts-1"
        }
      },
      "gemini": {
        "apiKey": "AIza...",
        "models": {
          "chat": "gemini-2.0-flash-exp",
          "image": "imagen-3.0",
          "tts": "gemini-tts"
        }
      },
      "anthropic": {
        "apiKey": "sk-ant-...",
        "models": {
          "chat": "claude-3-5-sonnet-20241022"
        }
      },
      "ollama": {
        "baseUrl": "http://localhost:11434",
        "models": {
          "chat": "llama3.1",
          "image": "stable-diffusion"
        }
      }
    }
  }
}
```

### 2. Config por servidor (Pro)

**Base de datos**: tabla `guild_ai_config`

```sql
CREATE TABLE guild_ai_config (
  guild_id VARCHAR(20) PRIMARY KEY,
  provider VARCHAR(20),
  api_key TEXT,
  models JSON,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Ejemplo de row**:
```json
{
  "guild_id": "123456789",
  "provider": "openai",
  "api_key": "sk-custom-key",
  "models": {
    "chat": "gpt-4",
    "image": "dall-e-3"
  }
}
```

### 3. AIService central

**Archivo**: `src/services/aiService.js`

```javascript
const fs = require('fs')
const path = require('path')

// Importar adapters
const OpenAIAdapter = require('./providers/openai')
const GeminiAdapter = require('./providers/gemini')
const AnthropicAdapter = require('./providers/anthropic')
const OllamaAdapter = require('./providers/ollama')
const HTTPAdapter = require('./providers/http')

class AIService {
  constructor() {
    // Cargar config global
    const configPath = path.join(__dirname, '../config/aiProviders.json')
    this.globalConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    
    // Registro de adapters
    this.adapters = {
      'openai': OpenAIAdapter,
      'gemini': GeminiAdapter,
      'anthropic': AnthropicAdapter,
      'ollama': OllamaAdapter,
      'http': HTTPAdapter
    }
  }

  /**
   * Obtiene la config para un servidor
   * @param {string} guildId - ID del servidor (null para global)
   * @returns {Object} Config completa
   */
  async getConfig(guildId = null) {
    if (!guildId) {
      return this.globalConfig.global
    }

    // Buscar override por servidor en DB
    const guildConfig = await this.getGuildConfigFromDB(guildId)
    
    if (guildConfig) {
      // Servidor tiene config propia
      return {
        provider: guildConfig.provider,
        providers: {
          [guildConfig.provider]: {
            apiKey: guildConfig.api_key,
            models: guildConfig.models
          }
        }
      }
    }

    // Fallback a config global
    return this.globalConfig.global
  }

  /**
   * Chat de texto
   * @param {Object} options
   * @param {string} options.provider - null = usar config
   * @param {string} options.model - null = usar default
   * @param {Array} options.messages - [{role, content}]
   * @param {string} options.guildId - ID del servidor
   * @returns {Promise<string>} Respuesta del modelo
   */
  async chat({ provider = null, model = null, messages, guildId = null }) {
    const config = await this.getConfig(guildId)
    const selectedProvider = provider || config.provider
    const selectedModel = model || config.providers[selectedProvider].models.chat

    // Obtener adapter
    const Adapter = this.adapters[selectedProvider]
    if (!Adapter) {
      throw new Error(`Provider "${selectedProvider}" no soportado`)
    }

    // Instanciar y llamar
    const adapter = new Adapter(config.providers[selectedProvider])
    return await adapter.chat({ model: selectedModel, messages })
  }

  /**
   * Generación de imagen
   * @param {Object} options
   * @param {string} options.provider - null = usar config
   * @param {string} options.model - null = usar default
   * @param {string} options.prompt - Descripción de la imagen
   * @param {string} options.guildId - ID del servidor
   * @returns {Promise<string>} URL de la imagen
   */
  async image({ provider = null, model = null, prompt, guildId = null }) {
    const config = await this.getConfig(guildId)
    const selectedProvider = provider || config.provider
    const selectedModel = model || config.providers[selectedProvider].models.image

    const Adapter = this.adapters[selectedProvider]
    if (!Adapter) {
      throw new Error(`Provider "${selectedProvider}" no soportado`)
    }

    const adapter = new Adapter(config.providers[selectedProvider])
    return await adapter.image({ model: selectedModel, prompt })
  }

  /**
   * Text-to-Speech
   * @param {Object} options
   * @param {string} options.provider - null = usar config
   * @param {string} options.model - null = usar default
   * @param {string} options.text - Texto a convertir
   * @param {string} options.guildId - ID del servidor
   * @returns {Promise<Buffer>} Audio en buffer
   */
  async tts({ provider = null, model = null, text, guildId = null }) {
    const config = await this.getConfig(guildId)
    const selectedProvider = provider || config.provider
    const selectedModel = model || config.providers[selectedProvider].models.tts

    const Adapter = this.adapters[selectedProvider]
    if (!Adapter) {
      throw new Error(`Provider "${selectedProvider}" no soportado`)
    }

    const adapter = new Adapter(config.providers[selectedProvider])
    return await adapter.tts({ model: selectedModel, text })
  }

  /**
   * Helper: obtener config de servidor desde DB
   * @private
   */
  async getGuildConfigFromDB(guildId) {
    // TODO: implementar con tu sistema de DB
    // Por ahora retorna null (usar config global)
    return null
  }
}

module.exports = new AIService()
```

### 4. Adapters por proveedor

**Archivo**: `src/services/providers/openai.js`

```javascript
const axios = require('axios')

class OpenAIAdapter {
  constructor(config) {
    this.apiKey = config.apiKey
    this.baseUrl = 'https://api.openai.com/v1'
  }

  async chat({ model, messages }) {
    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model,
        messages
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  }

  async image({ model, prompt }) {
    const response = await axios.post(
      `${this.baseUrl}/images/generations`,
      {
        model,
        prompt,
        n: 1,
        size: '1024x1024'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.data[0].url
  }

  async tts({ model, text }) {
    const response = await axios.post(
      `${this.baseUrl}/audio/speech`,
      {
        model,
        input: text,
        voice: 'alloy'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    )
    return Buffer.from(response.data)
  }
}

module.exports = OpenAIAdapter
```

**Archivo**: `src/services/providers/gemini.js`

```javascript
const axios = require('axios')

class GeminiAdapter {
  constructor(config) {
    this.apiKey = config.apiKey
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
  }

  async chat({ model, messages }) {
    // Convertir formato OpenAI a Gemini
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const response = await axios.post(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      { contents }
    )
    return response.data.candidates[0].content.parts[0].text
  }

  async image({ model, prompt }) {
    // Implementar con Imagen API
    throw new Error('Gemini image no implementado aún')
  }

  async tts({ model, text }) {
    // Implementar con TTS API
    throw new Error('Gemini TTS no implementado aún')
  }
}

module.exports = GeminiAdapter
```

### 5. Uso en comandos

**Archivo**: `src/commands/ia.js`

```javascript
const aiService = require('../services/aiService')

class IACommand {
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand()

    if (subcommand === 'texto') {
      const prompt = interaction.options.getString('prompt')
      
      await interaction.deferReply()

      try {
        const response = await aiService.chat({
          messages: [
            { role: 'user', content: prompt }
          ],
          guildId: interaction.guildId
        })

        await interaction.editReply(response)
      } catch (error) {
        await interaction.editReply(`Error: ${error.message}`)
      }
    }

    if (subcommand === 'imagen') {
      const prompt = interaction.options.getString('prompt')
      
      await interaction.deferReply()

      try {
        const imageUrl = await aiService.image({
          prompt,
          guildId: interaction.guildId
        })

        await interaction.editReply({
          content: 'Imagen generada:',
          files: [imageUrl]
        })
      } catch (error) {
        await interaction.editReply(`Error: ${error.message}`)
      }
    }
  }
}
```

---

## 🎛️ Dashboard - Sección AI Providers

### Panel de owner (admin)

**Ruta**: `/admin/ai-providers`

**UI**:
```
┌─────────────────────────────────────────────────┐
│  AI Providers - Configuración Global             │
├─────────────────────────────────────────────────┤
│                                                  │
│  Proveedor principal:  [▼ Gemini      ]        │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ OpenAI                                    │  │
│  ├──────────────────────────────────────────┤  │
│  │ API Key: [sk-...***] [Editar]            │  │
│  │ Chat model: gpt-4-turbo                  │  │
│  │ Image model: dall-e-3                    │  │
│  │ TTS model: tts-1                         │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Gemini (Activo)                          │  │
│  ├──────────────────────────────────────────┤  │
│  │ API Key: [AIza...***] [Editar]           │  │
│  │ Chat model: gemini-2.0-flash-exp         │  │
│  │ Image model: imagen-3.0                  │  │
│  │ TTS model: gemini-tts                    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [ + Añadir proveedor ]                        │
│                                                  │
│  [ Guardar cambios ]                            │
└─────────────────────────────────────────────────┘
```

### Panel por servidor (Pro)

**Ruta**: `/servers/:guildId/ai`

**UI**:
```
┌─────────────────────────────────────────────────┐
│  Configuración de IA - Mi Servidor             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ☑ Usar configuración global (Gemini)         │
│  ☐ Usar mi propia API (requiere Pro)          │
│                                                  │
│  Créditos de IA restantes: 8750 / 10000        │
│                                                  │
│  Límites:                                        │
│    - Chat: 50 mensajes/día                     │
│    - Imágenes: 10 generaciones/día             │
│                                                  │
│  [ Actualizar a Pro para más créditos ]        │
└─────────────────────────────────────────────────┘
```

---

## ✅ Ventajas de esta arquitectura

1. **Desacoplamiento**: Comandos no dependen de un proveedor específico.
2. **Facilidad de cambio**: Cambiar de OpenAI a Gemini es 1 click en dashboard.
3. **Per-server customization**: Servidores Pro usan sus propias APIs.
4. **Extensible**: Agregar nuevo proveedor = crear nuevo adapter.
5. **Testing**: Facil mockear AIService para tests.

---

## 🚀 Próximos pasos

1. Implementar adapters faltantes (Anthropic, Ollama, HTTP).
2. Conectar dashboard con backend para editar config.
3. Sistema de créditos por servidor.
4. Métricas de uso por proveedor.
5. Rate limiting por proveedor.

---

**Versión**: 1.0  
**Autor**: Solome Team  
**Última actualización**: Febrero 21, 2026
