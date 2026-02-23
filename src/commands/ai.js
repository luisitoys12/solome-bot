const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const axios = require('axios')

// Configuración por servidor
const serverConfigs = new Map()

module.exports = class AI extends Command {
  constructor (client) {
    super(client, {
      name: 'ai',
      aliases: ['ia', 'chatgpt'],
      description: '🤖 Interactúa con inteligencia artificial (APIs gratuitas disponibles)'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    if (subcommand === 'chat') {
      await this.chat(interaction)
    } else if (subcommand === 'config') {
      await this.config(interaction)
    } else if (subcommand === 'info') {
      await this.info(interaction)
    }
  }

  async chat(interaction) {
    await interaction.deferReply()
    
    const pregunta = interaction.options.getString('pregunta')
    const config = serverConfigs.get(interaction.guild.id) || { 
      provider: 'free',
      apiKey: null 
    }
    
    try {
      let respuesta
      
      if (config.provider === 'free' || !config.apiKey) {
        respuesta = await this.chatFree(pregunta)
      } else if (config.provider === 'openai') {
        respuesta = await this.chatOpenAI(pregunta, config.apiKey)
      } else {
        return interaction.editReply('❌ Proveedor no soportado aún. Usa el modo gratuito.')
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x00d4ff)
        .setTitle('🤖 Respuesta de IA')
        .addFields(
          { name: '❓ Pregunta', value: pregunta.substring(0, 1024) },
          { name: '💬 Respuesta', value: respuesta.substring(0, 1024) }
        )
        .setFooter({ 
          text: `Modo: ${config.provider || 'gratuito'} | ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', 'Error en AI:', error)
      
      // ❌ NO mostrar error técnico al usuario
      await interaction.editReply(
        '❌ No pude procesar tu pregunta en este momento.\n\n' +
        '💭 **Intenta:**\n' +
        '• Reformular tu pregunta\n' +
        '• Intentar de nuevo en unos segundos\n' +
        '• Contactar a los administradores si persiste'
      )
    }
  }

  async chatFree(pregunta) {
    try {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        { inputs: pregunta },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      )
      
      return response.data[0]?.generated_text || 'No pude generar una respuesta.'
    } catch (error) {
      this.client.log('warn', 'HuggingFace API falló, usando fallback')
      
      const respuestas = [
        'Esa es una pregunta interesante. Podrías ser más específico?',
        'Entiendo tu pregunta. Inténtalo de otra forma.',
        'El servicio de IA está ocupado. Intenta en unos minutos.'
      ]
      return respuestas[Math.floor(Math.random() * respuestas.length)]
    }
  }

  async chatOpenAI(pregunta, apiKey) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un asistente útil en Discord.' },
          { role: 'user', content: pregunta }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    )
    
    return response.data.choices[0].message.content
  }

  async config(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ 
        content: '❌ Solo administradores pueden configurar la IA.',
        flags: 64
      })
    }
    
    const provider = interaction.options.getString('provider')
    const apiKey = interaction.options.getString('apikey')
    
    serverConfigs.set(interaction.guild.id, {
      provider: provider,
      apiKey: apiKey
    })
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Configuración de IA Actualizada')
      .setDescription(
        `**Proveedor:** ${provider}\n` +
        (apiKey ? `**API Key:** ||${apiKey.substring(0, 10)}...||\n\n` : '') +
        '⚠️ La configuración se guarda en memoria (se pierde al reiniciar).'
      )
      .addFields(
        { name: '📊 Uso', value: 'Los usuarios pueden usar `/ai chat`' },
        { name: '🔒 Seguridad', value: 'Solo administradores pueden modificar la config' }
      )
      .setFooter({ text: 'Configuración guardada exitosamente' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed], flags: 64 })
  }

  async info(interaction) {
    const config = serverConfigs.get(interaction.guild.id) || { provider: 'free' }
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🤖 Información del Sistema de IA')
      .setDescription(
        '🆓 **MODO GRATUITO ACTIVO**\n' +
        'El bot usa Hugging Face Inference API (sin API key requerida)\n\n'
      )
      .addFields(
        { 
          name: '🔧 Configuración Actual', 
          value: `Proveedor: **${config.provider || 'gratuito'}**\nAPI Key: ${config.apiKey ? '✅ Configurada' : '❌ No configurada'}` 
        },
        {
          name: '🎯 Proveedores Soportados',
          value: '• **free** - Hugging Face (gratis)\n• **openai** - ChatGPT (requiere API key)'
        },
        {
          name: '📚 Cómo obtener API keys',
          value: '**OpenAI:** https://platform.openai.com/api-keys\n**Hugging Face:** https://huggingface.co/settings/tokens'
        },
        {
          name: '⚙️ Configurar',
          value: 'Los admins pueden usar `/ai config` para establecer una API key propia'
        }
      )
      .setFooter({ text: 'EstacionKusTV - SOLOME Bot' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('chat')
          .setDescription('Chatea con la IA')
          .addStringOption(opt =>
            opt
              .setName('pregunta')
              .setDescription('Tu pregunta o mensaje')
              .setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('config')
          .setDescription('[ADMIN] Configurar API de IA para el servidor')
          .addStringOption(opt =>
            opt
              .setName('provider')
              .setDescription('Proveedor de IA')
              .setRequired(true)
              .addChoices(
                { name: '🆓 Gratis (Hugging Face)', value: 'free' },
                { name: 'OpenAI (ChatGPT)', value: 'openai' }
              )
          )
          .addStringOption(opt =>
            opt
              .setName('apikey')
              .setDescription('Tu API key (opcional si usas modo gratuito)')
              .setRequired(false)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('info')
          .setDescription('Ver información del sistema de IA')
      )
  }
}

module.exports.serverConfigs = serverConfigs
