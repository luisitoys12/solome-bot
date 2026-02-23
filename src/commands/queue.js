const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Queue extends Command {
  constructor (client) {
    super(client, {
      name: 'queue',
      aliases: ['q', 'cola', 'lista'],
      description: '📜 Muestra la cola de reproducción actual'
    })
  }

  async runSlash (interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📜 Cola de Reproducción')
      .setDescription('La cola está vacía')
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
