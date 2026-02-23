// Lavalink Manager - Local + Public nodes
const { Manager } = require('erela.js')

class LavalinkManager {
  constructor(client) {
    this.client = client
    this.manager = null
  }

  init() {
    // Nodos configurados: Local + Públicos de respaldo
    const nodes = [
      // TU LAVALINK LOCAL (Prioridad 1)
      {
        identifier: 'Local-VPS',
        host: process.env.LAVALINK_HOST || 'localhost',
        port: parseInt(process.env.LAVALINK_PORT) || 2333,
        password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
        secure: false,
        retryAmount: 5,
        retryDelay: 3000
      },
      // Lavalink Público 1 (Respaldo)
      {
        identifier: 'Public-1',
        host: 'lava.link',
        port: 80,
        password: 'anything',
        secure: false,
        retryAmount: 3,
        retryDelay: 5000
      },
      // Lavalink Público 2 (Respaldo)
      {
        identifier: 'Public-2',
        host: 'lavalink.oops.wtf',
        port: 443,
        password: 'www.freelavalink.ga',
        secure: true,
        retryAmount: 3,
        retryDelay: 5000
      },
      // Lavalink Público 3 (Respaldo)
      {
        identifier: 'Public-3',
        host: 'lavalink-repl.mrsparta.repl.co',
        port: 443,
        password: 'sparta',
        secure: true,
        retryAmount: 3,
        retryDelay: 5000
      }
    ]

    this.manager = new Manager({
      nodes: nodes,
      send: (id, payload) => {
        const guild = this.client.guilds.cache.get(id)
        if (guild) guild.shard.send(payload)
      },
      autoPlay: true
    })

    this.setupEvents()
    return this.manager
  }

  setupEvents() {
    this.manager
      .on('nodeConnect', node => {
        this.client.log('success', `🎵 Lavalink conectado: ${node.options.identifier} (${node.options.host}:${node.options.port})`)
      })
      .on('nodeError', (node, error) => {
        this.client.log('error', `Lavalink error [${node.options.identifier}]:`, error.message)
      })
      .on('nodeDisconnect', (node, reason) => {
        this.client.log('warn', `Lavalink desconectado [${node.options.identifier}]: ${reason}`)
      })
      .on('nodeReconnect', node => {
        this.client.log('info', `Reconectando a ${node.options.identifier}...`)
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
          channel.send('✅ Cola terminada. Saliendo del canal de voz...').catch(() => {})
        }
        setTimeout(() => player.destroy(), 3000)
      })
      .on('trackError', (player, track, error) => {
        this.client.log('error', 'Track error:', error)
        const channel = this.client.channels.cache.get(player.textChannel)
        if (channel) {
          channel.send(`❌ Error al reproducir: **${track.title}** - Intentando siguiente...`).catch(() => {})
        }
      })
      .on('trackStuck', (player, track, threshold) => {
        this.client.log('warn', `Track stuck: ${track.title} (${threshold}ms)`)
        player.stop()
      })
      .on('playerCreate', player => {
        this.client.log('debug', `Player creado en ${player.guild}`)
      })
      .on('playerDestroy', player => {
        this.client.log('debug', `Player destruido en ${player.guild}`)
      })
  }

  async sendNowPlaying(channel, player, track) {
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
    
    // Barra de progreso
    const progress = Math.round((player.position / track.duration) * 20)
    const bar = '▬'.repeat(Math.max(0, progress)) + '🔘' + '─'.repeat(Math.max(0, 20 - progress))
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('▶️ Reproduciendo Ahora')
      .setDescription(`**[${track.title}](${track.uri})**`)
      .addFields(
        { name: '🎤 Artista', value: track.author || 'Desconocido', inline: true },
        { name: '⏱️ Duración', value: this.formatDuration(track.duration), inline: true },
        { name: '👤 Solicitado por', value: `<@${track.requester.id}>`, inline: true }
      )
    
    // Solo agregar progreso si es relevante
    if (track.duration < 3600000) { // Menos de 1 hora
      embed.addFields({
        name: '📊 Progreso',
        value: `${bar}\n${this.formatDuration(player.position)} / ${this.formatDuration(track.duration)}`
      })
    }
    
    embed.setThumbnail(track.displayThumbnail('maxresdefault'))
    embed.setFooter({ 
      text: `🎧 ${player.queue.size} en cola | 🔊 Vol: ${player.volume}% | Node: ${player.node.options.identifier}` 
    })
    embed.setTimestamp()
    
    // Botones de control
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music_pause')
          .setEmoji('⏸️')
          .setLabel('Pausar')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('music_skip')
          .setEmoji('⏭️')
          .setLabel('Saltar')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(player.queue.size === 0),
        new ButtonBuilder()
          .setCustomId('music_stop')
          .setEmoji('⏹️')
          .setLabel('Detener')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('music_shuffle')
          .setEmoji('🔀')
          .setLabel('Mezclar')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(player.queue.size < 2)
      )
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('music_loop')
          .setEmoji(player.trackRepeat ? '🔂' : player.queueRepeat ? '🔁' : '🔁')
          .setLabel('Loop')
          .setStyle(player.trackRepeat || player.queueRepeat ? ButtonStyle.Success : ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('music_queue')
          .setEmoji('📜')
          .setLabel('Cola')
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
    
    await channel.send({ embeds: [embed], components: [row1, row2] }).catch(() => {})
  }

  formatDuration(ms) {
    if (!ms || ms === 0) return '0:00'
    
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

module.exports = LavalinkManager
