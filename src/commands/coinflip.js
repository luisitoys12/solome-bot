const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class CoinFlip extends Command {
  constructor (client) {
    super(client, {
      name: 'coinflip',
      aliases: ['moneda', 'flip'],
      description: '🪙 Lanza una moneda'
    })
  }

  async runSlash (interaction) {
    const resultado = Math.random() < 0.5 ? 'Cara' : 'Cruz'
    const emoji = resultado === 'Cara' ? '😀' : '💀'
    
    const embed = new EmbedBuilder()
      .setColor(resultado === 'Cara' ? 0xFFD700 : 0xC0C0C0)
      .setTitle('🪙 Lanzamiento de Moneda')
      .setDescription(`**${emoji} ¡${resultado}!**`)
      .setFooter({ text: `Lanzado por ${interaction.user.tag}` })
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
