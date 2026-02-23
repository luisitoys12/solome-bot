const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')
const { load, save } = require('../utils/database.js')

function getBalance(userId) {
  const economy = load('economy', {})
  return economy[userId] || { coins: 0, bank: 0 }
}

module.exports = class Balance extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      aliases: ['bal', 'dinero', 'money'],
      description: '💰 Consulta tu balance de monedas y banco'
    })
  }

  async runSlash (interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user
    const data = getBalance(targetUser.id)

    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`💰 Balance de ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '💵 Efectivo', value: `${data.coins.toLocaleString()} monedas`, inline: true },
        { name: '🏦 Banco', value: `${data.bank.toLocaleString()} monedas`, inline: true },
        { name: '📊 Total', value: `${(data.coins + data.bank).toLocaleString()} monedas`, inline: true }
      )
      .setFooter({ text: 'Usa /work para ganar más monedas' })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description,
      options: [
        {
          type: 6,
          name: 'usuario',
          description: 'Usuario a consultar (opcional)',
          required: false
        }
      ]
    }
  }
}
