const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['latency', 'ms'],
      description: '🏓 Muestra la latencia del bot y la API de Discord'
    })
  }

  async runSlash (interaction) {
    const sent = await interaction.reply({ content: '🏓 Calculando ping...', fetchReply: true })
    
    const botPing = sent.createdTimestamp - interaction.createdTimestamp
    const apiPing = Math.round(this.client.ws.ping)

    const embed = new EmbedBuilder()
      .setColor(apiPing < 200 ? 0x00ff00 : apiPing < 500 ? 0xfaa61a : 0xff0000)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '🤖 Latencia del Bot', value: `${botPing}ms`, inline: true },
        { name: '📊 API de Discord', value: `${apiPing}ms`, inline: true }
      )
      .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
      .setTimestamp()

    await interaction.editReply({ content: null, embeds: [embed] })
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
