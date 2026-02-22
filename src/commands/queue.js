const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Queue extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      aliases: ['q', 'cola'],
      description: 'Muestra la cola de reproducción actual de música'
    })
  }

  async runSlash (interaction) {
    if (!this.client.lavalink) {
      return interaction.reply({ content: '❌ Sistema de música no disponible.', ephemeral: true })
    }

    const player = this.client.lavalink.getPlayer(interaction.guild.id)

    if (!player || !player.queue || player.queue.tracks.length === 0) {
      return interaction.reply({ content: '❌ No hay canciones en la cola.', ephemeral: true })
    }

    const current = player.queue.current
    const queue = player.queue.tracks
    const queueList = queue.slice(0, 10).map((track, i) => 
      `${i + 1}. **${track.info.title}** - ${track.info.author}`
    ).join('\n')

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎶 Cola de Reproducción')
      .setDescription(`**▶️ Reproduciendo:**\n${current.info.title} - ${current.info.author}\n\n**Próximas canciones:**\n${queueList || 'No hay más canciones'}`)
      .addFields(
        { name: '📊 Total', value: `${queue.length} canciones`, inline: true },
        { name: '⏱️ Duración', value: this.formatQueueDuration(queue), inline: true }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  formatQueueDuration(queue) {
    const totalMs = queue.reduce((acc, track) => acc + track.info.duration, 0)
    const minutes = Math.floor(totalMs / 60000)
    return `${minutes} minutos`
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
