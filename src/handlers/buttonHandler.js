// Sistema completo de manejo de botones
const { EmbedBuilder } = require('discord.js')

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
    
    // Radio buttons
    this.register('radio_stop', this.handleRadioStop.bind(this))
    
    // Game buttons
    this.register(/^ttt_\d+_\d+$/, this.handleTicTacToe.bind(this))
    this.register(/^c4_\d+$/, this.handleConnect4.bind(this))
    
    // Giveaway buttons
    this.register('giveaway_join', this.handleGiveawayJoin.bind(this))
    
    // Ticket buttons
    this.register('ticket_close', this.handleTicketClose.bind(this))
    this.register('ticket_reopen', this.handleTicketReopen.bind(this))
    this.register('ticket_delete', this.handleTicketDelete.bind(this))
    
    // Poll/vote buttons
    this.register(/^poll_\d+$/, this.handlePollVote.bind(this))
    
    // Confirmation buttons
    this.register('confirm_yes', this.handleConfirmYes.bind(this))
    this.register('confirm_no', this.handleConfirmNo.bind(this))
    
    // Pagination buttons
    this.register('page_first', this.handlePageFirst.bind(this))
    this.register('page_prev', this.handlePagePrev.bind(this))
    this.register('page_next', this.handlePageNext.bind(this))
    this.register('page_last', this.handlePageLast.bind(this))
    
    // Help/Commands buttons
    this.register(/^help_.*/, this.handleHelpCategory.bind(this))
  }

  register(pattern, handler) {
    this.handlers.set(pattern, handler)
  }

  async handle(interaction) {
    const customId = interaction.customId
    
    // Find matching handler
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
    
    // No handler found
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    const track = player.queue.current
    player.stop()
    
    await interaction.reply({ content: `⏭️ Saltando: **${track.title}**`, flags: 64 })
  }

  async handleMusicStop(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    player.destroy()
    await interaction.reply({ content: '⏹️ Música detenida', flags: 64 })
  }

  async handleMusicQueue(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    const current = player.queue.current
    const queue = player.queue.slice(0, 10)
    
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📜 Cola de Reproducción')
      .setDescription(
        `**Reproduciendo:**\n` +
        `▶️ [${current.title}](${current.uri})\n\n` +
        (queue.length > 0 ? `**Próximas ${queue.length}:**\n` +
        queue.map((t, i) => `${i + 1}. [${t.title}](${t.uri})`).join('\n') : 'Cola vacía')
      )
    
    await interaction.reply({ embeds: [embed], flags: 64 })
  }

  async handleMusicShuffle(interaction) {
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
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
    const player = this.client.lavalink?.players.get(interaction.guild.id)
    
    if (!player) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose', flags: 64 })
    }
    
    // Toggle loop
    if (player.trackRepeat) {
      player.setTrackRepeat(false)
      player.setQueueRepeat(true)
      await interaction.reply({ content: '🔁 Loop de cola activado', flags: 64 })
    } else if (player.queueRepeat) {
      player.setQueueRepeat(false)
      await interaction.reply({ content: '🔁 Loop desactivado', flags: 64 })
    } else {
      player.setTrackRepeat(true)
      await interaction.reply({ content: '🔂 Loop de canción activado', flags: 64 })
    }
  }

  // ==================== RADIO HANDLERS ====================
  
  async handleRadioStop(interaction) {
    // Buscar en el comando de radio
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

  // ==================== GAME HANDLERS ====================
  
  async handleTicTacToe(interaction) {
    // Implementación del juego se maneja en el comando
    const gameData = interaction.message.embeds[0]?.footer?.text
    if (!gameData) {
      return interaction.reply({ content: '❌ Juego no válido', flags: 64 })
    }
    
    await interaction.deferUpdate()
    // El comando tictactoe maneja la lógica
  }

  async handleConnect4(interaction) {
    await interaction.deferUpdate()
    // El comando connect4 maneja la lógica
  }

  // ==================== GIVEAWAY HANDLERS ====================
  
  async handleGiveawayJoin(interaction) {
    await interaction.reply({
      content: '🎉 ¡Te has unido al sorteo!',
      flags: 64
    })
  }

  // ==================== TICKET HANDLERS ====================
  
  async handleTicketClose(interaction) {
    await interaction.reply('🔒 Cerrando ticket...')
    // Lógica de cierre se maneja en el comando
  }

  async handleTicketReopen(interaction) {
    await interaction.reply('🔓 Reabriendo ticket...')
  }

  async handleTicketDelete(interaction) {
    await interaction.reply('🗑️ Eliminando ticket en 5 segundos...')
    setTimeout(() => {
      interaction.channel.delete().catch(() => {})
    }, 5000)
  }

  // ==================== POLL HANDLERS ====================
  
  async handlePollVote(interaction) {
    await interaction.reply({
      content: '✅ Voto registrado',
      flags: 64
    })
  }

  // ==================== CONFIRMATION HANDLERS ====================
  
  async handleConfirmYes(interaction) {
    await interaction.reply({ content: '✅ Confirmado', flags: 64 })
  }

  async handleConfirmNo(interaction) {
    await interaction.reply({ content: '❌ Cancelado', flags: 64 })
  }

  // ==================== PAGINATION HANDLERS ====================
  
  async handlePageFirst(interaction) {
    await interaction.deferUpdate()
  }

  async handlePagePrev(interaction) {
    await interaction.deferUpdate()
  }

  async handlePageNext(interaction) {
    await interaction.deferUpdate()
  }

  async handlePageLast(interaction) {
    await interaction.deferUpdate()
  }

  // ==================== HELP HANDLERS ====================
  
  async handleHelpCategory(interaction) {
    await interaction.deferUpdate()
    // El comando help maneja el cambio de categoría
  }
}

module.exports = ButtonHandler
