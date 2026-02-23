const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Queue extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      aliases: ['q', 'cola'],
      description: '📜 Muestra la cola de reproducción actual'
    })
  }

  async runSlash (interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📜 Cola de Reproducción')
      .setDescription('No hay canciones en la cola.')
      .addFields(
        { name: '🎵 Total', value: '0 canciones', inline: true },
        { name: '⏱️ Duración', value: '0:00', inline: true }
      )
      .setFooter({ text: 'Usa /play para agregar canciones' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
