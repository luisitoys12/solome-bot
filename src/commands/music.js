const Command = require('../structures/command.js')
const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = class Music extends Command {
  constructor (client) {
    super(client, {
      name: 'music',
      aliases: ['m', 'musica'],
      description: '🎵 Sistema completo de música con YouTube, Spotify y más'
    })
  }

  async runSlash (interaction) {
    const subcommand = interaction.options.getSubcommand()
    
    const actions = {
      'play': () => this.play(interaction),
      'pause': () => this.pause(interaction),
      'resume': () => this.resume(interaction),
      'skip': () => this.skip(interaction),
      'stop': () => this.stop(interaction),
      'queue': () => this.queue(interaction),
      'nowplaying': () => this.nowplaying(interaction),
      'volume': () => this.volume(interaction),
      'loop': () => this.loop(interaction),
      'shuffle': () => this.shuffle(interaction)
    }
    
    if (actions[subcommand]) {
      await actions[subcommand]()
    }
  }

  async play(interaction) {
    await interaction.deferReply()
    
    const query = interaction.options.getString('cancion')
    
    if (!interaction.member.voice.channel) {
      return interaction.editReply('❌ Necesitas estar en un canal de voz')
    }
    
    // Usar client.manager en lugar de client.lavalink
    if (!this.client.manager) {
      return interaction.editReply(
        '❌ El sistema de música no está disponible.\n\n' +
        '🛠️ **Para administradores:**\n' +
        'Verifica que Lavalink esté corriendo en el servidor.'
      )
    }
    
    // Verificar nodos conectados
    const connectedNodes = [...this.client.manager.nodes.values()].filter(n => n.connected)
    if (connectedNodes.length === 0) {
      return interaction.editReply('❌ No hay nodos de Lavalink conectados. Intenta en unos segundos...')
    }
    
    try {
      let player = this.client.manager.players.get(interaction.guild.id)
      
      if (!player) {
        player = this.client.manager.create({
          guild: interaction.guild.id,
          voiceChannel: interaction.member.voice.channel.id,
          textChannel: interaction.channel.id,
          selfDeafen: true,
          volume: 75
        })
      }
      
      if (player.state !== 'CONNECTED') player.connect()
      
      const res = await player.search(query, interaction.user)
      
      if (res.loadType === 'NO_MATCHES' || res.loadType === 'LOAD_FAILED') {
        return interaction.editReply('❌ No se encontraron resultados')
      }
      
      if (res.loadType === 'PLAYLIST_LOADED') {
        player.queue.add(res.tracks)
        
        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle('🎶 Playlist Añadida')
          .setDescription(`**${res.playlist.name}**`)
          .addFields(
            { name: '🎵 Canciones', value: `${res.tracks.length}`, inline: true },
            { name: '⏱️ Duración', value: this.formatDuration(res.tracks.reduce((a, b) => a + b.duration, 0)), inline: true },
            { name: '📜 Cola', value: `${player.queue.size}`, inline: true }
          )
          .setFooter({ text: `Solicitado por ${interaction.user.tag} | Node: ${player.node.options.identifier}` })
          .setTimestamp()
        
        if (!player.playing && !player.paused) player.play()
        
        return interaction.editReply({ embeds: [embed] })
      }
      
      const track = res.tracks[0]
      player.queue.add(track)
      
      const isPlaying = player.playing || player.paused
      
      const embed = new EmbedBuilder()
        .setColor(isPlaying ? 0x5865F2 : 0xFF0000)
        .setTitle(isPlaying ? '🎵 Añadido a la Cola' : '▶️ Reproduciendo Ahora')
        .setDescription(`**[${track.title}](${track.uri})**`)
        .addFields(
          { name: '🎤 Artista', value: track.author || 'Desconocido', inline: true },
          { name: '⏱️ Duración', value: this.formatDuration(track.duration), inline: true },
          { name: '📊 Posición', value: isPlaying ? `#${player.queue.size}` : 'Reproduciendo', inline: true }
        )
        .setThumbnail(track.displayThumbnail('maxresdefault'))
        .setFooter({ text: `Solicitado por ${interaction.user.tag} | Node: ${player.node.options.identifier}` })
        .setTimestamp()
      
      const row = new ActionRowBuilder()
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
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji('⏹️')
            .setLabel('Detener')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('music_queue')
            .setEmoji('📜')
            .setLabel('Cola')
            .setStyle(ButtonStyle.Secondary)
        )
      
      if (!player.playing && !player.paused) player.play()
      
      await interaction.editReply({ embeds: [embed], components: [row] })
      
    } catch (error) {
      this.client.log('error', 'Error en music play:', error)
      await interaction.editReply('❌ Error al reproducir música')
    }
  }

  async pause(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    if (player.paused) {
      return interaction.reply({ content: '❌ La música ya está pausada', flags: 64 })
    }
    
    player.pause(true)
    await interaction.reply('⏸️ Música pausada')
  }

  async resume(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    if (!player.paused) {
      return interaction.reply({ content: '❌ La música no está pausada', flags: 64 })
    }
    
    player.pause(false)
    await interaction.reply('▶️ Música reanudada')
  }

  async skip(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    const current = player.queue.current
    player.stop()
    
    await interaction.reply(`⏭️ Saltando: **${current.title}**`)
  }

  async stop(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    player.destroy()
    await interaction.reply('⏹️ Música detenida y cola limpiada')
  }

  async queue(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || (!player.queue.current && player.queue.size === 0)) {
      return interaction.reply({ content: '❌ La cola está vacía', flags: 64 })
    }
    
    const current = player.queue.current
    const queue = player.queue.slice(0, 10)
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📜 Cola de Reproducción')
      .setDescription(
        `**Reproduciendo ahora:**\n` +
        `▶️ [${current.title}](${current.uri}) - \`${this.formatDuration(current.duration)}\`\n\n` +
        (queue.length > 0 ? `**Próximas ${queue.length}:**\n` + 
        queue.map((t, i) => `${i + 1}. [${t.title}](${t.uri}) - \`${this.formatDuration(t.duration)}\``).join('\n') : '')
      )
      .addFields(
        { name: '📋 Total', value: `${player.queue.size}`, inline: true },
        { name: '⏱️ Duración', value: this.formatDuration(player.queue.duration), inline: true },
        { name: '🔁 Loop', value: player.trackRepeat ? 'Canción' : player.queueRepeat ? 'Cola' : 'Off', inline: true }
      )
      .setFooter({ text: 'Máximo 10 canciones' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async nowplaying(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    const current = player.queue.current
    const position = player.position
    const duration = current.duration
    
    const progress = Math.round((position / duration) * 20)
    const bar = '▬'.repeat(progress) + '🔘' + '─'.repeat(20 - progress)
    
    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('🎵 Reproduciendo Ahora')
      .setDescription(`**[${current.title}](${current.uri})**`)
      .addFields(
        { name: '🎤 Artista', value: current.author, inline: true },
        { name: '⏱️ Duración', value: this.formatDuration(duration), inline: true },
        { name: '🔊 Volumen', value: `${player.volume}%`, inline: true },
        { name: '📊 Progreso', value: `${bar}\n${this.formatDuration(position)} / ${this.formatDuration(duration)}` }
      )
      .setThumbnail(current.displayThumbnail('maxresdefault'))
      .setFooter({ text: `Solicitado por ${current.requester.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async volume(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    const volume = interaction.options.getInteger('nivel')
    
    if (volume < 0 || volume > 200) {
      return interaction.reply({ content: '❌ El volumen debe estar entre 0 y 200', flags: 64 })
    }
    
    player.setVolume(volume)
    await interaction.reply(`🔊 Volumen ajustado a **${volume}%**`)
  }

  async loop(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    const mode = interaction.options.getString('modo')
    
    if (mode === 'off') {
      player.setTrackRepeat(false)
      player.setQueueRepeat(false)
      await interaction.reply('🔁 Loop desactivado')
    } else if (mode === 'track') {
      player.setTrackRepeat(true)
      player.setQueueRepeat(false)
      await interaction.reply('🔂 Loop de canción activado')
    } else if (mode === 'queue') {
      player.setTrackRepeat(false)
      player.setQueueRepeat(true)
      await interaction.reply('🔁 Loop de cola activado')
    }
  }

  async shuffle(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    if (player.queue.size < 2) {
      return interaction.reply({ content: '❌ Necesitas al menos 2 canciones', flags: 64 })
    }
    
    player.queue.shuffle()
    await interaction.reply(`🔀 Cola mezclada (${player.queue.size} canciones)`)
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

  getSlashCommandData() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('play')
          .setDescription('Reproducir una canción')
          .addStringOption(opt =>
            opt
              .setName('cancion')
              .setDescription('Nombre o URL')
              .setRequired(true)
          )
      )
      .addSubcommand(sub => sub.setName('pause').setDescription('Pausar'))
      .addSubcommand(sub => sub.setName('resume').setDescription('Reanudar'))
      .addSubcommand(sub => sub.setName('skip').setDescription('Saltar'))
      .addSubcommand(sub => sub.setName('stop').setDescription('Detener'))
      .addSubcommand(sub => sub.setName('queue').setDescription('Ver cola'))
      .addSubcommand(sub => sub.setName('nowplaying').setDescription('Canción actual'))
      .addSubcommand(sub =>
        sub
          .setName('volume')
          .setDescription('Ajustar volumen')
          .addIntegerOption(opt =>
            opt
              .setName('nivel')
              .setDescription('0-200')
              .setRequired(true)
              .setMinValue(0)
              .setMaxValue(200)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('loop')
          .setDescription('Loop')
          .addStringOption(opt =>
            opt
              .setName('modo')
              .setDescription('Modo')
              .setRequired(true)
              .addChoices(
                { name: '❌ Off', value: 'off' },
                { name: '🔂 Canción', value: 'track' },
                { name: '🔁 Cola', value: 'queue' }
              )
          )
      )
      .addSubcommand(sub => sub.setName('shuffle').setDescription('Mezclar'))
  }
}
