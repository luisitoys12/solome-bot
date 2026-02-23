const Command = require('../structures/command.js')
const { EmbedBuilder } = require('discord.js')

module.exports = class Ping extends Command {
  constructor (client) {
    super(client, {
      name: 'ping',
      aliases: ['latencia', 'latency'],
      description: '🏓 Verifica la latencia del bot con Discord'
    })
  }

  async runSlash (interaction) {
    const ping = this.client.ws.ping

    const embed = new EmbedBuilder()
      .setColor(ping < 100 ? 0x00ff00 : ping < 200 ? 0xffff00 : 0xff0000)
      .setTitle('🏓 Pong!')
      .setDescription(`**Latencia:** ${ping}ms`)
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
