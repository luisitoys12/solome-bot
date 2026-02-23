const Command = require('../structures/command.js')
const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const serverConfigs = new Map()

module.exports = class Voice extends Command {
  constructor (client) {
    super(client, {
      name: 'voice',
      aliases: ['voz', 'tts'],
      description: '🎙️ Genera voz con IA (Text-to-Speech) y transcribe audio (Speech-to-Text)'
    })
  }

  async runSlash (interaction) {
    const sub = interaction.options.getSubcommand()

    if (sub === 'generar') await this.generar(interaction)
    else if (sub === 'voces') await this.voces(interaction)
    else if (sub === 'transcribir') await this.transcribir(interaction)
  }

  async generar(interaction) {
    await interaction.deferReply()
    
    const texto = interaction.options.getString('texto')
    const voz = interaction.options.getString('voz') || 'alloy'
    const config = serverConfigs.get(interaction.guild.id)

    if (!config || !config.apiKey) {
      return interaction.editReply('❌ Configura una API key con `/ai config` primero.')
    }

    try {
      const response = await axios.post('https://api.openai.com/v1/audio/speech', {
        model: 'tts-1',
        voice: voz,
        input: texto
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      })

      const tempDir = path.join(__dirname, '../../temp')
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

      const fileName = `voice_${Date.now()}.mp3`
      const filePath = path.join(tempDir, fileName)
      
      fs.writeFileSync(filePath, response.data)

      const attachment = new AttachmentBuilder(filePath, { name: fileName })
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle('🎙️ Voz Generada')
        .setDescription(`**Texto:** ${texto.substring(0, 200)}...`)
        .addFields(
          { name: '🔊 Voz', value: voz, inline: true },
          { name: '📦 Formato', value: 'MP3', inline: true }
        )
        .setFooter({ text: `Generado por ${interaction.user.tag}` })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed], files: [attachment] })

      setTimeout(() => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      }, 5000)

    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error generando voz. Verifica la API key.')
    }
  }

  async voces(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎙️ Voces Disponibles')
      .setDescription('Selecciona una voz para `/voice generar`')
      .addFields(
        { name: 'Alloy', value: 'Voz neutral y balanceada', inline: true },
        { name: 'Echo', value: 'Voz masculina', inline: true },
        { name: 'Fable', value: 'Acento británico', inline: true },
        { name: 'Onyx', value: 'Voz grave profunda', inline: true },
        { name: 'Nova', value: 'Voz femenina clara', inline: true },
        { name: 'Shimmer', value: 'Voz suave y cálida', inline: true }
      )
      .setFooter({ text: 'Powered by OpenAI TTS' })

    await interaction.reply({ embeds: [embed] })
  }

  async transcribir(interaction) {
    await interaction.deferReply()
    await interaction.editReply('❌ Función de transcripción aún no implementada. Próximamente!')
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 1,
          name: 'generar',
          description: 'Genera audio con texto (TTS)',
          options: [
            { type: 3, name: 'texto', description: 'Texto a convertir en audio', required: true },
            {
              type: 3,
              name: 'voz',
              description: 'Voz a usar',
              required: false,
              choices: [
                { name: 'Alloy (Neutral)', value: 'alloy' },
                { name: 'Echo (Masculina)', value: 'echo' },
                { name: 'Fable (Británica)', value: 'fable' },
                { name: 'Onyx (Grave)', value: 'onyx' },
                { name: 'Nova (Femenina)', value: 'nova' },
                { name: 'Shimmer (Suave)', value: 'shimmer' }
              ]
            }
          ]
        },
        {
          type: 1,
          name: 'voces',
          description: 'Muestra todas las voces disponibles'
        },
        {
          type: 1,
          name: 'transcribir',
          description: 'Transcribe audio a texto (STT)',
          options: [
            { type: 11, name: 'audio', description: 'Archivo de audio (mp3, wav, m4a, etc.)', required: true }
          ]
        }
      ]
    }
  }
}

module.exports.serverConfigs = serverConfigs
