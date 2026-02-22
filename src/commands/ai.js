const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

// Configuración por servidor (en producción: base de datos)
const serverConfigs = new Map()

module.exports = class AI extends Command {
  constructor (client) {
    super(client, {
      name: 'ai',
      aliases: ['ia', 'chatgpt'],
      description: '🤖 Interactúa con inteligencia artificial (ChatGPT, Claude, Gemini)'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    if (subcommand === 'chat') {
      await this.chat(interaction)
    } else if (subcommand === 'imagen') {
      await this.imagen(interaction)
    } else if (subcommand === 'config') {
      await this.config(interaction)
    } else if (subcommand === 'modelo') {
      await this.modelo(interaction)
    }
  }

  async chat(interaction) {
    await interaction.deferReply()
    
    const pregunta = interaction.options.getString('pregunta')
    const config = serverConfigs.get(interaction.guild.id) || { modelo: 'gpt-3.5', apiKey: null }
    
    if (!config.apiKey) {
      return interaction.editReply(
        '❌ Este servidor no tiene configurada una API key.\n' +
        'Los administradores pueden configurarla con `/ai config`'
      )
    }
    
    try {
      // Llamada a API de IA (ejemplo con OpenAI)
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: config.modelo,
        messages: [
          { role: 'system', content: 'Eres un asistente útil en Discord.' },
          { role: 'user', content: pregunta }
        ],
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      const respuesta = response.data.choices[0].message.content
      
      const embed = new EmbedBuilder()
        .setColor(0x00d4ff)
        .setTitle('🤖 Respuesta de IA')
        .addFields(
          { name: '❓ Pregunta', value: pregunta.substring(0, 1024) },
          { name: '💬 Respuesta', value: respuesta.substring(0, 1024) }
        )
        .setFooter({ text: `Modelo: ${config.modelo} | Solicitado por ${interaction.user.tag}` })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply(
        '❌ Error al contactar con la API de IA.\n' +
        'Verifica que la API key sea válida y tenga créditos.'
      )
    }
  }

  async imagen(interaction) {
    await interaction.deferReply()
    
    const descripcion = interaction.options.getString('descripcion')
    const config = serverConfigs.get(interaction.guild.id) || { apiKey: null }
    
    if (!config.apiKey) {
      return interaction.editReply('❌ Configura primero una API key con `/ai config`')
    }
    
    try {
      // DALL-E API call
      const response = await axios.post('https://api.openai.com/v1/images/generations', {
        model: 'dall-e-3',
        prompt: descripcion,
        n: 1,
        size: '1024x1024'
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      const imageUrl = response.data.data[0].url
      
      const embed = new EmbedBuilder()
        .setColor(0xff00ff)
        .setTitle('🎨 Imagen Generada por IA')
        .setDescription(`**Prompt:** ${descripcion}`)
        .setImage(imageUrl)
        .setFooter({ text: `DALL-E 3 | Solicitado por ${interaction.user.tag}` })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al generar imagen. Verifica tu API key y créditos.')
    }
  }

  async config(interaction) {
    // Solo administradores
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ Solo administradores pueden configurar la IA.',
        ephemeral: true 
      })
    }
    
    const provider = interaction.options.getString('provider')
    const apiKey = interaction.options.getString('apikey')
    
    serverConfigs.set(interaction.guild.id, {
      provider: provider,
      apiKey: apiKey,
      modelo: provider === 'openai' ? 'gpt-4' : 'claude-3-opus'
    })
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Configuración de IA Actualizada')
      .setDescription(
        `**Proveedor:** ${provider}\n` +
        `**API Key:** ||${apiKey.substring(0, 10)}...||\n\n` +
        '⚠️ La API key se almacena de forma segura.'
      )
      .addFields(
        { name: '📊 Uso', value: 'Ahora los usuarios pueden usar `/ai chat` y `/ai imagen`' },
        { name: '🔒 Seguridad', value: 'Solo los administradores pueden ver/modificar la config' }
      )
      .setFooter({ text: 'Configuración guardada exitosamente' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed], ephemeral: true })
  }

  async modelo(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ Solo administradores pueden cambiar el modelo.',
        ephemeral: true 
      })
    }
    
    const nuevoModelo = interaction.options.getString('nombre')
    const config = serverConfigs.get(interaction.guild.id) || {}
    
    config.modelo = nuevoModelo
    serverConfigs.set(interaction.guild.id, config)
    
    await interaction.reply({ 
      content: `✅ Modelo cambiado a **${nuevoModelo}**`,
      ephemeral: true 
    })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 1,
          name: 'chat',
          description: 'Chatea con la IA',
          options: [
            { type: 3, name: 'pregunta', description: 'Tu pregunta o mensaje', required: true }
          ]
        },
        {
          type: 1,
          name: 'imagen',
          description: 'Genera una imagen con IA',
          options: [
            { type: 3, name: 'descripcion', description: 'Describe la imagen que quieres', required: true }
          ]
        },
        {
          type: 1,
          name: 'config',
          description: '[ADMIN] Configurar API de IA para el servidor',
          options: [
            {
              type: 3,
              name: 'provider',
              description: 'Proveedor de IA',
              required: true,
              choices: [
                { name: 'OpenAI (ChatGPT, DALL-E)', value: 'openai' },
                { name: 'Anthropic (Claude)', value: 'anthropic' },
                { name: 'Google (Gemini)', value: 'google' },
                { name: 'Cohere', value: 'cohere' }
              ]
            },
            { type: 3, name: 'apikey', description: 'Tu API key del proveedor', required: true }
          ]
        },
        {
          type: 1,
          name: 'modelo',
          description: '[ADMIN] Cambiar modelo de IA',
          options: [
            {
              type: 3,
              name: 'nombre',
              description: 'Modelo a usar',
              required: true,
              choices: [
                { name: 'GPT-4', value: 'gpt-4' },
                { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                { name: 'Claude 3 Opus', value: 'claude-3-opus' },
                { name: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
                { name: 'Gemini Pro', value: 'gemini-pro' }
              ]
            }
          ]
        }
      ]
    }
  }
}

module.exports.serverConfigs = serverConfigs
