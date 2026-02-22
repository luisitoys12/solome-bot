const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['latencia', 'latency'],
      description: 'Muestra la latencia del bot y de la API de Discord'
    })
  }

  async runSlash (interaction) {
    const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true })
    const latency = sent.createdTimestamp - interaction.createdTimestamp
    const apiLatency = Math.round(this.client.ws.ping)

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: '⏱️ Latencia del Bot', value: `${latency}ms`, inline: true },
        { name: '🔗 Latencia de la API', value: `${apiLatency}ms`, inline: true }
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
