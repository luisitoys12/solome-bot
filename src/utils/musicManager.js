// Music Manager - Maneja la conexión con Lavalink
const { Manager } = require('erela.js')
const Spotify = require('erela.js-spotify')
const Deezer = require('erela.js-deezer')
const AppleMusic = require('erela.js-apple')

class MusicManager {
  constructor(client) {
    this.client = client
    this.manager = null
  }

  init(nodes) {
    const clientId = this.client.user.id
    const plugins = []
    
    // Spotify plugin (opcional)
    if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
      plugins.push(
        new Spotify({
          clientID: process.env.SPOTIFY_CLIENT_ID,
          clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        })
      )
    }
    
    // Deezer plugin (opcional)
    if (process.env.DEEZER_DECRYPTION_KEY) {
      plugins.push(new Deezer())
    }
    
    // Apple Music plugin (opcional)
    if (process.env.APPLE_MUSIC_KEY) {
      plugins.push(new AppleMusic())
    }

    this.manager = new Manager({
      nodes: nodes,
      clientId: clientId,
      send: (id, payload) => {
        const guild = this.client.guilds.cache.get(id)
        if (guild) guild.shard.send(payload)
      },
      plugins: plugins
    })

    this.setupEvents()
    return this.manager
  }

  setupEvents() {
    this.manager
      .on('nodeConnect', node => {
        this.client.log('success', `🎵 Lavalink conectado: ${node.options.identifier}`)
      })
      .on('nodeError', (node, error) => {
        this.client.log('error', `Lavalink error [${node.options.identifier}]:`, error)
      })
      .on('trackStart', (player, track) => {
        const channel = this.client.channels.cache.get(player.textChannel)
        if (channel) {
          this.sendNowPlaying(channel, player, track)
        }
      })
      .on('queueEnd', player => {
        const channel = this.client.channels.cache.get(player.textChannel)
        if (channel) {
          channel.send('✅ Cola terminada. Saliendo del canal de voz...')
        }
        player.destroy()
      })
      .on('trackError', (player, track, error) => {
        this.client.log('error', 'Track error:', error)
        const channel = this.client.channels.cache.get(player.textChannel)
        if (channel) {
          channel.send(`❌ Error al reproducir: **${track.title}**`)
        }
      })
      .on('trackStuck', (player, track) => {
        this.client.log('warn', `Track stuck: ${track.title}`)
        player.stop()
      })
  }

  async sendNowPlaying(channel, player, track) {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
    
    // Calcular barra de progreso
    const progress = Math.round((player.position / track.duration) * 20)
    const bar = '▬'.repeat(progress) + '🔘' + '─'.repeat(20 - progress)
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('▶️ Reproduciendo Ahora')
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: '🎤 Artista', value: track.author, inline: true },
        { name: '⏱️ Duración', value: this.formatDuration(track.duration), inline: true },
        { name: '👤 Solicitado por', value: `<@${track.requester.id}>`, inline: true },
        { name: '📊 Progreso', value: `${bar}\n${this.formatDuration(player.position)} / ${this.formatDuration(track.duration)}` }
      )
      .setThumbnail(track.displayThumbnail('maxresdefault'))
      .setFooter({ text: `🎧 ${player.queue.size} en cola | 🔊 Volumen: ${player.volume}%` })
      .setTimestamp()
    
    // Botones de control
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music_previous')
          .setEmoji('⏮️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(player.queue.previous ? false : true),
        new ButtonBuilder()
          .setCustomId(player.paused ? 'music_resume' : 'music_pause')
          .setEmoji(player.paused ? '▶️' : '⏸️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('music_stop')
          .setEmoji('⏹️')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('music_skip')
          .setEmoji('⏭️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(player.queue.size === 0),
        new ButtonBuilder()
          .setCustomId('music_shuffle')
          .setEmoji('🔀')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(player.queue.size < 2)
      )
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music_loop')
          .setEmoji(player.trackRepeat ? '🔂' : player.queueRepeat ? '🔁' : '🔁')
          .setLabel(player.trackRepeat ? 'Canción' : player.queueRepeat ? 'Cola' : 'Loop')
          .setStyle(player.trackRepeat || player.queueRepeat ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_queue')
          .setEmoji('📜')
          .setLabel('Cola')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_lyrics')
          .setEmoji('📝')
          .setLabel('Letras')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_volume_down')
          .setEmoji('🔉')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_volume_up')
          .setEmoji('🔊')
          .setStyle(ButtonStyle.Secondary)
      )
    
    await channel.send({ embeds: [embed], components: [row1, row2] })
  }

  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

module.exports = MusicManager
