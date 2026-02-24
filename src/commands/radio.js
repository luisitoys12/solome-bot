const Command = require('../structures/command.js')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice')

// Estaciones pre-configuradas
const STATIONS = {
  // México
  'los40': 'https://21293.live.streamtheworld.com/LOS40_MEXICO.mp3',
  'beat': 'https://stream.zeno.fm/8gprnu4r6chvv',
  'estacionkus': 'https://stream.zeno.fm/YOUR_STREAM_ID',
  'babaradio': 'https://stream.zeno.fm/YOUR_BABARADIO_ID',
  
  // Internacional
  'bbc1': 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
  'kiss': 'https://stream-mz.planetradio.co.uk/kissnational.mp3',
  'capital': 'https://media-ice.musicradio.com/CapitalUK',
  
  // Latam
  'mega': 'https://unlimited1-cl.dps.live/mega/aac/icecast.audio',
  'rock': 'https://stream.zeno.fm/f3wvbbqmdg8uv',
  'lofi': 'https://streams.ilovemusic.de/iloveradio17.mp3'
}

module.exports = class Radio extends Command {
  constructor (client) {
    super(client, {
      name: 'radio',
      aliases: ['r'],
      description: '📻 Reproduce radio en vivo'
    })
    this.connections = new Map()
  }

  async runSlash (interaction) {
    const estacion = interaction.options.getString('estacion').toLowerCase()
    const fuente = interaction.options.getString('fuente')
    
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: '❌ Debes estar en un canal de voz', flags: 64 })
    }
    
    // Determinar URL
    let url = fuente || STATIONS[estacion]
    
    if (!url) {
      return interaction.reply({ 
        content: `❌ Estación "${estacion}" no encontrada. Estaciones: ${Object.keys(STATIONS).join(', ')}`,
        flags: 64 
      })
    }
    
    try {
      // Detener radio anterior
      const existing = this.connections.get(interaction.guild.id)
      if (existing) {
        existing.player.stop()
        existing.connection.destroy()
      }
      
      // Crear conexión
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator
      })
      
      const player = createAudioPlayer()
      const resource = createAudioResource(url, { inlineVolume: true })
      resource.volume?.setVolume(0.5)
      
      connection.subscribe(player)
      player.play(resource)
      
      this.connections.set(interaction.guild.id, { connection, player, url, station: estacion })
      
      // Auto-reconectar
      player.on(AudioPlayerStatus.Idle, () => {
        const data = this.connections.get(interaction.guild.id)
        if (data) {
          const newResource = createAudioResource(url, { inlineVolume: true })
          newResource.volume?.setVolume(0.5)
          player.play(newResource)
        }
      })
      
      player.on('error', err => {
        this.client.log('error', 'Radio error:', err)
      })
      
      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle('📻 Radio en Vivo')
        .setDescription(`**Estación:** ${estacion}\n**Canal:** ${interaction.member.voice.channel.name}`)
        .addFields(
          { name: '🟢 Estado', value: 'En vivo', inline: true },
          { name: '🔊 Volumen', value: '50%', inline: true }
        )
        .setFooter({ text: `Por ${interaction.user.tag}` })
        .setTimestamp()
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('radio_stop')
            .setEmoji('⏹️')
            .setLabel('Detener')
            .setStyle(ButtonStyle.Danger)
        )
      
      await interaction.reply({ embeds: [embed], components: [row] })
      
    } catch (error) {
      this.client.log('error', 'Radio error:', error)
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`,
        flags: 64 
      }).catch(() => {})
    }
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'estacion',
          description: 'Nombre de estación o stream personalizado',
          required: true,
          autocomplete: false
        },
        {
          type: 3,
          name: 'fuente',
          description: 'URL personalizada (opcional)',
          required: false
        }
      ]
    }
  }
}
