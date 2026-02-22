const Command = require('../structures/command.js')

module.exports = class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['latency', 'latencia'],
      description: 'Muestra la latencia del bot'
    })
  }

  async runSlash (interaction) {
    const sent = await interaction.reply({ content: '🏓 Pong...', fetchReply: true })
    const timeDiff = sent.createdTimestamp - interaction.createdTimestamp
    const wsLatency = this.client.ws.ping

    await interaction.editReply(
      `🏓 **Pong!**\n` +
      `⏱️ Latencia del mensaje: **${timeDiff}ms**\n` +
      `💓 Latencia del WebSocket: **${wsLatency}ms**`
    )
  }

  getSlashCommandData() {
    return {
      name: this.name,
      description: this.description
    }
  }
}
