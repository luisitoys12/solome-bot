const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice')
const axios = require('axios')

// Estaciones de radio pre-configuradas
const RADIO_STATIONS = {
  // México
  'babaradio': { url: 'https://stream.zeno.fm/YOUR_STREAM_URL', name: 'BabaRadio', emoji: '📻' },
  'estacionkus': { url: 'https://stream.zeno.fm/YOUR_STREAM_URL', name: 'EstacionKusTV', emoji: '📺' },
  'los40': { url: 'https://21293.live.streamtheworld.com/LOS40_MEXICO.mp3', name: 'Los 40 México', emoji: '🎵' },
  'radiobeatmx': { url: 'https://stream.zeno.fm/8gprnu4r6chvv', name: 'Radio Beat MX', emoji: '🎸' },
  
  // Internacional
  'bbc1': { url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one', name: 'BBC Radio 1', emoji: '🇬🇧' },
  'kiss': { url: 'https://stream-mz.planetradio.co.uk/kissnational.mp3', name: 'Kiss FM', emoji: '💋' },
  'capitalfm': { url: 'https://media-ice.musicradio.com/CapitalUK', name: 'Capital FM', emoji: '🎧' },
  'power106': { url: 'https://stream.revma.ihrhls.com/zc233', name: 'Power 106 FM', emoji: '🔊' },
  
  // Latam
  'mega': { url: 'https://unlimited1-cl.dps.live/mega/aac/icecast.audio', name: 'Mega Chile', emoji: '🇨🇱' },
  'rock101': { url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', name: 'Rock & Pop Chile', emoji: '🤘' },
  'disneyradio': { url: 'https://22363.live.streamtheworld.com/DISNEY_ARG.mp3', name: 'Disney Radio', emoji: '✨' }
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
    
    if (subcommand === 'play') {
      await this.play(interaction)
    } else if (subcommand === 'stop') {
      await this.stop(interaction)
    } else if (subcommand === 'lista') {
      await this.lista(interaction)
    } else if (subcommand === 'custom') {
      await this.custom(interaction)
    }
  }

  async play(interaction) {
    await interaction.deferReply()
    
    const estacion = interaction.options.getString('estacion')
    
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Debes estar en un canal de voz primero')
    }
    
    const station = RADIO_STATIONS[estacion.toLowerCase()]
    
    if (!station) {
      return interaction.editReply(
        '❌ Estación no encontrada. Usa `/radio lista` para ver las disponibles.'
      )
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
      const resource = createAudioResource(station.url)
      
      connection.subscribe(player)
      player.play(resource)
      
      // Guardar conexión
      this.connections.set(interaction.guild.id, { connection, player, station })
      
      // Manejar eventos
      connection.on(VoiceConnectionStatus.Disconnected, () => {
        connection.destroy()
        this.connections.delete(interaction.guild.id)
      })
      
      player.on(AudioPlayerStatus.Idle, () => {
        // Auto-reconectar si se detiene
        const newResource = createAudioResource(station.url)
        player.play(newResource)
      })
      
      player.on('error', error => {
        this.client.log('error', 'Radio player error:', error)
      })
      
      const embed = new EmbedBuilder()
        .setColor(0xFF6B6B)
        .setTitle(`${station.emoji} Reproduciendo Radio`)
        .setDescription(`**${station.name}**`)
        .addFields(
          { name: '📡 Estado', value: 'En vivo', inline: true },
          { name: '🔊 Canal', value: interaction.member.voice.channel.name, inline: true },
          { name: '🎶 Calidad', value: 'Alta (Stream directo)', inline: true }
        )
        .setFooter({ 
          text: `Solicitado por ${interaction.user.tag} • Usa /radio stop para detener`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp()
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', 'Error en radio:', error)
      await interaction.editReply('❌ Error al conectar con la estación de radio.')
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
    
    await interaction.reply('⏹️ Radio detenida')
  }

  async lista(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📻 Estaciones de Radio Disponibles')
      .setDescription('Usa `/radio play estacion:nombre` para reproducir')
    
    // Agrupar por región
    const mexico = Object.entries(RADIO_STATIONS)
      .filter(([_, s]) => ['babaradio', 'estacionkus', 'los40', 'radiobeatmx'].includes(_))
      .map(([key, s]) => `• **${key}** - ${s.emoji} ${s.name}`)
      .join('\n')
    
    const internacional = Object.entries(RADIO_STATIONS)
      .filter(([_, s]) => ['bbc1', 'kiss', 'capitalfm', 'power106'].includes(_))
      .map(([key, s]) => `• **${key}** - ${s.emoji} ${s.name}`)
      .join('\n')
    
    const latam = Object.entries(RADIO_STATIONS)
      .filter(([_, s]) => ['mega', 'rock101', 'disneyradio'].includes(_))
      .map(([key, s]) => `• **${key}** - ${s.emoji} ${s.name}`)
      .join('\n')
    
    if (mexico) embed.addFields({ name: '🇲🇽 México', value: mexico })
    if (internacional) embed.addFields({ name: '🌎 Internacional', value: internacional })
    if (latam) embed.addFields({ name: '🌎 Latinoamérica', value: latam })
    
    embed.addFields({ 
      name: '🔗 Estación Personalizada', 
      value: 'Usa `/radio custom url:tu_url` para reproducir cualquier stream' 
    })
    
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
      const resource = createAudioResource(url)
      
      connection.subscribe(player)
      player.play(resource)
      
      this.connections.set(interaction.guild.id, { 
        connection, 
        player, 
        station: { name: 'Estación Personalizada', url, emoji: '📻' } 
      })
      
      await interaction.editReply('✅ Reproduciendo estación personalizada')
      
    } catch (error) {
      this.client.log('error', 'Error en radio custom:', error)
      await interaction.editReply('❌ Error al reproducir. Verifica que la URL sea un stream de audio válido.')
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
                { name: '📻 BabaRadio', value: 'babaradio' },
                { name: '📺 EstacionKusTV', value: 'estacionkus' },
                { name: '🎵 Los 40 México', value: 'los40' },
                { name: '🎸 Radio Beat MX', value: 'radiobeatmx' },
                { name: '🇬🇧 BBC Radio 1', value: 'bbc1' },
                { name: '💋 Kiss FM', value: 'kiss' },
                { name: '🎧 Capital FM', value: 'capitalfm' },
                { name: '🔊 Power 106', value: 'power106' },
                { name: '🇨🇱 Mega Chile', value: 'mega' },
                { name: '🤘 Rock & Pop', value: 'rock101' },
                { name: '✨ Disney Radio', value: 'disneyradio' }
              )
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('stop')
          .setDescription('Detener la radio')
      )
      .addSubcommand(sub =>
        sub
          .setName('lista')
          .setDescription('Ver todas las estaciones disponibles')
      )
      .addSubcommand(sub =>
        sub
          .setName('custom')
          .setDescription('Reproducir una URL de stream personalizada')
          .addStringOption(opt =>
            opt
              .setName('url')
              .setDescription('URL del stream de audio (http://...)')
              .setRequired(true)
          )
      )
  }
}
