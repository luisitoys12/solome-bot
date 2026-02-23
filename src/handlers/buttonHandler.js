// Sistema completo de manejo de botones - RADIO + MÚSICA
const { EmbedBuilder } = require('discord.js')

class ButtonHandler {
  constructor(client) {
    this.client = client
    this.handlers = new Map()
    this.registerHandlers()
  }

  registerHandlers() {
    // Music buttons (Lavalink)
    this.register('music_pause', this.handleMusicPause.bind(this))
    this.register('music_resume', this.handleMusicResume.bind(this))
    this.register('music_skip', this.handleMusicSkip.bind(this))
    this.register('music_stop', this.handleMusicStop.bind(this))
    this.register('music_queue', this.handleMusicQueue.bind(this))
    this.register('music_shuffle', this.handleMusicShuffle.bind(this))
    this.register('music_loop', this.handleMusicLoop.bind(this))
    this.register('music_volume_up', this.handleMusicVolumeUp.bind(this))
    this.register('music_volume_down', this.handleMusicVolumeDown.bind(this))
    
    // Radio buttons (Local)
    this.register('radio_stop', this.handleRadioStop.bind(this))
    this.register('radio_volume_up', this.handleRadioVolumeUp.bind(this))
    this.register('radio_volume_down', this.handleRadioVolumeDown.bind(this))
    this.register('radio_info', this.handleRadioInfo.bind(this))
    
    // Game buttons
    this.register(/^ttt_\d+_\d+$/, this.handleTicTacToe.bind(this))
    this.register(/^c4_\d+$/, this.handleConnect4.bind(this))
    
    // Other buttons
    this.register('giveaway_join', this.handleGiveawayJoin.bind(this))
    this.register(/^poll_\d+$/, this.handlePollVote.bind(this))
    this.register(/^help_.*/, this.handleHelp.bind(this))
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

  // ==================== MUSIC HANDLERS (LAVALINK) ====================
  
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
        (queue.length > 0 ? `**📊 Próximas ${queue.length}:**\n` +
        queue.map((t, i) => `${i + 1}. [${t.title}](${t.uri}) - \`${this.formatDuration(t.duration)}\``).join('\n') : '🚨 Cola vacía')
      )
      .addFields(
        { name: '📋 Total', value: `${player.queue.size} canciones`, inline: true },
        { name: '⏱️ Duración', value: this.formatDuration(player.queue.duration), inline: true },
        { name: '🔁 Loop', value: player.trackRepeat ? 'Canción' : player.queueRepeat ? 'Cola' : 'Off', inline: true }
      )
      .setFooter({ text: `Mostrando máximo 10 canciones | Node: ${player.node.options.identifier}` })
    
    await interaction.reply({ embeds: [embed], flags: 64 })
  }

  async handleMusicShuffle(interaction) {
    const player = this.client.manager?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    if (player.queue.size < 2) {
      return interaction.reply({ content: '❌ Necesitas al menos 2 canciones', flags: 64 })
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

  // ==================== RADIO HANDLERS (LOCAL) ====================
  
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
    
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⏹️ Radio Detenida')
      .setDescription(`**${data.station.name}** ha sido detenida`)
      .setFooter({ text: `Detenido por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed] })
  }

  async handleRadioVolumeUp(interaction) {
    const radioCommand = this.client.slashCommands.get('radio')
    if (!radioCommand) {
      return interaction.reply({ content: '❌ Comando de radio no disponible', flags: 64 })
    }
    
    const data = radioCommand.connections?.get(interaction.guild.id)
    
    if (!data || !data.resource?.volume) {
      return interaction.reply({ content: '❌ No hay radio reproduciéndose', flags: 64 })
    }
    
    const currentVolume = data.resource.volume.volume
    const newVolume = Math.min(currentVolume + 0.1, 1.0)
    data.resource.volume.setVolume(newVolume)
    
    await interaction.reply({ 
      content: `🔊 Volumen: **${Math.round(newVolume * 100)}%**`, 
      flags: 64 
    })
  }

  async handleRadioVolumeDown(interaction) {
    const radioCommand = this.client.slashCommands.get('radio')
    if (!radioCommand) {
      return interaction.reply({ content: '❌ Comando de radio no disponible', flags: 64 })
    }
    
    const data = radioCommand.connections?.get(interaction.guild.id)
    
    if (!data || !data.resource?.volume) {
      return interaction.reply({ content: '❌ No hay radio reproduciéndose', flags: 64 })
    }
    
    const currentVolume = data.resource.volume.volume
    const newVolume = Math.max(currentVolume - 0.1, 0.0)
    data.resource.volume.setVolume(newVolume)
    
    await interaction.reply({ 
      content: `🔉 Volumen: **${Math.round(newVolume * 100)}%**`, 
      flags: 64 
    })
  }

  async handleRadioInfo(interaction) {
    const radioCommand = this.client.slashCommands.get('radio')
    if (!radioCommand) {
      return interaction.reply({ content: '❌ Comando de radio no disponible', flags: 64 })
    }
    
    const data = radioCommand.connections?.get(interaction.guild.id)
    
    if (!data) {
      return interaction.reply({ content: '❌ No hay radio reproduciéndose', flags: 64 })
    }
    
    const voiceChannel = interaction.guild.channels.cache.get(data.connection.joinConfig.channelId)
    const uptime = Math.floor((Date.now() - data.startTime) / 1000)
    const volume = Math.round((data.resource?.volume?.volume || 0.5) * 100)
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`${data.station.emoji} ${data.station.name}`)
      .setDescription(data.station.description || 'Radio en vivo')
      .addFields(
        { name: '📡 Estado', value: '🔴 EN VIVO', inline: true },
        { name: '🔊 Canal', value: voiceChannel?.name || 'Desconocido', inline: true },
        { name: '🔊 Volumen', value: `${volume}%`, inline: true },
        { name: '⏱️ Tiempo activo', value: this.formatUptime(uptime * 1000), inline: true },
        { name: '👥 Oyentes', value: `${voiceChannel?.members.size || 0}`, inline: true },
        { name: '🎶 Calidad', value: 'Alta', inline: true }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp()
    
    await interaction.reply({ embeds: [embed], flags: 64 })
  }

  // ==================== UTILITY ====================
  
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

  formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    
    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)
    
    return parts.join(' ')
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

  async handleHelp(interaction) {
    const helpCommand = this.client.slashCommands.get('help')
    if (helpCommand && helpCommand.handleMenu) {
      await helpCommand.handleMenu(interaction)
    } else {
      await interaction.deferUpdate()
    }
  }
}

module.exports = ButtonHandler
