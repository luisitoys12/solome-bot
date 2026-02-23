const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class PremiumRadio extends Command {
  constructor (client) {
    super(client, {
      name: 'premium-radio',
      aliases: ['pradio'],
      description: '📻 Acceso a estaciones de radio premium y exclusivas'
    })
  }

  async runSlash (interaction) {
    const busqueda = interaction.options.getString('busqueda')

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('📻 Radio Premium')
      .setDescription(`Buscando estaciones premium: **${busqueda}**\n\nSistema premium próximamente`)

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 3, name: 'busqueda', description: 'Buscar en estaciones premium', required: true }
      ]
    }
  }
}
