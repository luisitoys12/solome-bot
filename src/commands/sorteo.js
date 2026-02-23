const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Sorteo extends Command {
  constructor (client) {
    super(client, {
      name: 'sorteo',
      aliases: ['giveaway'],
      description: '🎉 Crea un sorteo en el servidor'
    })
  }

  async runSlash (interaction) {
    const premio = interaction.options.getString('premio')
    const ganadores = interaction.options.getInteger('ganadores') || 1

    const embed = new EmbedBuilder()
      .setColor(0xff00ff)
      .setTitle('🎉 Sorteo')
      .setDescription(
        `**Premio:** ${premio}\n` +
        `**Ganadores:** ${ganadores}\n\n` +
        `Reacciona con 🎉 para participar!`
      )
      .setFooter({ text: 'Sistema de sorteos próximamente' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'premio', description: 'Premio del sorteo', required: true },
        { type: 4, name: 'ganadores', description: 'Número de ganadores', required: false, min_value: 1, max_value: 20 }
      ]
    }
  }
}
