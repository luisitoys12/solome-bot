const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Tienda extends Command {
  constructor (client) {
    super(client, {
      name: 'tienda',
      aliases: ['shop', 'store'],
      description: '🏪 Compra items y mejoras con tus monedas'
    })
  }

  async runSlash (interaction) {
    const items = [
      { name: '🎂 Boost de XP', precio: 500, emoji: '🚀' },
      { name: '💰 Multiplicador de monedas', precio: 1000, emoji: '💸' },
      { name: '🏆 Rango VIP', precio: 5000, emoji: '⭐' },
      { name: '🐾 Mascota Premium', precio: 2000, emoji: '💎' }
    ]

    const embed = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle('🏪 Tienda')
      .setDescription(
        items.map((item, i) => 
          `**${i + 1}.** ${item.emoji} ${item.name} - **${item.precio}** monedas`
        ).join('\n')
      )
      .setFooter({ text: 'Sistema de tienda próximamente' })

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
