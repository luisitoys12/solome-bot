const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Queue extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      description: 'Muestra la cola de reproducción actual'
    })
  }

  async runSlash (interaction) {
    if (!this.client.lavalink) {
      return interaction.reply({ content: '❌ El sistema de música no está disponible.', ephemeral: true })
    }

    const player = this.client.lavalink.getPlayer(interaction.guild.id)
    
    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay ninguna canción en la cola.', ephemeral: true })
    }

    const current = player.queue.current
    const queue = player.queue.tracks.slice(0, 10)

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎵 Cola de Reproducción')
      .setDescription(`**Reproduciendo Ahora:**\n[${current.info.title}](${current.info.uri})\n\`${this.formatDuration(current.info.duration)}\``)

    if (queue.length > 0) {
      const queueList = queue.map((track, i) => 
        `${i + 1}. [${track.info.title}](${track.info.uri}) - \`${this.formatDuration(track.info.duration)}\``
      ).join('\n')
      
      embed.addFields({ name: '📋 Próximas Canciones', value: queueList })
      
      if (player.queue.tracks.length > 10) {
        embed.setFooter({ text: `Y ${player.queue.tracks.length - 10} canciones más...` })
      }
    } else {
      embed.addFields({ name: '📋 Cola', value: 'No hay más canciones en la cola' })
    }

    await interaction.reply({ embeds: [embed] })
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
