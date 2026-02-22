const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')
const { serverConfigs } = require('./ai.js')

module.exports = class Voice extends Command {
  constructor (client) {
    super(client, {
      name: 'voice',
      aliases: ['voz', 'tts'],
      description: '🎤 Genera audio con voz de IA (Text-to-Speech)'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    if (subcommand === 'generar') {
      await this.generar(interaction)
    } else if (subcommand === 'voces') {
      await this.voces(interaction)
    } else if (subcommand === 'transcribir') {
      await this.transcribir(interaction)
    }
  }

  async generar(interaction) {
    await interaction.deferReply()
    
    const texto = interaction.options.getString('texto')
    const voz = interaction.options.getString('voz') || 'alloy'
    const config = serverConfigs.get(interaction.guild.id)
    
    if (!config?.apiKey) {
      return interaction.editReply('❌ Configura primero una API key con `/ai config`')
    }
    
    try {
      const response = await axios.post('https://api.openai.com/v1/audio/speech', {
        model: 'tts-1-hd',
        voice: voz,
        input: texto,
        speed: 1.0
      }, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      })
      
      const buffer = Buffer.from(response.data)
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff88)
        .setTitle('🎤 Audio Generado')
        .setDescription(`**Texto:** ${texto.substring(0, 200)}...`)
        .addFields(
          { name: '🔊 Voz', value: voz, inline: true },
          { name: '⏱️ Duración', value: `~${Math.ceil(texto.length / 20)}s`, inline: true }
        )
        .setFooter({ text: 'OpenAI TTS | Text-to-Speech' })
        .setTimestamp()
      
      await interaction.editReply({ 
        embeds: [embed],
        files: [{ attachment: buffer, name: 'audio.mp3' }]
      })
      
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al generar audio. Verifica tu API key.')
    }
  }

  async voces(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('🎤 Voces Disponibles')
      .setDescription('Elige entre estas voces de alta calidad:')
      .addFields(
        { name: '🔉 Alloy', value: 'Voz neutral y equilibrada', inline: true },
        { name: '🎙️ Echo', value: 'Voz masculina profunda', inline: true },
        { name: '✨ Fable', value: 'Voz británica expresiva', inline: true },
        { name: '💃 Onyx', value: 'Voz grave y autoritaria', inline: true },
        { name: '🎵 Nova', value: 'Voz femenina energética', inline: true },
        { name: '🌸 Shimmer', value: 'Voz suave y amigable', inline: true }
      )
      .setFooter({ text: 'Usa /voice generar con el nombre de la voz' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async transcribir(interaction) {
    await interaction.deferReply()
    
    const archivo = interaction.options.getAttachment('audio')
    const config = serverConfigs.get(interaction.guild.id)
    
    if (!config?.apiKey) {
      return interaction.editReply('❌ Configura primero una API key con `/ai config`')
    }
    
    // Validar formato
    const validFormats = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm']
    const ext = archivo.name.split('.').pop().toLowerCase()
    
    if (!validFormats.includes(ext)) {
      return interaction.editReply(`❌ Formato no válido. Usa: ${validFormats.join(', ')}`)
    }
    
    try {
      // Descargar archivo
      const audioResponse = await axios.get(archivo.url, { responseType: 'arraybuffer' })
      const audioBuffer = Buffer.from(audioResponse.data)
      
      // Transcribir con Whisper
      const FormData = require('form-data')
      const form = new FormData()
      form.append('file', audioBuffer, { filename: archivo.name })
      form.append('model', 'whisper-1')
      
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          ...form.getHeaders()
        }
      })
      
      const transcripcion = response.data.text
      
      const embed = new EmbedBuilder()
        .setColor(0x00d4ff)
        .setTitle('🎙️ Transcripción Completada')
        .setDescription(transcripcion.substring(0, 4000))
        .addFields(
          { name: '📁 Archivo', value: archivo.name, inline: true },
          { name: '📏 Palabras', value: `~${transcripcion.split(' ').length}`, inline: true }
        )
        .setFooter({ text: 'OpenAI Whisper | Speech-to-Text' })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', error)
      await interaction.editReply('❌ Error al transcribir audio. Verifica el archivo.')
    }
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
