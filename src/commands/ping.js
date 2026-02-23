const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['latencia', 'pong'],
      description: '🏓 Comprueba la latencia del bot'
    })
  }

  async runSlash (interaction) {
    const sent = await interaction.reply({ content: '🏓 Calculando ping...', fetchReply: true })
    const ping = sent.createdTimestamp - interaction.createdTimestamp
    const apiPing = Math.round(this.client.ws.ping)

    const embed = new EmbedBuilder()
      .setColor(ping < 100 ? 0x00ff00 : ping < 300 ? 0xffa500 : 0xff0000)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '⏱️ Latencia', value: `${ping}ms`, inline: true },
        { name: '📡 API', value: `${apiPing}ms`, inline: true },
        { name: '📊 Estado', value: ping < 200 ? '🟢 Excelente' : ping < 400 ? '🟡 Bueno' : '🔴 Lento', inline: true }
      )
      .setFooter({ text: 'Latencia medida en milisegundos' })
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
