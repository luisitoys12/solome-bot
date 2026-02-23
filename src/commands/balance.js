const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load } = require('../utils/database.js')

module.exports = class Balance extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      aliases: ['bal', 'dinero', 'money'],
      description: '💰 Consulta tu balance de monedas del servidor'
    })
  }

  async runSlash (interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const economy = load('economy', {})
    const balance = economy[targetUser.id] || 0

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle('💰 Balance')
      .setDescription(`**${targetUser.username}** tiene **${balance}** monedas`)
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        { type: 6, name: 'usuario', description: 'Usuario a consultar (opcional)', required: false }
      ]
    }
  }
}
