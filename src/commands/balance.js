const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Balance extends Command {
  constructor (client) {
    super(client, {
      name: 'balance',
      aliases: ['bal', 'dinero', 'money'],
      description: '💰 Muestra tu balance de monedas del servidor'
    })
  }

  async runSlash (interaction) {
    const usuario = interaction.options.getUser('usuario') || interaction.user
    
    // Simular balance (en producción usar base de datos)
    const balance = Math.floor(Math.random() * 10000) + 100
    const banco = Math.floor(Math.random() * 50000)
    const total = balance + banco
    
    const embed = new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle(`💰 Balance de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL())
      .addFields(
        { name: '💵 Efectivo', value: `$${balance.toLocaleString()}`, inline: true },
        { name: '🏦 Banco', value: `$${banco.toLocaleString()}`, inline: true },
        { name: '📊 Total', value: `$${total.toLocaleString()}`, inline: true }
      )
      .setFooter({ text: 'Sistema de economía de Solome Bot' })
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
