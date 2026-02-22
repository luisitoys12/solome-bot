const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Queue extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      aliases: ['q', 'cola'],
      description: 'Muestra la cola de reproducción actual'
    })
  }

  async runSlash (interaction) {
    if (!this.client.lavalink) {
      return interaction.reply({ content: '❌ Sistema de música no disponible.', ephemeral: true })
    }

    const player = this.client.lavalink.getPlayer(interaction.guild.id)

    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ No hay música reproduciéndose.', ephemeral: true })
    }

    const current = player.queue.current
    const queue = player.queue.tracks

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎵 Cola de Reproducción')
      .setDescription(
        `**Reproduciendo ahora:**\n` +
        `[${current.info.title}](${current.info.uri || 'https://discord.com'})\n` +
        `👤 ${current.info.author} • ⏱️ ${this.formatDuration(current.info.duration)}`
      )
      .setThumbnail(current.info.artworkUrl || null)
      .setFooter({ text: `${queue.length} canciones en cola` })
      .setTimestamp()

    if (queue.length > 0) {
      const upcoming = queue.slice(0, 10).map((track, i) => 
        `**${i + 1}.** [${track.info.title}](${track.info.uri || 'https://discord.com'}) - \`${this.formatDuration(track.info.duration)}\``
      ).join('\n')

      embed.addFields({ name: 'Próximas canciones', value: upcoming })

      if (queue.length > 10) {
        embed.addFields({ name: '\u200b', value: `*...y ${queue.length - 10} canciones más*` })
      }
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

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
