const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Tienda extends Command {
  constructor (client) {
    super(client, {
      name: 'tienda',
      aliases: ['shop'],
      description: '🏪 Tienda del servidor - Compra roles, items y ventajas con dinero virtual'
    })
  }

  async runSlash (interaction) {
    const items = [
      { name: '🎨 Rol de Color', precio: 1000 },
      { name: '🌟 VIP 7 días', precio: 5000 },
      { name: '💎 VIP 30 días', precio: 15000 },
      { name: '👑 Premium', precio: 50000 }
    ]

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🏪 Tienda del Servidor')
      .setDescription('Compra items con tu dinero virtual')

    items.forEach(item => {
      embed.addFields({ 
        name: item.name,
        value: `Precio: $${item.precio}`,
        inline: true 
      })
    })

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
