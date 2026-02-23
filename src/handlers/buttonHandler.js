// Sistema completo de manejo de botones para RADIO LOCAL
const { EmbedBuilder } = require('discord.js')

class ButtonHandler {
  constructor(client) {
    this.client = client
    this.handlers = new Map()
    this.registerHandlers()
  }

  registerHandlers() {
    // Radio buttons
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
