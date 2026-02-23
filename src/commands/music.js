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
    
    if (!this.client.lavalink) {
      return interaction.editReply(
        '❌ El sistema de música no está disponible.\n\n' +
        '🛠️ **Para administradores:**\n' +
        'Configura Lavalink en el archivo .env y reinicia el bot.'
      )
    }
    
    try {
      let player = this.client.lavalink.players.get(interaction.guild.id)
      
      if (!player) {
        player = this.client.lavalink.create({
          guild: interaction.guild.id,
          voiceChannel: interaction.member.voice.channel.id,
          textChannel: interaction.channel.id,
          selfDeafen: true,
          volume: 100
        })
      }
      
      if (player.state !== 'CONNECTED') player.connect()
      
      // Buscar canción
      const res = await player.search(query, interaction.user)
      
      if (!res || res.loadType === 'NO_MATCHES') {
        return interaction.editReply('❌ No se encontraron resultados para tu búsqueda')
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
            { name: '📄 Cola', value: `${player.queue.size} canciones`, inline: true }
          )
          .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
          .setTimestamp()
        
        if (!player.playing && !player.paused) player.play()
        
        return interaction.editReply({ embeds: [embed] })
      }
      
      const track = res.tracks[0]
      player.queue.add(track)
      
      const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(player.playing ? '🎵 Añadido a la cola' : '▶️ Reproduciendo ahora')
        .setDescription(`**${track.title}**`)
        .addFields(
          { name: '🎤 Artista', value: track.author, inline: true },
          { name: '⏱️ Duración', value: this.formatDuration(track.duration), inline: true },
          { name: '📊 Posición', value: `#${player.queue.size}`, inline: true }
        )
        .setThumbnail(track.displayThumbnail())
        .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
        .setTimestamp()
      
      if (!player.playing && !player.paused) player.play()
      
      // Botones de control
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('music_pause')
            .setEmoji('⏸️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('music_skip')
            .setEmoji('⏭️')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('music_stop')
            .setEmoji('⏹️')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('music_queue')
            .setEmoji('📜')
            .setStyle(ButtonStyle.Secondary)
        )
      
      await interaction.editReply({ embeds: [embed], components: [row] })
      
    } catch (error) {
      this.client.log('error', 'Error en music play:', error)
      await interaction.editReply('❌ Error al reproducir música')
    }
  }

  async pause(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    if (!player.queue.current) {
      return interaction.reply({ content: '❌ No hay canciones en la cola', flags: 64 })
    }
    
    const current = player.queue.current
    player.stop()
    
    await interaction.reply(`⏭️ Saltando: **${current.title}**`)
  }

  async stop(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    player.destroy()
    await interaction.reply('⏹️ Música detenida y cola limpiada')
  }

  async queue(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    if (!player.queue.current && player.queue.size === 0) {
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
        (queue.length > 0 ? `**Próximas ${queue.length} canciones:**\n` + 
        queue.map((t, i) => `${i + 1}. [${t.title}](${t.uri}) - \`${this.formatDuration(t.duration)}\``).join('\n') : '')
      )
      .addFields(
        { name: '📊 Total en cola', value: `${player.queue.size} canciones`, inline: true },
        { name: '⏱️ Duración total', value: this.formatDuration(player.queue.duration), inline: true },
        { name: '🔁 Loop', value: player.trackRepeat ? 'Canción' : player.queueRepeat ? 'Cola' : 'Desactivado', inline: true }
      )
      .setFooter({ text: 'Mostrando máximo 10 canciones' })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async nowplaying(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
      .setThumbnail(current.displayThumbnail())
      .setFooter({ text: `Solicitado por ${current.requester.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async volume(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay nada reproduciéndose', flags: 64 })
    }
    
    if (player.queue.size < 2) {
      return interaction.reply({ content: '❌ Necesitas al menos 2 canciones en la cola', flags: 64 })
    }
    
    player.queue.shuffle()
    await interaction.reply(`🔀 Cola mezclada (${player.queue.size} canciones)`)
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
              .setDescription('Nombre o URL de la canción')
              .setRequired(true)
          )
      )
      .addSubcommand(sub => sub.setName('pause').setDescription('Pausar la música'))
      .addSubcommand(sub => sub.setName('resume').setDescription('Reanudar la música'))
      .addSubcommand(sub => sub.setName('skip').setDescription('Saltar la canción actual'))
      .addSubcommand(sub => sub.setName('stop').setDescription('Detener y limpiar la cola'))
      .addSubcommand(sub => sub.setName('queue').setDescription('Ver la cola de reproducción'))
      .addSubcommand(sub => sub.setName('nowplaying').setDescription('Ver la canción actual'))
      .addSubcommand(sub =>
        sub
          .setName('volume')
          .setDescription('Ajustar el volumen')
          .addIntegerOption(opt =>
            opt
              .setName('nivel')
              .setDescription('Nivel de volumen (0-200)')
              .setRequired(true)
              .setMinValue(0)
              .setMaxValue(200)
          )
      )
      .addSubcommand(sub =>
        sub
          .setName('loop')
          .setDescription('Activar/desactivar loop')
          .addStringOption(opt =>
            opt
              .setName('modo')
              .setDescription('Modo de loop')
              .setRequired(true)
              .addChoices(
                { name: '❌ Desactivado', value: 'off' },
                { name: '🔂 Canción actual', value: 'track' },
                { name: '🔁 Toda la cola', value: 'queue' }
              )
          )
      )
      .addSubcommand(sub => sub.setName('shuffle').setDescription('Mezclar la cola'))
  }
}
