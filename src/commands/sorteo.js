const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Sorteo extends Command {
  constructor (client) {
    super(client, {
      name: 'sorteo',
      aliases: ['giveaway'],
      description: '🎁 Crea sorteos instantáneos con reacciones'
    })
  }

  async runSlash (interaction) {
    const premio = interaction.options.getString('premio')
    const ganadores = interaction.options.getInteger('ganadores') || 1

    const embed = new EmbedBuilder()
      .setColor(0xff69b4)
      .setTitle('🎉 ¡SORTEO!')
      .setDescription(`**Premio:** ${premio}\n**Ganadores:** ${ganadores}\n\nReacciona con 🎉 para participar!`)
      .setFooter({ text: `Organizado por ${interaction.user.tag}` })
      .setTimestamp()

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true })
    await msg.react('🎉')
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 3,
          name: 'premio',
          description: 'Premio del sorteo',
          required: true
        },
        {
          type: 4,
          name: 'ganadores',
          description: 'Número de ganadores',
          required: false,
          min_value: 1,
          max_value: 20
        }
      ]
    }
  }
}
