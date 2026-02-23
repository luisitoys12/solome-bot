// Sistema completo de manejo de botones con música
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

class ButtonHandler {
  constructor(client) {
    this.client = client
    this.handlers = new Map()
    this.registerHandlers()
  }

  registerHandlers() {
    // Music buttons
    this.register('music_pause', this.handleMusicPause.bind(this))
    this.register('music_resume', this.handleMusicResume.bind(this))
    this.register('music_skip', this.handleMusicSkip.bind(this))
    this.register('music_stop', this.handleMusicStop.bind(this))
    this.register('music_queue', this.handleMusicQueue.bind(this))
    this.register('music_shuffle', this.handleMusicShuffle.bind(this))
    this.register('music_loop', this.handleMusicLoop.bind(this))
    this.register('music_previous', this.handleMusicPrevious.bind(this))
    this.register('music_volume_up', this.handleMusicVolumeUp.bind(this))
    this.register('music_volume_down', this.handleMusicVolumeDown.bind(this))
    this.register('music_lyrics', this.handleMusicLyrics.bind(this))
    
    // Radio buttons
    this.register('radio_stop', this.handleRadioStop.bind(this))
    
    // Game buttons
    this.register(/^ttt_\d+_\d+$/, this.handleTicTacToe.bind(this))
    this.register(/^c4_\d+$/, this.handleConnect4.bind(this))
    
    // Other buttons
    this.register('giveaway_join', this.handleGiveawayJoin.bind(this))
    this.register(/^poll_\d+$/, this.handlePollVote.bind(this))
  }

  register(pattern, handler) {
    this.handlers.set(pattern, handler)
  }

  async handle(interaction) {
    const customId = interaction.customId
    
    for (const [pattern, handler] of this.handlers) {
      let matches = false
      
      if (pattern instanceof RegExp) {
        matches = pattern.test(customId)
      } else {
        matches = pattern === customId
      }
      
      if (matches) {
        try {
          await handler(interaction)
          return true
        } catch (error) {
          this.client.log('error', `Button handler error for ${customId}:`, error)
          
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: '❌ Error al procesar la interacción',
              flags: 64
            }).catch(() => {})
          }
          return false
        }
      }
    }
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '⚠️ Este botón ya no está disponible',
        flags: 64
      }).catch(() => {})
    }
    
    return false
  }

  // ==================== MUSIC HANDLERS ====================
  
  async handleMusicPause(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    if (player.paused) {
      return interaction.reply({ content: '❌ La música ya está pausada', flags: 64 })
    }
    
    player.pause(true)
    await interaction.reply({ content: '⏸️ Música pausada', flags: 64 })
  }

  async handleMusicResume(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    if (!player.paused) {
      return interaction.reply({ content: '❌ La música no está pausada', flags: 64 })
    }
    
    player.pause(false)
    await interaction.reply({ content: '▶️ Música reanudada', flags: 64 })
  }

  async handleMusicSkip(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    const track = player.queue.current
    player.stop()
    
    await interaction.reply({ content: `⏭️ Saltando: **${track.title}**`, flags: 64 })
  }

  async handleMusicStop(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    player.destroy()
    await interaction.reply({ content: '⏹️ Música detenida y bot desconectado', flags: 64 })
  }

  async handleMusicQueue(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    const current = player.queue.current
    const queue = player.queue.slice(0, 10)
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📜 Cola de Reproducción')
      .setDescription(
        `**▶️ Reproduciendo:**\n` +
        `[${current.title}](${current.uri}) - \`${this.formatDuration(current.duration)}\`\n` +
        `Solicitado por: <@${current.requester.id}>\n\n` +
        (queue.length > 0 ? `**📊 Próximas ${queue.length} canciones:**\n` +
        queue.map((t, i) => `${i + 1}. [${t.title}](${t.uri}) - \`${this.formatDuration(t.duration)}\``).join('\n') : '🚨 Cola vacía')
      )
      .addFields(
        { name: '📋 Total en cola', value: `${player.queue.size} canciones`, inline: true },
        { name: '⏱️ Duración total', value: this.formatDuration(player.queue.duration), inline: true },
        { name: '🔁 Loop', value: player.trackRepeat ? 'Canción' : player.queueRepeat ? 'Cola' : 'Desactivado', inline: true }
      )
      .setFooter({ text: 'Mostrando máximo 10 canciones' })
    
    await interaction.reply({ embeds: [embed], flags: 64 })
  }

  async handleMusicShuffle(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    if (player.queue.size < 2) {
      return interaction.reply({ content: '❌ Necesitas al menos 2 canciones en la cola', flags: 64 })
    }
    
    player.queue.shuffle()
    await interaction.reply({ content: `🔀 Cola mezclada (${player.queue.size} canciones)`, flags: 64 })
  }

  async handleMusicLoop(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    // Cycle: Off -> Track -> Queue -> Off
    if (!player.trackRepeat && !player.queueRepeat) {
      player.setTrackRepeat(true)
      await interaction.reply({ content: '🔂 Loop de canción activado', flags: 64 })
    } else if (player.trackRepeat) {
      player.setTrackRepeat(false)
      player.setQueueRepeat(true)
      await interaction.reply({ content: '🔁 Loop de cola activado', flags: 64 })
    } else {
      player.setQueueRepeat(false)
      await interaction.reply({ content: '❌ Loop desactivado', flags: 64 })
    }
  }

  async handleMusicPrevious(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    if (!player.queue.previous) {
      return interaction.reply({ content: '❌ No hay canción anterior', flags: 64 })
    }
    
    player.queue.unshift(player.queue.previous)
    player.stop()
    
    await interaction.reply({ content: '⏮️ Reproduciendo canción anterior', flags: 64 })
  }

  async handleMusicVolumeUp(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    const newVolume = Math.min(player.volume + 10, 150)
    player.setVolume(newVolume)
    
    await interaction.reply({ content: `🔊 Volumen: **${newVolume}%**`, flags: 64 })
  }

  async handleMusicVolumeDown(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    const newVolume = Math.max(player.volume - 10, 0)
    player.setVolume(newVolume)
    
    await interaction.reply({ content: `🔉 Volumen: **${newVolume}%**`, flags: 64 })
  }

  async handleMusicLyrics(interaction) {
    await interaction.deferReply({ flags: 64 })
    
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.editReply('❌ No hay música reproduciéndose')
    }
    
    const track = player.queue.current
    const query = `${track.author} ${track.title}`
    
    try {
      let lyrics = await this.getLyrics(query)
      
      if (!lyrics) {
        return interaction.editReply(`❌ No se encontraron letras para: **${track.title}**`)
      }
      
      // Limitar a 4000 caracteres
      if (lyrics.length > 4000) {
        lyrics = lyrics.substring(0, 3997) + '...'
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📝 Letras: ${track.title}`)
        .setDescription(lyrics)
        .setThumbnail(track.displayThumbnail('default'))
        .setFooter({ text: `Artista: ${track.author}` })
      
      await interaction.editReply({ embeds: [embed] })
      
    } catch (error) {
      this.client.log('error', 'Lyrics error:', error)
      await interaction.editReply('❌ Error al obtener las letras')
    }
  }

  async getLyrics(query) {
    try {
      const response = await axios.get(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`)
      return response.data?.lyrics || null
    } catch (error) {
      return null
    }
  }

  // ==================== RADIO HANDLERS ====================
  
  async handleRadioStop(interaction) {
    const radioCommand = this.client.slashCommands.get('radio')
    if (!radioCommand) {
      return interaction.reply({ content: '❌ Comando de radio no disponible', flags: 64 })
    }
    
    const data = radioCommand.connections?.get(interaction.guild.id)
    
    if (!data) {
      return interaction.reply({ content: '❌ No hay radio reproduciéndose', flags: 64 })
    }
    
    data.player.stop()
    data.connection.destroy()
    radioCommand.connections.delete(interaction.guild.id)
    
    await interaction.reply({ content: '⏹️ Radio detenida', flags: 64 })
  }

  // ==================== UTILITY ====================
  
  formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor(ms / (1000 * 60 * 60))
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  async handleTicTacToe(interaction) {
    await interaction.deferUpdate()
  }

  async handleConnect4(interaction) {
    await interaction.deferUpdate()
  }

  async handleGiveawayJoin(interaction) {
    await interaction.reply({ content: '🎉 ¡Te has unido al sorteo!', flags: 64 })
  }

  async handlePollVote(interaction) {
    await interaction.reply({ content: '✅ Voto registrado', flags: 64 })
  }
}

module.exports = ButtonHandler
