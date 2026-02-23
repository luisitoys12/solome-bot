const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice')

// Estaciones de radio pre-configuradas (ACTUALIZADAS)
const RADIO_STATIONS = {
  // México - TUS ESTACIONES
  'babaradio': { 
    url: 'https://stream.zeno.fm/YOUR_BABARADIO_STREAM_ID', 
    name: 'BabaRadio', 
    emoji: '📻',
    description: 'Radio oficial BabaRadio'
  },
  'estacionkus': { 
    url: 'https://stream.zeno.fm/YOUR_ESTACIONKUS_STREAM_ID', 
    name: 'EstacionKusTV', 
    emoji: '📺',
    description: 'Radio oficial EstacionKusTV'
  },
  'los40': { 
    url: 'https://21293.live.streamtheworld.com/LOS40_MEXICO.mp3', 
    name: 'Los 40 México', 
    emoji: '🎵',
    description: 'Top hits en español'
  },
  'radiobeatmx': { 
    url: 'https://stream.zeno.fm/8gprnu4r6chvv', 
    name: 'Radio Beat MX', 
    emoji: '🎸',
    description: 'Rock y alternativo'
  },
  
  // Internacional
  'bbc1': { 
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', 
    name: 'BBC Radio 1', 
    emoji: '🇬🇧',
    description: 'Top hits internacionales'
  },
  'kiss': { 
    url: 'https://stream-mz.planetradio.co.uk/kissnational.mp3', 
    name: 'Kiss FM', 
    emoji: '💋',
    description: 'Hip-Hop y R&B'
  },
  'capitalfm': { 
    url: 'https://media-ice.musicradio.com/CapitalUK', 
    name: 'Capital FM', 
    emoji: '🎧',
    description: 'Pop y Dance'
  },
  
  // Latam
  'mega': { 
    url: 'https://unlimited1-cl.dps.live/mega/aac/icecast.audio', 
    name: 'Mega Chile', 
    emoji: '🇨🇱',
    description: 'Pop latino'
  },
  'rock101': { 
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', 
    name: 'Rock & Pop', 
    emoji: '🤘',
    description: 'Rock clásico'
  },
  'disney': { 
    url: 'https://22363.live.streamtheworld.com/DISNEY_ARG.mp3', 
    name: 'Disney Radio', 
    emoji: '✨',
    description: 'Música Disney'
  },
  'lofi': {
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3',
    name: 'Lofi Hip Hop',
    emoji: '🎹',
    description: 'Beats relajantes'
  }
}

module.exports = class Radio extends Command {
  constructor (client) {
    super(client, {
      name: 'radio',
      aliases: ['r', 'estacion'],
      description: '📻 Reproduce estaciones de radio en vivo'
    })
    
    // Sistema de reproducción por servidor
    this.connections = new Map()
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    const actions = {
      'play': () => this.play(interaction),
      'stop': () => this.stop(interaction),
      'lista': () => this.lista(interaction),
      'custom': () => this.custom(interaction)
    }
    
    if (actions[subcommand]) {
      await actions[subcommand]()
    }
  }

  async play(interaction) {
    await interaction.deferReply()
    
    const estacion = interaction.options.getString('estacion')
    
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz primero')
    }
    
    // Detener radio anterior si existe
    const existing = this.connections.get(interaction.guild.id)
    if (existing) {
      existing.player.stop()
      existing.connection.destroy()
      this.connections.delete(interaction.guild.id)
    }
    
    const station = RADIO_STATIONS[estacion.toLowerCase()]
    
    if (!station) {
      return interaction.editReply('❌ Estación no encontrada. Usa `/radio lista`')
    }
    
    try {
      // Crear conexión de voz
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false
      })
      
      // Crear player
      const player = createAudioPlayer()
      const resource = createAudioResource(station.url, {
        inlineVolume: true
      })
      
      // Configurar volumen inicial
      resource.volume?.setVolume(0.5)
      
      connection.subscribe(player)
      player.play(resource)
      
      // Guardar conexión
      this.connections.set(interaction.guild.id, { 
        connection, 
        player, 
        station,
        resource,
        startTime: Date.now()
      })
      
      // Manejar eventos
      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            once(connection, VoiceConnectionStatus.Signalling, { timeout: 5000 }),
            once(connection, VoiceConnectionStatus.Connecting, { timeout: 5000 }),
          ])
        } catch (error) {
          connection.destroy()
          this.connections.delete(interaction.guild.id)
        }
      })
      
      player.on(AudioPlayerStatus.Idle, () => {
        // Auto-reconectar si se detiene
        const data = this.connections.get(interaction.guild.id)
        if (data) {
          const newResource = createAudioResource(station.url, { inlineVolume: true })
          newResource.volume?.setVolume(0.5)
          player.play(newResource)
          data.resource = newResource
        }
      })
      
      player.on('error', error => {
        this.client.log('error', 'Radio player error:', error)
        const channel = interaction.channel
        if (channel) {
          channel.send('❌ Error en el stream de radio. Reconectando...').catch(() => {})
        }
      })
      
      // Embed con información
      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle(`${station.emoji} Reproduciendo Radio`)
        .setDescription(
          `**${station.name}**\n` +
          `*${station.description}*`
        )
        .addFields(
          { name: '📡 Estado', value: '🔴 EN VIVO', inline: true },
          { name: '🔊 Canal', value: interaction.member.voice.channel.name, inline: true },
          { name: '🎶 Calidad', value: 'Alta', inline: true },
          { name: '⏱️ Iniciado', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
          { name: '👥 Oyentes', value: `${interaction.member.voice.channel.members.size}`, inline: true },
          { name: '🔊 Volumen', value: '50%', inline: true }
        )
        .setFooter({ 
          text: `Solicitado por ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp()
      
      // Botones de control
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('radio_stop')
            .setEmoji('⏹️')
            .setLabel('Detener')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('radio_volume_up')
            .setEmoji('🔊')
            .setLabel('Vol+')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('radio_volume_down')
            .setEmoji('🔉')
            .setLabel('Vol-')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('radio_info')
            .setEmoji('ℹ️')
            .setLabel('Info')
            .setStyle(ButtonStyle.Primary)
        )
      
      await interaction.editReply({ embeds: [embed], components: [row] })
      
    } catch (error) {
      this.client.log('error', 'Error en radio:', error)
      await interaction.editReply('❌ Error al conectar con la estación. Verifica que la URL sea válida.')
    }
  }

  async stop(interaction) {
    const data = this.connections.get(interaction.guild.id)
    
    if (!data) {
      return interaction.reply({ content: '❌ No hay radio reproduciéndose.', flags: 64 })
    }
    
    data.player.stop()
    data.connection.destroy()
    this.connections.delete(interaction.guild.id)
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⏹️ Radio Detenida')
      .setDescription(`**${data.station.name}** ha sido detenida`)
      .setFooter({ text: `Detenido por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async lista(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📻 Estaciones de Radio Disponibles')
      .setDescription('Usa `/radio play estacion:nombre` para reproducir\n')
    
    // Agrupar por región
    const mexico = []
    const internacional = []
    const latam = []
    const otros = []
    
    Object.entries(RADIO_STATIONS).forEach(([key, s]) => {
      const line = `▪️ **${key}** ${s.emoji} - *${s.name}*\n   ${s.description}`
      
      if (['babaradio', 'estacionkus', 'los40', 'radiobeatmx'].includes(key)) {
        mexico.push(line)
      } else if (['bbc1', 'kiss', 'capitalfm'].includes(key)) {
        internacional.push(line)
      } else if (['mega', 'rock101', 'disney'].includes(key)) {
        latam.push(line)
      } else {
        otros.push(line)
      }
    })
    
    if (mexico.length) embed.addFields({ name: '🇲🇽 México', value: mexico.join('\n\n') })
    if (internacional.length) embed.addFields({ name: '🌎 Internacional', value: internacional.join('\n\n') })
    if (latam.length) embed.addFields({ name: '🌎 Latinoamérica', value: latam.join('\n\n') })
    if (otros.length) embed.addFields({ name: '🎵 Otros', value: otros.join('\n\n') })
    
    embed.addFields({ 
      name: '🔗 Estación Personalizada', 
      value: 'Usa `/radio custom url:tu_url` para cualquier stream' 
    })
    
    embed.setFooter({ text: `Total: ${Object.keys(RADIO_STATIONS).length} estaciones disponibles` })
    
    await interaction.reply({ embeds: [embed] })
  }

  async custom(interaction) {
    await interaction.deferReply()
    
    const url = interaction.options.getString('url')
    
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz')
    }
    
    if (!url.startsWith('http')) {
      return interaction.editReply('❌ URL inválida. Debe comenzar con http:// o https://')
    }
    
    try {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: true
      })
      
      const player = createAudioPlayer()
      const resource = createAudioResource(url, { inlineVolume: true })
      resource.volume?.setVolume(0.5)
      
      connection.subscribe(player)
      player.play(resource)
      
      this.connections.set(interaction.guild.id, { 
        connection, 
        player,
        resource,
        station: { name: 'Estación Personalizada', url, emoji: '📻', description: 'Stream personalizado' },
        startTime: Date.now()
      })
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📻 Reproduciendo Estación Personalizada')
        .setDescription(`Stream: \`${url.substring(0, 50)}...\``)
        .addFields(
          { name: '🔊 Canal', value: interaction.member.voice.channel.name, inline: true },
          { name: '📡 Estado', value: 'En vivo', inline: true }
        )
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('radio_stop')
            .setEmoji('⏹️')
            .setLabel('Detener')
            .setStyle(ButtonStyle.Danger)
        )
      
      await interaction.editReply({ embeds: [embed], components: [row] })
      
    } catch (error) {
      this.client.log('error', 'Error en radio custom:', error)
      await interaction.editReply('❌ Error al reproducir. Verifica que la URL sea válida.')
    }
  }

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('play')
          .setDescription('Reproducir una estación de radio')
          .addStringOption(opt =>
            opt
              .setName('estacion')
              .setDescription('Nombre de la estación')
              .setRequired(true)
              .addChoices(
                ...Object.entries(RADIO_STATIONS).map(([key, s]) => ({
                  name: `${s.emoji} ${s.name}`,
                  value: key
                }))
              )
          )
      )
      .addSubcommand(sub => sub.setName('stop').setDescription('Detener la radio'))
      .addSubcommand(sub => sub.setName('lista').setDescription('Ver todas las estaciones'))
      .addSubcommand(sub =>
        sub
          .setName('custom')
          .setDescription('Reproducir stream personalizado')
          .addStringOption(opt =>
            opt.setName('url').setDescription('URL del stream').setRequired(true)
          )
      )
  }
}

function once(emitter, event, options) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), options?.timeout || 5000)
    emitter.once(event, (...args) => {
      clearTimeout(timeout)
      resolve(args)
    })
  })
}
